import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-sm text-zg-fg outline-none shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-colors duration-200 ease-out",
        "placeholder:text-zg-text-placeholder",
        "hover:border-white/[0.16]",
        "focus:border-white/30 focus:ring-2 focus:ring-white/12",
        className,
      )}
      {...props}
    />
  );
}
