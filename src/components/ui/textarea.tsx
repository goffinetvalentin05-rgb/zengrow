import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition",
        "placeholder:text-[var(--muted-foreground)]/65",
        "focus:border-[rgba(13,92,74,0.35)] focus:shadow-[0_0_0_3px_rgba(13,92,74,0.15)]",
        className,
      )}
      {...props}
    />
  );
}
