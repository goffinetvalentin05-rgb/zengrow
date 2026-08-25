import { ZodError } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateGiftVoucherCode } from "@/src/lib/gift-vouchers/code";
import {
  mapGiftVoucherRow,
  mapGiftVoucherTransactionRow,
  toGiftCardRecord,
  type GiftVoucherRow,
  type GiftVoucherTransactionRow,
} from "@/src/lib/gift-vouchers/map";
import { chfToCents } from "@/src/lib/gift-vouchers/money";
import { parseCreateGiftVoucherInput, parseGiftVoucherStatusAction } from "@/src/lib/gift-vouchers/schemas";
import { applyMarkUsed, applyReactivate, canDisable, canMarkUsed, canReactivate } from "@/src/lib/gift-vouchers/status";
import type {
  CreateGiftVoucherInput,
  GiftVoucher,
  GiftVoucherStatusAction,
  GiftVoucherTransaction,
} from "@/src/lib/gift-vouchers/types";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";

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
    return "Ce code de bon existe déjà. Réessayez.";
  }
  return fallback;
}

const VOUCHER_SELECT = `
  id, restaurant_id, buyer_customer_id, code, type, status,
  initial_amount_cents, remaining_amount_cents, currency,
  buyer_name, buyer_email, buyer_phone, recipient_name, recipient_email,
  message, expires_at, issued_at, fully_used_at, created_at, updated_at,
  created_by, metadata
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
    throw new GiftVoucherServiceError("Bon cadeau introuvable.", 404);
  }

  return mapRowWithTransactions(data as GiftVoucherWithTransactionsRow);
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
  const expiresAt = input.expiresAt ? new Date(`${input.expiresAt}T23:59:59.000Z`).toISOString() : null;
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

  return getGiftVoucher(supabase, params.restaurantId, created.id);
}

export async function updateGiftVoucherStatus(
  supabase: SupabaseClient,
  params: {
    restaurantId: string;
    userId: string;
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
      restaurantId: params.restaurantId,
      userId: params.userId,
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
      restaurantId: params.restaurantId,
      userId: params.userId,
      nextStatus: "disabled",
      remainingAmountCents: voucher.remainingAmountCents,
      fullyUsedAt: voucher.fullyUsedAt,
      transactionType: "disabled",
      amountCents: null,
      balanceBefore: voucher.remainingAmountCents,
      balanceAfter: voucher.remainingAmountCents,
      note: "Bon désactivé",
    });
  } else {
    if (!canReactivate(voucher.status)) {
      throw new GiftVoucherServiceError("Ce bon ne peut pas être réactivé.", 400);
    }
    const nextStatus = applyReactivate(voucher.remainingAmountCents);
    await persistStatusChange(supabase, {
      voucher,
      restaurantId: params.restaurantId,
      userId: params.userId,
      nextStatus,
      remainingAmountCents: voucher.remainingAmountCents,
      fullyUsedAt: nextStatus === "used" ? (voucher.fullyUsedAt ?? nowIso) : voucher.fullyUsedAt,
      transactionType: "reactivated",
      amountCents: null,
      balanceBefore: voucher.remainingAmountCents,
      balanceAfter: voucher.remainingAmountCents,
      note: "Bon réactivé",
    });
  }

  return getGiftVoucher(supabase, params.restaurantId, voucher.id);
}

async function persistStatusChange(
  supabase: SupabaseClient,
  params: {
    voucher: GiftVoucher;
    restaurantId: string;
    userId: string;
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
  const { error: updateError } = await supabase
    .from("gift_vouchers")
    .update({
      status: params.nextStatus,
      remaining_amount_cents: params.remainingAmountCents,
      fully_used_at: params.fullyUsedAt,
    })
    .eq("id", params.voucher.id)
    .eq("restaurant_id", params.restaurantId);

  if (updateError) {
    throw new GiftVoucherServiceError(publicError(updateError, "Impossible de mettre à jour ce bon."), 500);
  }

  const { error: txError } = await supabase.from("gift_voucher_transactions").insert({
    voucher_id: params.voucher.id,
    restaurant_id: params.restaurantId,
    type: params.transactionType,
    amount_cents: params.amountCents,
    balance_before_cents: params.balanceBefore,
    balance_after_cents: params.balanceAfter,
    note: params.note,
    created_by: params.userId,
  });

  if (txError) {
    throw new GiftVoucherServiceError(publicError(txError, "Statut mis à jour, mais l’historique n’a pas pu être enregistré."), 500);
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
