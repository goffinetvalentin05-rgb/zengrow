import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition duration-200",
        "placeholder:text-gray-400",
        "focus:border-green-600/30 focus:ring-2 focus:ring-green-600/15",
        "file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gray-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-gray-800",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
