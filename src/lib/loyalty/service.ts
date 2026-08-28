import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  generateLoyaltyCardCode,
  generateLoyaltyPublicToken,
  resolveScannedLoyaltyPayload,
} from "@/src/lib/loyalty/code";
import { LoyaltyServiceError } from "@/src/lib/loyalty/errors";
import {
  mapCardRecord,
  mapProgramSettings,
  mapRewardRow,
  mapTransactionRow,
  type LoyaltyCardRow,
  type LoyaltyRewardRow,
  type LoyaltySettingsRow,
  type LoyaltyTransactionRow,
} from "@/src/lib/loyalty/map";
import {
  parseCreateLoyaltyClientInput,
  parseLoyaltyRewardInput,
  parseLoyaltySettingsInput,
  parsePatchLoyaltyRewardInput,
  parsePurchaseAmountCents,
  parseRedeemLoyaltyInput,
  type CreateLoyaltyClientInput,
} from "@/src/lib/loyalty/schemas";
import type {
  LoyaltyCardRecord,
  LoyaltyKpis,
  LoyaltyProgramSettings,
  LoyaltyReward,
} from "@/src/lib/loyalty/types";

const CARD_SELECT =
  "id, restaurant_id, customer_id, card_code, public_token, points_balance, status, last_visit_at, created_at, customers (id, full_name, email, phone)";
const REWARD_SELECT = "id, restaurant_id, title, description, points_required, active, sort_index, created_at";
const TRANSACTION_SELECT =
  "id, type, purchase_amount_cents, points_delta, balance_after, reward_id, reward_title_snapshot, note, created_at";
const SETTINGS_SELECT =
  "loyalty_program_type, loyalty_spend_amount_cents, loyalty_points_per_spend, loyalty_signup_bonus_points, loyalty_points_expiration";
const CODE_ATTEMPTS = 6;

const RPC_ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "Non autorisé.",
  not_found: "Cette carte n’existe pas.",
  disabled: "Cette carte est désactivée.",
  invalid_amount: "Le montant doit être supérieur à 0.",
  reward_not_found: "Cette récompense n’existe pas.",
  reward_inactive: "Cette récompense n’est plus active.",
  insufficient_points: "Le client n’a pas assez de points.",
};

function publicError(error: { message?: string } | null, fallback: string): string {
  const message = error?.message?.trim() ?? "";
  if (/does not exist|schema cache|could not find/i.test(message)) {
    return "Le module fidélité n’est pas encore disponible. Appliquez la migration puis réessayez.";
  }
  return fallback;
}

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  return error?.code === "23505" || /duplicate key|unique constraint/i.test(error?.message ?? "");
}

function zodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Requête invalide.";
}

function rpcErrorMessage(code: string): string {
  return RPC_ERROR_MESSAGES[code] ?? "Impossible de mettre à jour cette carte.";
}

export async function getLoyaltySettings(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<LoyaltyProgramSettings> {
  const { data, error } = await supabase
    .from("restaurant_settings")
    .select(SETTINGS_SELECT)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  if (error) {
    throw new LoyaltyServiceError(publicError(error, "Impossible de charger les réglages fidélité."), 500);
  }
  return mapProgramSettings((data as LoyaltySettingsRow | null) ?? null);
}

export async function updateLoyaltySettings(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: unknown,
): Promise<LoyaltyProgramSettings> {
  let input;
  try {
    input = parseLoyaltySettingsInput(payload);
  } catch (error) {
    if (error instanceof ZodError) throw new LoyaltyServiceError(zodMessage(error), 400);
    throw error;
  }

  const patch: Record<string, unknown> = { restaurant_id: restaurantId };
  if (input.programType != null) patch.loyalty_program_type = input.programType;
  if (input.spendAmountCents != null) patch.loyalty_spend_amount_cents = input.spendAmountCents;
  if (input.pointsPerSpend != null) patch.loyalty_points_per_spend = input.pointsPerSpend;
  if (input.signupBonusPoints != null) patch.loyalty_signup_bonus_points = input.signupBonusPoints;
  if (input.pointsExpiration != null) patch.loyalty_points_expiration = input.pointsExpiration;

  if (Object.keys(patch).length === 1) {
    return getLoyaltySettings(supabase, restaurantId);
  }

  const { error } = await supabase.from("restaurant_settings").upsert(patch, { onConflict: "restaurant_id" });
  if (error) {
    throw new LoyaltyServiceError(publicError(error, "Impossible d’enregistrer les réglages fidélité."), 500);
  }
  return getLoyaltySettings(supabase, restaurantId);
}

export async function listLoyaltyRewards(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<LoyaltyReward[]> {
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .select(REWARD_SELECT)
    .eq("restaurant_id", restaurantId)
    .order("points_required", { ascending: true })
    .order("sort_index", { ascending: true });
  if (error) {
    throw new LoyaltyServiceError(publicError(error, "Impossible de charger les récompenses."), 500);
  }
  return ((data ?? []) as LoyaltyRewardRow[]).map(mapRewardRow);
}

async function loadCardBundle(
  supabase: SupabaseClient,
  restaurantId: string,
  card: LoyaltyCardRow,
  includeHistory: boolean,
  rewards?: LoyaltyReward[],
): Promise<LoyaltyCardRecord> {
  const rewardList = rewards ?? (await listLoyaltyRewards(supabase, restaurantId));
  let history: ReturnType<typeof mapTransactionRow>[] = [];
  if (includeHistory) {
    const { data, error } = await supabase
      .from("loyalty_transactions")
      .select(TRANSACTION_SELECT)
      .eq("restaurant_id", restaurantId)
      .eq("card_id", card.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      throw new LoyaltyServiceError(publicError(error, "Impossible de charger l’historique."), 500);
    }
    history = ((data ?? []) as LoyaltyTransactionRow[]).map(mapTransactionRow);
  }
  return mapCardRecord(card, rewardList, history);
}

export async function listLoyaltyCards(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<LoyaltyCardRecord[]> {
  const [cardsResult, rewards] = await Promise.all([
    supabase
      .from("loyalty_cards")
      .select(CARD_SELECT)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(500),
    listLoyaltyRewards(supabase, restaurantId),
  ]);
  if (cardsResult.error) {
    throw new LoyaltyServiceError(publicError(cardsResult.error, "Impossible de charger les cartes de fidélité."), 500);
  }
  return ((cardsResult.data ?? []) as LoyaltyCardRow[]).map((row) => mapCardRecord(row, rewards));
}

export async function getLoyaltyCard(
  supabase: SupabaseClient,
  restaurantId: string,
  id: string,
): Promise<LoyaltyCardRecord> {
  const { data, error } = await supabase
    .from("loyalty_cards")
    .select(CARD_SELECT)
    .eq("restaurant_id", restaurantId)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new LoyaltyServiceError(publicError(error, "Impossible de charger cette carte."), 500);
  }
  if (!data) throw new LoyaltyServiceError("Cette carte n’existe pas.", 404);
  return loadCardBundle(supabase, restaurantId, data as LoyaltyCardRow, true);
}

async function findCustomerByEmail(
  supabase: SupabaseClient,
  restaurantId: string,
  email: string,
): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from("customers")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .ilike("email", email)
    .maybeSingle();
  return data?.id ? { id: data.id as string } : null;
}

async function findOrCreateLoyaltyCustomer(
  supabase: SupabaseClient,
  restaurantId: string,
  input: CreateLoyaltyClientInput,
): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.replace(/\s+/g, " ").trim();

  const existing = await findCustomerByEmail(supabase, restaurantId, email);
  if (existing) {
    await supabase
      .from("customers")
      .update({
        full_name: fullName,
        phone: phone ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      restaurant_id: restaurantId,
      full_name: fullName,
      email,
      phone,
    })
    .select("id")
    .single();

  if (created?.id) return created.id as string;

  if (isUniqueViolation(error) && email) {
    const retry = await findCustomerByEmail(supabase, restaurantId, email);
    if (retry) return retry.id;
  }
  if (isUniqueViolation(error)) {
    throw new LoyaltyServiceError("Un client existe déjà avec cet e-mail ou ce téléphone.", 409);
  }
  throw new LoyaltyServiceError(publicError(error, "Impossible de créer ce client."), 500);
}

export async function createLoyaltyCard(
  supabase: SupabaseClient,
  params: { restaurantId: string; userId: string; payload: unknown },
): Promise<LoyaltyCardRecord> {
  let input: CreateLoyaltyClientInput;
  try {
    input = parseCreateLoyaltyClientInput(params.payload);
  } catch (error) {
    if (error instanceof ZodError) throw new LoyaltyServiceError(zodMessage(error), 400);
    throw error;
  }

  const customerId = await findOrCreateLoyaltyCustomer(supabase, params.restaurantId, input);

  const { data: existingCard } = await supabase
    .from("loyalty_cards")
    .select("id")
    .eq("restaurant_id", params.restaurantId)
    .eq("customer_id", customerId)
    .maybeSingle();
  if (existingCard?.id) {
    throw new LoyaltyServiceError("Ce client a déjà une carte de fidélité.", 409);
  }

  const settings = await getLoyaltySettings(supabase, params.restaurantId);
  const signupBonus = settings.signupBonusPoints;
  let lastError: { message?: string; code?: string } | null = null;

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const cardCode = generateLoyaltyCardCode();
    const publicToken = generateLoyaltyPublicToken();
    const { data, error } = await supabase
      .from("loyalty_cards")
      .insert({
        restaurant_id: params.restaurantId,
        customer_id: customerId,
        card_code: cardCode,
        public_token: publicToken,
        points_balance: signupBonus,
        status: "active",
        last_visit_at: null,
        created_by: params.userId,
      })
      .select(CARD_SELECT)
      .single();

    if (data) {
      if (signupBonus > 0) {
        await supabase.from("loyalty_transactions").insert({
          restaurant_id: params.restaurantId,
          card_id: data.id,
          customer_id: customerId,
          type: "signup_bonus",
          points_delta: signupBonus,
          balance_before: 0,
          balance_after: signupBonus,
          created_by: params.userId,
        });
      }
      return loadCardBundle(supabase, params.restaurantId, data as LoyaltyCardRow, true);
    }
    lastError = error;
    if (!isUniqueViolation(error)) break;
  }

  throw new LoyaltyServiceError(publicError(lastError, "Impossible de créer la carte de fidélité."), 500);
}

export async function lookupLoyaltyCardFromScan(
  supabase: SupabaseClient,
  restaurantId: string,
  raw: string,
): Promise<LoyaltyCardRecord> {
  const resolved = resolveScannedLoyaltyPayload(raw);
  if (!resolved) {
    throw new LoyaltyServiceError("Cette carte n’existe pas.", 404);
  }
  const query = supabase.from("loyalty_cards").select(CARD_SELECT).eq("restaurant_id", restaurantId);
  const { data, error } =
    resolved.kind === "token"
      ? await query.eq("public_token", resolved.value).maybeSingle()
      : await query.eq("card_code", resolved.value).maybeSingle();
  if (error) {
    throw new LoyaltyServiceError(publicError(error, "Impossible de rechercher cette carte."), 500);
  }
  if (!data) throw new LoyaltyServiceError("Cette carte n’existe pas.", 404);
  return loadCardBundle(supabase, restaurantId, data as LoyaltyCardRow, true);
}

type RpcResult = { ok?: boolean; error?: string };

async function reloadAfterRpc(
  supabase: SupabaseClient,
  restaurantId: string,
  cardId: string,
  rpc: { data: unknown; error: { message?: string } | null },
): Promise<LoyaltyCardRecord> {
  if (rpc.error) {
    throw new LoyaltyServiceError(publicError(rpc.error, "Impossible de mettre à jour cette carte."), 500);
  }
  const payload = (rpc.data ?? null) as RpcResult | null;
  if (!payload?.ok) {
    throw new LoyaltyServiceError(rpcErrorMessage(payload?.error ?? "error"), 400);
  }
  return getLoyaltyCard(supabase, restaurantId, cardId);
}

export async function addLoyaltyPurchase(
  supabase: SupabaseClient,
  restaurantId: string,
  cardId: string,
  payload: unknown,
): Promise<{ card: LoyaltyCardRecord; pointsAdded: number }> {
  let amountCents: number;
  try {
    amountCents = parsePurchaseAmountCents(payload);
  } catch (error) {
    if (error instanceof ZodError) throw new LoyaltyServiceError(zodMessage(error), 400);
    throw error;
  }

  const rpc = await supabase.rpc("add_loyalty_purchase", {
    p_card_id: cardId,
    p_amount_cents: amountCents,
  });
  const card = await reloadAfterRpc(supabase, restaurantId, cardId, rpc);
  const result = (rpc.data ?? {}) as { points_added?: number };
  return { card, pointsAdded: typeof result.points_added === "number" ? result.points_added : 0 };
}

export async function redeemLoyaltyReward(
  supabase: SupabaseClient,
  restaurantId: string,
  cardId: string,
  payload: unknown,
): Promise<LoyaltyCardRecord> {
  let rewardId: string;
  try {
    rewardId = parseRedeemLoyaltyInput(payload).rewardId;
  } catch (error) {
    if (error instanceof ZodError) throw new LoyaltyServiceError(zodMessage(error), 400);
    throw error;
  }
  const rpc = await supabase.rpc("redeem_loyalty_reward", {
    p_card_id: cardId,
    p_reward_id: rewardId,
  });
  return reloadAfterRpc(supabase, restaurantId, cardId, rpc);
}

export async function createLoyaltyReward(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: unknown,
): Promise<LoyaltyReward> {
  let input;
  try {
    input = parseLoyaltyRewardInput(payload);
  } catch (error) {
    if (error instanceof ZodError) throw new LoyaltyServiceError(zodMessage(error), 400);
    throw error;
  }

  const existing = await listLoyaltyRewards(supabase, restaurantId);
  const sortIndex = existing.length === 0 ? 0 : Math.max(...existing.map((reward) => reward.sortIndex)) + 1;

  const { data, error } = await supabase
    .from("loyalty_rewards")
    .insert({
      restaurant_id: restaurantId,
      title: input.title,
      description: input.description ?? null,
      points_required: input.pointsRequired,
      active: input.active ?? true,
      sort_index: sortIndex,
    })
    .select(REWARD_SELECT)
    .single();
  if (error || !data) {
    throw new LoyaltyServiceError(publicError(error, "Impossible de créer cette récompense."), 500);
  }
  return mapRewardRow(data as LoyaltyRewardRow);
}

export async function updateLoyaltyReward(
  supabase: SupabaseClient,
  restaurantId: string,
  id: string,
  payload: unknown,
): Promise<LoyaltyReward> {
  let input;
  try {
    input = parsePatchLoyaltyRewardInput(payload);
  } catch (error) {
    if (error instanceof ZodError) throw new LoyaltyServiceError(zodMessage(error), 400);
    throw error;
  }

  const patch: Record<string, unknown> = {};
  if (input.title != null) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description ?? null;
  if (input.pointsRequired != null) patch.points_required = input.pointsRequired;
  if (input.active != null) patch.active = input.active;
  if (Object.keys(patch).length === 0) {
    const rewards = await listLoyaltyRewards(supabase, restaurantId);
    const current = rewards.find((reward) => reward.id === id);
    if (!current) throw new LoyaltyServiceError("Cette récompense n’existe pas.", 404);
    return current;
  }

  const { data, error } = await supabase
    .from("loyalty_rewards")
    .update(patch)
    .eq("restaurant_id", restaurantId)
    .eq("id", id)
    .select(REWARD_SELECT)
    .maybeSingle();
  if (error) {
    throw new LoyaltyServiceError(publicError(error, "Impossible de mettre à jour cette récompense."), 500);
  }
  if (!data) throw new LoyaltyServiceError("Cette récompense n’existe pas.", 404);
  return mapRewardRow(data as LoyaltyRewardRow);
}

export async function deleteLoyaltyReward(
  supabase: SupabaseClient,
  restaurantId: string,
  id: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .delete()
    .eq("restaurant_id", restaurantId)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    throw new LoyaltyServiceError(publicError(error, "Impossible de supprimer cette récompense."), 500);
  }
  if (!data) throw new LoyaltyServiceError("Cette récompense n’existe pas.", 404);
}

export async function getLoyaltyKpis(supabase: SupabaseClient, restaurantId: string): Promise<LoyaltyKpis> {
  const empty: LoyaltyKpis = {
    cardCount: 0,
    activeCount: 0,
    pointsInCirculation: 0,
    pointsAwarded: 0,
    rewardsRedeemed: 0,
    visitCount: 0,
  };

  const [cardsResult, txResult] = await Promise.all([
    supabase
      .from("loyalty_cards")
      .select("points_balance, status")
      .eq("restaurant_id", restaurantId),
    supabase.from("loyalty_transactions").select("type, points_delta").eq("restaurant_id", restaurantId),
  ]);

  if (cardsResult.error || txResult.error) return empty;

  const cards = (cardsResult.data ?? []) as { points_balance: number; status: string }[];
  const txs = (txResult.data ?? []) as { type: string; points_delta: number }[];

  return {
    cardCount: cards.length,
    activeCount: cards.filter((card) => card.status === "active").length,
    pointsInCirculation: cards.reduce((sum, card) => sum + (card.points_balance ?? 0), 0),
    pointsAwarded: txs.filter((tx) => tx.points_delta > 0).reduce((sum, tx) => sum + tx.points_delta, 0),
    rewardsRedeemed: txs.filter((tx) => tx.type === "reward_redeemed").length,
    visitCount: txs.filter((tx) => tx.type === "purchase").length,
  };
}
