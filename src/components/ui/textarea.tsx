import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200",
        "placeholder:text-[var(--muted-foreground)]/75",
        "focus:border-[var(--primary)]/40 focus:shadow-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
}
