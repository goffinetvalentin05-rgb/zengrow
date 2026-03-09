import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition",
        "focus:border-[#9bb1ef] focus:ring-2 focus:ring-[#d8e3ff]",
        className,
      )}
      {...props}
    />
  );
}
