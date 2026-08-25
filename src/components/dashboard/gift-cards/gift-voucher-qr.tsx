"use client";

import QRCode from "react-qr-code";
import { cn } from "@/src/lib/utils";

type GiftVoucherQrProps = {
  value: string;
  size?: number;
  label?: string;
  className?: string;
};

export default function GiftVoucherQr({ value, size = 180, label, className }: GiftVoucherQrProps) {
  return (
    <figure className={cn("inline-flex flex-col items-center", className)}>
      <div className="rounded-2xl bg-white p-4" style={{ width: size + 32, height: size + 32 }}>
        <QRCode
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#111111"
          level="H"
          style={{ display: "block", width: size, height: size }}
        />
      </div>
      {label ? <figcaption className="sr-only">{label}</figcaption> : null}
    </figure>
  );
}
