import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-zg-border-strong/90 bg-zg-surface/95 px-4 py-3 text-sm text-zg-fg outline-none transition duration-200 shadow-sm",
        "placeholder:text-zg-fg/38",
        "focus:border-[#1F7A6C]/35 focus:ring-2 focus:ring-[#1F7A6C]/12",
        className,
      )}
      {...props}
    />
  );
}
