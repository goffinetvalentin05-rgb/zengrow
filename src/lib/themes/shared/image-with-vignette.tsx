import type { ReactNode } from "react";

type ImageWithVignetteProps = {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
};

/**
 * Assombrit les coins des visuels hero (complément éventuel aux overlays CSS).
 */
export default function ImageWithVignette({ children, className = "", enabled = true }: ImageWithVignetteProps) {
  if (!enabled) return <>{children}</>;
  return (
    <div className={`relative ${className}`.trim()}>
      {children}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 85% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.38) 100%),
            radial-gradient(ellipse 110% 90% at 18% 12%, rgba(0,0,0,0.42) 0%, transparent 42%),
            radial-gradient(ellipse 110% 90% at 82% 18%, rgba(0,0,0,0.42) 0%, transparent 42%)
          `,
        }}
        aria-hidden
      />
    </div>
  );
}
