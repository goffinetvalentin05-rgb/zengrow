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

const sizeMap = { sm: "h-9 w-9 text-xs", md: "h-10 w-10 text-sm", lg: "h-11 w-11 text-sm" };

export default function GuestAvatar({ name, size = "md", className }: GuestAvatarProps) {
  const initials = initialsFromName(name || "Client");

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-green-50 font-semibold text-green-800",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
