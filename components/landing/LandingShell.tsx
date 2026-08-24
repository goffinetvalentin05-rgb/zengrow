"use client";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import "./landing.css";

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="go">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
