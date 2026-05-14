import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-zg-border bg-zg-surface px-4 py-3 text-sm text-zg-fg outline-none transition duration-200 shadow-sm",
        "placeholder:text-zg-fg-muted",
        "focus:border-zg-teal/35 focus:ring-2 focus:ring-zg-teal/12",
        className,
      )}
      {...props}
    />
  );
}
