import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition",
        "placeholder:text-slate-400 focus:border-[#9bb1ef] focus:ring-2 focus:ring-[#d8e3ff]",
        className,
      )}
      {...props}
    />
  );
}
