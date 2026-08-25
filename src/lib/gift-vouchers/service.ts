import { ZodError } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateGiftVoucherCode, normalizeGiftVoucherCode } from "@/src/lib/gift-vouchers/code";
import {
  mapGiftVoucherRow,
  mapGiftVoucherTransactionRow,
  toGiftCardRecord,
  type GiftVoucherRow,
  type GiftVoucherTransactionRow,
} from "@/src/lib/gift-vouchers/map";
import { chfToCents } from "@/src/lib/gift-vouchers/money";
import { generateGiftVoucherPublicToken, resolveScannedGiftVoucherPayload } from "@/src/lib/gift-vouchers/public-token";
import { getRedeemBlockReason, redeemErrorMessage } from "@/src/lib/gift-vouchers/redeem";
import {
  parseCreateGiftVoucherInput,
  parseGiftVoucherStatusAction,
  parseLookupGiftVoucherCode,
  parseLookupGiftVoucherToken,
  parseRedeemGiftVoucherInput,
} from "@/src/lib/gift-vouchers/schemas";
import { applyMarkUsed, applyReactivate, canDisable, canMarkUsed, canReactivate } from "@/src/lib/gift-vouchers/status";
import type {
  CreateGiftVoucherInput,
  GiftVoucher,
  GiftVoucherStatusAction,
  GiftVoucherTransaction,
  RedeemGiftVoucherInput,
} from "@/src/lib/gift-vouchers/types";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import { notifyGiftVoucherWalletPass } from "@/src/lib/gift-vouchers/wallet/notify";
import { loadGiftVoucherBrandingSettings } from "@/src/lib/gift-vouchers/branding";
import { defaultGiftVoucherExpiryDate } from "@/src/lib/gift-vouchers/defaults";
import { notifyGiftVoucherCreated, notifyGiftVoucherRedeemed } from "@/src/lib/notifications/gift-voucher";

const CODE_ATTEMPTS = 6;
const UNIQUE_VIOLATION = "23505";

export class GiftVoucherServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GiftVoucherServiceError";
  }
}

function firstZodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "Données invalides.";
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === UNIQUE_VIOLATION;
}

function publicError(error: { message?: string } | null, fallback: string): string {
  const message = error?.message ?? "";
  if (!message) return fallback;
  if (/duplicate key|unique constraint/i.test(message)) {
    if (/public_token/i.test(message)) {
      return "Impossible de régénérer le QR. Réessayez.";
    }
    return "Ce code de bon existe déjà. Réessayez.";
  }
  return fallback;
}

const VOUCHER_SELECT = `
  id, restaurant_id, buyer_customer_id, code, type, status,
  initial_amount_cents, remaining_amount_cents, currency,
  buyer_name, buyer_email, buyer_phone, recipient_name, recipient_email,
  message, expires_at, issued_at, fully_used_at, created_at, updated_at,
  created_by, public_token, metadata
`;

const TRANSACTION_SELECT = `
  id, voucher_id, restaurant_id, type, amount_cents,
  balance_before_cents, balance_after_cents, note, created_by, created_at, metadata
`;

type GiftVoucherWithTransactionsRow = GiftVoucherRow & {
  gift_voucher_transactions?: GiftVoucherTransactionRow[] | null;
};

function mapRowWithTransactions(row: GiftVoucherWithTransactionsRow): GiftCardRecord {
  const voucher = mapGiftVoucherRow(row);
  const transactions = (row.gift_voucher_transactions ?? []).map(mapGiftVoucherTransactionRow);
  return toGiftCardRecord(voucher, transactions);
}

async function findOrCreateBuyerCustomer(
  supabase: SupabaseClient,
  restaurantId: string,
  input: CreateGiftVoucherInput,
): Promise<string | null> {
  const email = input.buyerEmail?.trim().toLowerCase() ?? null;
  const phone = input.buyerPhone?.trim() ?? null;
  const name = input.buyerName?.trim() || email || "Acheteur";

  if (!email && !phone) return null;

  if (email) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .ilike("email", email)
      .maybeSingle();
    if (existing?.id) {
      await supabase
        .from("customers")
        .update({ last_visit_at: new Date().toISOString() })
        .eq("id", existing.id);
      return existing.id as string;
    }
  }

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      restaurant_id: restaurantId,
      full_name: name,
      email,
      phone,
      last_visit_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (created?.id) return created.id as string;

  if (isUniqueViolation(error) && email) {
    const { data: retry } = await supabase
      .from("customers")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .ilike("email", email)
      .maybeSingle();
    return (retry?.id as string | undefined) ?? null;
  }

  return null;
}

export async function listGiftVouchers(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<GiftCardRecord[]> {
  const { data, error } = await supabase
    .from("gift_vouchers")
    .select(`${VOUCHER_SELECT}, gift_voucher_transactions!voucher_id (${TRANSACTION_SELECT})`)
    .eq("restaurant_id", restaurantId)
    .order("issued_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible de charger les bons cadeaux."), 500);
  }

  return ((data ?? []) as GiftVoucherWithTransactionsRow[]).map(mapRowWithTransactions);
}

export async function getGiftVoucher(
  supabase: SupabaseClient,
  restaurantId: string,
  id: string,
): Promise<GiftCardRecord> {
  const { data, error } = await supabase
    .from("gift_vouchers")
    .select(`${VOUCHER_SELECT}, gift_voucher_transactions!voucher_id (${TRANSACTION_SELECT})`)
    .eq("restaurant_id", restaurantId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible de charger ce bon cadeau."), 500);
  }
  if (!data) {
    throw new GiftVoucherServiceError("Ce bon n’existe pas.", 404);
  }

  return mapRowWithTransactions(data as GiftVoucherWithTransactionsRow);
}

export type GiftVoucherLookupResult = {
  voucher: GiftCardRecord;
  redeemable: boolean;
  error: string | null;
};

export async function lookupGiftVoucherByCode(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: unknown,
): Promise<GiftVoucherLookupResult> {
  let code: string;
  try {
    code = parseLookupGiftVoucherCode(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = firstZodMessage(error);
      throw new GiftVoucherServiceError(message, message === "Ce bon n’existe pas." ? 404 : 400);
    }
    throw new GiftVoucherServiceError("Ce bon n’existe pas.", 404);
  }

  const { data, error } = await supabase
    .from("gift_vouchers")
    .select(`${VOUCHER_SELECT}, gift_voucher_transactions!voucher_id (${TRANSACTION_SELECT})`)
    .eq("restaurant_id", restaurantId)
    .eq("code", code)
    .maybeSingle();

  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible de rechercher ce bon."), 500);
  }
  if (!data) {
    throw new GiftVoucherServiceError("Ce bon n’existe pas.", 404);
  }

  return toLookupResult(data as GiftVoucherWithTransactionsRow);
}

export async function lookupGiftVoucherByPublicToken(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: unknown,
): Promise<GiftVoucherLookupResult> {
  let token: string;
  try {
    token = parseLookupGiftVoucherToken(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GiftVoucherServiceError(firstZodMessage(error), 400);
    }
    throw new GiftVoucherServiceError("Ce QR code n’est pas un bon ZenGrow valide.", 400);
  }

  const { data, error } = await supabase
    .from("gift_vouchers")
    .select(`${VOUCHER_SELECT}, gift_voucher_transactions!voucher_id (${TRANSACTION_SELECT})`)
    .eq("restaurant_id", restaurantId)
    .eq("public_token", token)
    .maybeSingle();

  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible de rechercher ce bon."), 500);
  }
  if (!data) {
    throw new GiftVoucherServiceError("Ce bon n’existe pas.", 404);
  }

  return toLookupResult(data as GiftVoucherWithTransactionsRow);
}

export async function lookupGiftVoucherFromScan(
  supabase: SupabaseClient,
  restaurantId: string,
  raw: string,
): Promise<GiftVoucherLookupResult> {
  const resolved = resolveScannedGiftVoucherPayload(raw);
  if (!resolved) {
    throw new GiftVoucherServiceError("Ce QR code n’est pas un bon ZenGrow valide.", 400);
  }
  if (resolved.kind === "code") {
    return lookupGiftVoucherByCode(supabase, restaurantId, { code: resolved.value });
  }
  return lookupGiftVoucherByPublicToken(supabase, restaurantId, { token: resolved.value });
}

function toLookupResult(row: GiftVoucherWithTransactionsRow): GiftVoucherLookupResult {
  const voucher = mapRowWithTransactions(row);
  const domain = mapGiftVoucherRow(row);
  const block = getRedeemBlockReason({
    status: domain.status,
    remainingAmountCents: domain.remainingAmountCents,
    expiresAt: domain.expiresAt,
  });

  return {
    voucher,
    redeemable: block == null,
    error: block ? redeemErrorMessage(block) : null,
  };
}

type RedeemRpcResult = {
  ok?: boolean;
  error?: string;
  voucher_id?: string;
  amount_cents?: number;
  balance_before_cents?: number;
  balance_after_cents?: number;
  status?: string;
};

function rpcHttpStatus(code: string): number {
  if (code === "not_authorized") return 401;
  if (code === "not_found") return 404;
  if (code === "invalid_amount" || code === "insufficient_balance") return 400;
  if (code === "used" || code === "expired" || code === "disabled" || code === "draft") return 409;
  return 500;
}

export async function redeemGiftVoucher(
  supabase: SupabaseClient,
  params: {
    restaurantId: string;
    payload: unknown;
  },
): Promise<GiftCardRecord> {
  let input: RedeemGiftVoucherInput;
  try {
    input = parseRedeemGiftVoucherInput(params.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GiftVoucherServiceError(firstZodMessage(error), 400);
    }
    throw new GiftVoucherServiceError("Données invalides.", 400);
  }

  let amountCents: number;
  if (input.consumeAll) {
    amountCents = await loadRemainingCentsForRedeem(supabase, params.restaurantId, input);
  } else {
    try {
      amountCents = chfToCents(input.amount ?? 0);
    } catch (error) {
      throw new GiftVoucherServiceError(error instanceof Error ? error.message : "Montant invalide.", 400);
    }
  }

  const code = input.code ? (normalizeGiftVoucherCode(input.code) ?? input.code) : null;

  const { data, error } = await supabase.rpc("redeem_gift_voucher", {
    p_amount_cents: amountCents,
    p_code: code,
    p_voucher_id: input.voucherId ?? null,
  });

  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible d’utiliser ce bon."), 500);
  }

  const result = (data ?? {}) as RedeemRpcResult;
  if (!result.ok) {
    const codeKey = typeof result.error === "string" ? result.error : "not_found";
    throw new GiftVoucherServiceError(redeemErrorMessage(codeKey), rpcHttpStatus(codeKey));
  }

  const voucherId = result.voucher_id;
  if (!voucherId) {
    throw new GiftVoucherServiceError("Impossible d’utiliser ce bon.", 500);
  }

  await notifyGiftVoucherWalletPass(voucherId);
  const redeemed = await getGiftVoucher(supabase, params.restaurantId, voucherId);
  try {
    await notifyGiftVoucherRedeemed({
      restaurantId: params.restaurantId,
      voucherId: redeemed.id,
      code: redeemed.code,
      remainingAmountCents: Math.round(redeemed.balanceChf * 100),
      fullyUsed: redeemed.status === "used" || redeemed.balanceChf <= 0,
    });
  } catch (error) {
    console.error("[gift-voucher-notification]", error);
  }
  return redeemed;
}

async function loadRemainingCentsForRedeem(
  supabase: SupabaseClient,
  restaurantId: string,
  input: RedeemGiftVoucherInput,
): Promise<number> {
  let query = supabase
    .from("gift_vouchers")
    .select("remaining_amount_cents, status, expires_at")
    .eq("restaurant_id", restaurantId);

  if (input.voucherId) {
    query = query.eq("id", input.voucherId);
  } else if (input.code) {
    query = query.eq("code", input.code);
  } else {
    throw new GiftVoucherServiceError("Ce bon n’existe pas.", 404);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible d’utiliser ce bon."), 500);
  }
  if (!data) {
    throw new GiftVoucherServiceError("Ce bon n’existe pas.", 404);
  }

  const remaining = Number(data.remaining_amount_cents);
  const block = getRedeemBlockReason({
    status: data.status as GiftVoucher["status"],
    remainingAmountCents: remaining,
    expiresAt: data.expires_at,
  });
  if (block) {
    throw new GiftVoucherServiceError(redeemErrorMessage(block), block === "not_found" ? 404 : 409);
  }
  return remaining;
}

export async function createGiftVoucher(
  supabase: SupabaseClient,
  params: {
    restaurantId: string;
    userId: string;
    payload: unknown;
  },
): Promise<GiftCardRecord> {
  let input: CreateGiftVoucherInput;
  try {
    input = parseCreateGiftVoucherInput(params.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GiftVoucherServiceError(firstZodMessage(error), 400);
    }
    throw new GiftVoucherServiceError("Données invalides.", 400);
  }

  let amountCents: number;
  try {
    amountCents = chfToCents(input.amount);
  } catch (error) {
    throw new GiftVoucherServiceError(error instanceof Error ? error.message : "Montant invalide.", 400);
  }

  const buyerCustomerId = await findOrCreateBuyerCustomer(supabase, params.restaurantId, input);
  let expiresAt: string | null = null;
  if (input.expiresAt) {
    expiresAt = new Date(`${input.expiresAt}T23:59:59.000Z`).toISOString();
  } else {
    const branding = await loadGiftVoucherBrandingSettings(supabase, params.restaurantId);
    expiresAt = new Date(`${defaultGiftVoucherExpiryDate(branding.defaultValidityMonths)}T23:59:59.000Z`).toISOString();
  }
  const metadata: Record<string, unknown> = {};
  if (input.generatePdf) metadata.generate_pdf = true;

  let created: GiftVoucherRow | null = null;
  let lastError: { message?: string; code?: string } | null = null;

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = generateGiftVoucherCode();
    const { data, error } = await supabase
      .from("gift_vouchers")
      .insert({
        restaurant_id: params.restaurantId,
        buyer_customer_id: buyerCustomerId,
        code,
        public_token: generateGiftVoucherPublicToken(),
        type: input.type,
        status: "active",
        initial_amount_cents: amountCents,
        remaining_amount_cents: amountCents,
        currency: "CHF",
        buyer_name: input.buyerName ?? null,
        buyer_email: input.buyerEmail?.toLowerCase() ?? null,
        buyer_phone: input.buyerPhone ?? null,
        recipient_name: input.recipientName ?? null,
        recipient_email: input.recipientEmail?.toLowerCase() ?? null,
        message: input.message ?? null,
        expires_at: expiresAt,
        created_by: params.userId,
        metadata,
      })
      .select(VOUCHER_SELECT)
      .single();

    if (data) {
      created = data as GiftVoucherRow;
      break;
    }
    lastError = error;
    if (!isUniqueViolation(error)) break;
  }

  if (!created) {
    throw new GiftVoucherServiceError(
      publicError(lastError, "Impossible de créer le bon cadeau. Réessayez."),
      500,
    );
  }

  const { error: txError } = await supabase.from("gift_voucher_transactions").insert({
    voucher_id: created.id,
    restaurant_id: params.restaurantId,
    type: "issued",
    amount_cents: amountCents,
    balance_before_cents: 0,
    balance_after_cents: amountCents,
    note: "Bon émis",
    created_by: params.userId,
  });

  if (txError) {
    throw new GiftVoucherServiceError(publicError(txError, "Bon créé, mais l’historique n’a pas pu être enregistré."), 500);
  }

  try {
    await notifyGiftVoucherCreated({
      restaurantId: params.restaurantId,
      voucherId: created.id,
      code: created.code,
      amountCents,
      type: input.type,
    });
  } catch (error) {
    console.error("[gift-voucher-notification]", error);
  }

  return getGiftVoucher(supabase, params.restaurantId, created.id);
}

export async function updateGiftVoucherStatus(
  supabase: SupabaseClient,
  params: {
    restaurantId: string;
    id: string;
    payload: unknown;
  },
): Promise<GiftCardRecord> {
  let action: GiftVoucherStatusAction;
  try {
    action = parseGiftVoucherStatusAction(params.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GiftVoucherServiceError(firstZodMessage(error), 400);
    }
    throw new GiftVoucherServiceError("Action invalide.", 400);
  }

  const { data: row, error } = await supabase
    .from("gift_vouchers")
    .select(VOUCHER_SELECT)
    .eq("restaurant_id", params.restaurantId)
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible de mettre à jour ce bon."), 500);
  }
  if (!row) {
    throw new GiftVoucherServiceError("Bon cadeau introuvable.", 404);
  }

  const voucher = mapGiftVoucherRow(row as GiftVoucherRow);
  const nowIso = new Date().toISOString();

  if (action === "mark_used") {
    if (!canMarkUsed(voucher.status, voucher.remainingAmountCents)) {
      throw new GiftVoucherServiceError("Ce bon ne peut pas être marqué comme utilisé.", 400);
    }
    const next = applyMarkUsed(nowIso);
    const consumed = voucher.remainingAmountCents;
    await persistStatusChange(supabase, {
      voucher,
      nextStatus: next.status,
      remainingAmountCents: next.remainingAmountCents,
      fullyUsedAt: next.fullyUsedAt,
      transactionType: "redemption",
      amountCents: consumed,
      balanceBefore: voucher.remainingAmountCents,
      balanceAfter: 0,
      note: "Utilisation manuelle",
    });
  } else if (action === "disable") {
    if (!canDisable(voucher.status)) {
      throw new GiftVoucherServiceError("Ce bon ne peut pas être désactivé.", 400);
    }
    await persistStatusChange(supabase, {
      voucher,
      nextStatus: "disabled",
      remainingAmountCents: voucher.remainingAmountCents,
      fullyUsedAt: voucher.fullyUsedAt,
      transactionType: "disabled",
      amountCents: null,
      balanceBefore: voucher.remainingAmountCents,
      balanceAfter: voucher.remainingAmountCents,
      note: "Bon désactivé",
    });
  } else if (action === "reactivate") {
    if (!canReactivate(voucher.status)) {
      throw new GiftVoucherServiceError("Ce bon ne peut pas être réactivé.", 400);
    }
    const nextStatus = applyReactivate(voucher.remainingAmountCents);
    await persistStatusChange(supabase, {
      voucher,
      nextStatus,
      remainingAmountCents: voucher.remainingAmountCents,
      fullyUsedAt: nextStatus === "used" ? (voucher.fullyUsedAt ?? nowIso) : voucher.fullyUsedAt,
      transactionType: "reactivated",
      amountCents: null,
      balanceBefore: voucher.remainingAmountCents,
      balanceAfter: voucher.remainingAmountCents,
      note: "Bon réactivé",
    });
  } else if (action === "rotate_qr") {
    let rotated = false;
    for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
      const { error: rotateError } = await supabase
        .from("gift_vouchers")
        .update({ public_token: generateGiftVoucherPublicToken() })
        .eq("id", voucher.id)
        .eq("restaurant_id", params.restaurantId);
      if (!rotateError) {
        rotated = true;
        break;
      }
      if (!isUniqueViolation(rotateError)) {
        throw new GiftVoucherServiceError(publicError(rotateError, "Impossible de régénérer le QR."), 500);
      }
    }
    if (!rotated) {
      throw new GiftVoucherServiceError("Impossible de régénérer le QR. Réessayez.", 500);
    }
  } else {
    throw new GiftVoucherServiceError("Action invalide.", 400);
  }

  await notifyGiftVoucherWalletPass(voucher.id);
  return getGiftVoucher(supabase, params.restaurantId, voucher.id);
}

async function persistStatusChange(
  supabase: SupabaseClient,
  params: {
    voucher: GiftVoucher;
    nextStatus: GiftVoucher["status"];
    remainingAmountCents: number;
    fullyUsedAt: string | null;
    transactionType: GiftVoucherTransaction["type"];
    amountCents: number | null;
    balanceBefore: number;
    balanceAfter: number;
    note: string;
  },
) {
  const { data, error: rpcError } = await supabase.rpc("staff_update_gift_voucher", {
    p_voucher_id: params.voucher.id,
    p_status: params.nextStatus,
    p_remaining_amount_cents: params.remainingAmountCents,
    p_fully_used_at: params.fullyUsedAt,
    p_tx_type: params.transactionType,
    p_amount_cents: params.amountCents,
    p_balance_before_cents: params.balanceBefore,
    p_balance_after_cents: params.balanceAfter,
    p_note: params.note,
  });

  if (rpcError) {
    throw new GiftVoucherServiceError(publicError(rpcError, "Impossible de mettre à jour ce bon."), 500);
  }

  const result = (data ?? {}) as { ok?: boolean; error?: string };
  if (!result.ok) {
    throw new GiftVoucherServiceError("Impossible de mettre à jour ce bon.", 500);
  }
}

export type GiftVoucherKpis = {
  soldCount: number;
  revenueCents: number;
  usedCount: number;
  circulationCents: number;
  activeCount: number;
  buyerCount: number;
};

export async function getGiftVoucherKpis(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<GiftVoucherKpis> {
  const { data, error } = await supabase
    .from("gift_vouchers")
    .select("status, initial_amount_cents, remaining_amount_cents, buyer_customer_id, buyer_email")
    .eq("restaurant_id", restaurantId);

  if (error) {
    throw new GiftVoucherServiceError(publicError(error, "Impossible de charger les indicateurs."), 500);
  }

  const rows = (data ?? []) as {
    status: string;
    initial_amount_cents: number;
    remaining_amount_cents: number;
    buyer_customer_id: string | null;
    buyer_email: string | null;
  }[];

  const sold = rows.filter((row) => row.status !== "draft");
  const buyers = new Set<string>();
  for (const row of sold) {
    if (row.buyer_customer_id) buyers.add(`id:${row.buyer_customer_id}`);
    else if (row.buyer_email) buyers.add(`email:${row.buyer_email.toLowerCase()}`);
  }

  return {
    soldCount: sold.length,
    revenueCents: sold
      .filter((row) => row.status === "active" || row.status === "used")
      .reduce((sum, row) => sum + row.initial_amount_cents, 0),
    usedCount: rows.filter((row) => row.status === "used").length,
    circulationCents: rows
      .filter((row) => row.status === "active")
      .reduce((sum, row) => sum + row.remaining_amount_cents, 0),
    activeCount: rows.filter((row) => row.status === "active").length,
    buyerCount: buyers.size,
  };
}
