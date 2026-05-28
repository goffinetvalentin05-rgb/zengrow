import { Suspense, type ReactNode } from "react";

export default function ReputationLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
