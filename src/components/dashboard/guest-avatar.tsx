import { cn } from "@/src/lib/utils";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  const single = parts[0] ?? "?";
  return single.slice(0, 2).toUpperCase();
}

type GuestAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = { sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-12 w-12 text-base" };

export default function GuestAvatar({ name, size = "md", className }: GuestAvatarProps) {
  const initials = initialsFromName(name || "Client");

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/18 to-[var(--primary)]/6 font-semibold text-[var(--primary)] shadow-sm ring-2 ring-white",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
