import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-[42px] w-full rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition",
        "placeholder:text-[var(--muted-foreground)]/65",
        "focus:border-[rgba(13,92,74,0.35)] focus:shadow-[0_0_0_3px_rgba(13,92,74,0.15)]",
        "file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[var(--foreground)]",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
