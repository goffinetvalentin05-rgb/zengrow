type AddToAppleWalletBadgeProps = {
  href: string;
};

/**
 * Badge officiel Apple (artwork Apple Support).
 * aria-label en français : « Ajouter à Apple Wallet ».
 * Proportions natives : hauteur fixe, largeur auto, jamais étiré.
 */
export default function AddToAppleWalletBadge({ href }: AddToAppleWalletBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <a
        href={href}
        aria-label="Ajouter à Apple Wallet"
        className="inline-flex p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/30 focus-visible:ring-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/apple-wallet/add-to-apple-wallet.png"
          alt="Ajouter à Apple Wallet"
          height={40}
          className="h-10 w-auto max-w-full"
        />
      </a>
      <p className="max-w-xs text-center text-xs leading-relaxed text-zg-text-muted">
        Pour ajouter ce bon, ouvrez cette page sur votre iPhone.
      </p>
    </div>
  );
}
