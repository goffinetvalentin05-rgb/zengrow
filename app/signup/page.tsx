import { Suspense } from "react";
import { FitmeAuthForm } from "@/components/fitme-app/FitmeAuthForm";

export default function SignupPage() {
  return (
    <Suspense>
      <FitmeAuthForm mode="signup" />
    </Suspense>
  );
}
