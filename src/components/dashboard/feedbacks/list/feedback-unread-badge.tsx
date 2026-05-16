import { cn } from "@/src/lib/utils";

type FeedbackUnreadBadgeProps = {
  className?: string;
};

export default function FeedbackUnreadBadge({ className }: FeedbackUnreadBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md bg-zg-warning-soft-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zg-warning",
        className,
      )}
    >
      Non lu
    </span>
  );
}
