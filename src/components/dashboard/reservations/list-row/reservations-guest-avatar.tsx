import {
  guestAvatarColorClasses,
  guestAvatarSolidClasses,
  guestInitials,
} from "@/src/components/dashboard/reservations/utils/guest-color-hash";
import { cn } from "@/src/lib/utils";

type ReservationsGuestAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "soft" | "solid";
  className?: string;
};

const sizeMap = {
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-sm",
  xl: "h-[60px] w-[60px] text-base",
};

export default function ReservationsGuestAvatar({
  name,
  size = "md",
  variant = "soft",
  className,
}: ReservationsGuestAvatarProps) {
  const colors =
    variant === "solid" ? guestAvatarSolidClasses(name) : guestAvatarColorClasses(name);
  const initials = guestInitials(name || "Client");

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeMap[size],
        colors.bg,
        colors.text,
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
