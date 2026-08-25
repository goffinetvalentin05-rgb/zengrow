import { createAdminClient } from "@/src/lib/supabase/admin";
import { isAppleWalletApnsConfigured } from "@/src/lib/gift-vouchers/wallet/config";
import { sendAppleWalletPassUpdatePushes } from "@/src/lib/gift-vouchers/wallet/apns";
import { listPushTokensForVoucher, touchWalletPassUpdatedAt } from "@/src/lib/gift-vouchers/wallet/store";

/**
 * Un pass déjà dans Wallet ne se met pas à jour tout seul.
 * Après un encaissement partiel, il faut : 1) marquer le pass comme modifié,
 * 2) envoyer une notification push APNs vide, 3) laisser l’iPhone retélécharger
 * le .pkpass via le PassKit Web Service.
 */
export async function notifyGiftVoucherWalletPass(voucherId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const updated = await touchWalletPassUpdatedAt(admin, voucherId);
    if (!updated) return;

    if (!isAppleWalletApnsConfigured()) {
      console.info("[gift-vouchers/wallet] Pass marqué à jour, mais APNs n’est pas configuré.");
      return;
    }

    const tokens = await listPushTokensForVoucher(admin, voucherId);
    if (tokens.length === 0) return;
    await sendAppleWalletPassUpdatePushes(tokens);
  } catch (error) {
    console.error("[gift-vouchers/wallet] Mise à jour Wallet impossible", error);
  }
}
