import Image from "next/image";
import Link from "next/link";
import { Container } from "../ui";

export function Footer() {
  return (
    <footer className="border-t border-white/6 py-10">
      <Container className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-zengrow.png" alt="ZenGrow" width={32} height={32} className="rounded-lg" />
          <span className="zg-display font-bold text-white">ZenGrow</span>
        </Link>
        <p className="text-center text-sm text-[#9b8fb8]">
          Plateforme IA pour restaurants — Suisse
        </p>
        <div className="flex gap-6 text-sm">
          <Link href="/login" className="text-[#9b8fb8] transition hover:text-white">
            Connexion
          </Link>
          <Link href="/signup" className="text-[#9b8fb8] transition hover:text-white">
            Inscription
          </Link>
        </div>
      </Container>
    </footer>
  );
}
