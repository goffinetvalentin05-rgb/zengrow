import { cn } from "@/src/lib/utils";
import { initialsFromName } from "@/src/lib/discovery/slug";

export function DiscoveryAvatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dim =
    size === "sm" ? "h-9 w-9 text-[11px]" : size === "lg" ? "h-16 w-16 text-lg" : size === "xl" ? "h-24 w-24 text-2xl" : "h-12 w-12 text-sm";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn("rounded-full object-cover bg-white/[0.06]", dim, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white/[0.07] font-medium text-white/80",
        dim,
        className,
      )}
    >
      {initialsFromName(name)}
    </span>
  );
}
