import { Suspense } from "react";
import { FitmeAuthForm } from "@/components/fitme-app/FitmeAuthForm";

export default function LoginPage() {
  return (
    <Suspense>
      <FitmeAuthForm mode="login" />
    </Suspense>
  );
}
