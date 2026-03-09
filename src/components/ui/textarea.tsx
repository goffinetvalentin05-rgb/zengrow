import { TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition",
        "placeholder:text-slate-400 focus:border-[#9bb1ef] focus:ring-2 focus:ring-[#d8e3ff]",
        className,
      )}
      {...props}
    />
  );
}
