import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-[44px] w-full rounded-xl border border-zg-border-strong/90 bg-zg-surface/95 px-4 py-2.5 text-sm text-zg-fg outline-none transition duration-200 shadow-sm",
        "placeholder:text-zg-fg/38",
        "focus:border-[#1F7A6C]/35 focus:ring-2 focus:ring-[#1F7A6C]/12",
        "file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-zg-surface-elevated file:px-3 file:py-2 file:text-xs file:font-medium file:text-zg-fg/85",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
