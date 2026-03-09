import { cn } from "@/src/lib/utils";

type ToastInlineProps = {
  tone?: "success" | "error" | "info";
  message: string;
};

const toneClass = {
  success: "bg-emerald-50 text-emerald-700",
  error: "bg-rose-50 text-rose-700",
  info: "bg-blue-50 text-blue-700",
};

export default function ToastInline({ tone = "info", message }: ToastInlineProps) {
  return <p className={cn("rounded-xl px-3 py-2 text-sm", toneClass[tone])}>{message}</p>;
}
