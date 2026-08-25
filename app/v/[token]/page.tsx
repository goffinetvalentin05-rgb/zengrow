import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import PublicGiftVoucherCard from "@/src/components/gift-vouchers/public-gift-voucher-card";
import { loadPublicGiftVoucherByToken } from "@/src/lib/gift-vouchers/load-public";
import { consumePublicVoucherRateLimit } from "@/src/lib/gift-vouchers/public-rate-limit";

type PublicVoucherPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Bon cadeau",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

function clientIp(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerList.get("x-real-ip")?.trim() || "unknown";
}

export default async function PublicGiftVoucherPage({ params }: PublicVoucherPageProps) {
  const { token } = await params;
  const headerList = await headers();
  const allowed = consumePublicVoucherRateLimit(clientIp(headerList));

  if (!allowed) {
    return (
      <PublicVoucherShell>
        <p className="text-center text-sm text-zg-text-muted">Trop de tentatives. Réessayez dans un instant.</p>
      </PublicVoucherShell>
    );
  }

  const voucher = await loadPublicGiftVoucherByToken(token);

  if (!voucher) {
    return (
      <PublicVoucherShell>
        <div className="rounded-3xl border border-zg-border bg-white px-6 py-10 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-zg-fg">Ce bon n’existe pas.</h1>
          <p className="mt-2 text-sm text-zg-text-muted">Le lien est invalide ou n’est plus actif.</p>
        </div>
      </PublicVoucherShell>
    );
  }

  return (
    <PublicVoucherShell>
      <PublicGiftVoucherCard voucher={voucher} />
    </PublicVoucherShell>
  );
}

function PublicVoucherShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f4f0ff_0,#f8fafc_42%,#f8fafc_100%)] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        {children}
        <p className="flex items-center justify-center gap-2 text-xs text-zg-text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zengrow-logo.png" alt="" className="h-5 w-5 rounded-sm object-contain" />
          Powered by ZenGrow
        </p>
      </div>
    </main>
  );
}
