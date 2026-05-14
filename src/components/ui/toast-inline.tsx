import { cn } from "@/src/lib/utils";

type ToastInlineProps = {
  tone?: "success" | "error" | "info";
  message: string;
};

const toneClass = {
  success: "border-zg-success/25 bg-zg-success-soft-bg text-zg-success",
  error: "border-zg-danger/25 bg-zg-danger-soft-bg text-zg-danger",
  info: "border-zg-info/25 bg-zg-info-soft-bg text-zg-info",
};

export default function ToastInline({ tone = "info", message }: ToastInlineProps) {
  return (
    <p
      className={cn(
        "rounded-xl border px-3 py-2 text-sm transition-colors duration-200 ease-out",
        toneClass[tone],
      )}
    >
      {message}
    </p>
  );
}
