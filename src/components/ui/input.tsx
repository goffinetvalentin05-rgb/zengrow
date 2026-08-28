import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-10 w-full rounded-2xl border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-sm text-zg-fg outline-none shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-colors duration-200 ease-out",
        "placeholder:text-zg-text-placeholder",
        "hover:border-white/[0.16]",
        "focus:border-white/30 focus:ring-2 focus:ring-white/12",
        "file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-zg-surface-elevated file:px-3 file:py-2 file:text-xs file:font-medium file:text-zg-fg/90",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
