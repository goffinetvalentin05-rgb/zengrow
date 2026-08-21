import { Suspense } from "react";
import { PaymentSuccessClient } from "@/components/fitme-app/PaymentSuccessClient";

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessClient />
    </Suspense>
  );
}
