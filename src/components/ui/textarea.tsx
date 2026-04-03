import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition duration-200",
        "placeholder:text-gray-400",
        "focus:border-green-600/30 focus:ring-2 focus:ring-green-600/15",
        className,
      )}
      {...props}
    />
  );
}
