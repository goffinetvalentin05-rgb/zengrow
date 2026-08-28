"use client";

import { LocaleProvider } from "./locale-provider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageCanvas } from "./PageCanvas";
import "./landing.css";

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className="go">
        <PageCanvas />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </LocaleProvider>
  );
}
