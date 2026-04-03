import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-[44px] w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition duration-200",
        "focus:border-green-600/30 focus:ring-2 focus:ring-green-600/15",
        className,
      )}
      {...props}
    />
  );
}
