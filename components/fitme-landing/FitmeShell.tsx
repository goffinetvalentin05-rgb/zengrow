import { fitmeBody, fitmeDisplay } from "./fonts";
import { Navbar } from "./sections/Navbar";
import { Footer } from "./sections/Footer";
import "./fitme.css";

export function FitmeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`fitme ${fitmeDisplay.variable} ${fitmeBody.variable}`}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
