"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function FitmeErrorState({
  title,
  message,
  actionLabel = "Réessayer",
  onAction,
  href,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="fitme-error-screen"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="fitme-eyebrow">FITME</p>
      <h1>{title}</h1>
      <p className="fitme-lead">{message}</p>
      {href ? (
        <Link href={href} className="fitme-cta" style={{ marginTop: "1.4rem" }}>
          {actionLabel}
        </Link>
      ) : (
        <button type="button" className="fitme-cta" style={{ marginTop: "1.4rem" }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </motion.article>
  );
}
