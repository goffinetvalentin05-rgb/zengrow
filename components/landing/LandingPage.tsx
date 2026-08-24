import { goDisplay } from "./fonts";
import { LandingPageClient } from "./landing-page-client";

export function LandingPage() {
  return (
    <div className={goDisplay.variable}>
      <LandingPageClient />
    </div>
  );
}
