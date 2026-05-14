import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-zg-border bg-zg-surface px-3 py-2.5 text-sm text-zg-fg outline-none transition-all duration-200 ease-out",
        "placeholder:text-zg-text-placeholder",
        "focus:border-zg-border-focus focus:ring-2 focus:ring-zg-accent/20",
        className,
      )}
      {...props}
    />
  );
}
