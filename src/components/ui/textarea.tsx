import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-zg-border bg-zg-surface/90 px-3 py-2.5 text-sm text-zg-fg outline-none backdrop-blur-sm transition-all duration-200 ease-out",
        "placeholder:text-zg-text-placeholder",
        "hover:border-zg-border-strong",
        "focus:border-zg-border-focus focus:ring-2 focus:ring-zg-accent/25 focus:shadow-[0_0_20px_-8px_rgba(124,92,255,0.35)]",
        className,
      )}
      {...props}
    />
  );
}
