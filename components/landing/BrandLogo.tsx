import Image from "next/image";
import { BRAND_NAME } from "./brand";

export const BRAND_LOGO = {
  src: "/zengrow-logo.png",
  width: 1584,
  height: 396,
} as const;

export const LANDING_LOGO = {
  src: "/sharpz-logo.png",
  width: 710,
  height: 111,
} as const;

export function LandingWordmark({
  className = "go-wordmark__logo",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LANDING_LOGO.src}
      alt=""
      width={LANDING_LOGO.width}
      height={LANDING_LOGO.height}
      className={className}
      priority={priority}
      sizes="180px"
      aria-hidden
    />
  );
}

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
