import Image from "next/image";
import { BRAND_NAME } from "./brand";

export const BRAND_LOGO = {
  src: "/zengrow-logo.png",
  width: 1584,
  height: 396,
} as const;

export function BrandLogo({
  className,
  priority = false,
  sizes,
  decorative = false,
}: {
  className?: string;
  priority?: boolean;
  sizes?: string;
  decorative?: boolean;
}) {
  return (
    <Image
      src={BRAND_LOGO.src}
      alt={decorative ? "" : BRAND_NAME}
      width={BRAND_LOGO.width}
      height={BRAND_LOGO.height}
      className={className}
      priority={priority}
      sizes={sizes}
      aria-hidden={decorative || undefined}
    />
  );
}
