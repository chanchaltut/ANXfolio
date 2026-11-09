import { LOGO_H, LOGO_PATH, LOGO_W } from "./logo-path";

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} role="img" aria-label="ANX">
      <path fill="currentColor" fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  );
}
