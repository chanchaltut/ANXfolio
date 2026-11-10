export function Arrow({ left = false }: { left?: boolean }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={left ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function Chevron({ left = false }: { left?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={left ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export function Eye({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="icon-eye"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function InstagramGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="icon-ig"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/** "40M+" with an eye, plus the platform's glyph so it's clear where the views were counted. */
export function ViewCount({ views, source }: { views: string; source?: string }) {
  const onInstagram = !source || /insta/i.test(source);
  return (
    <span className="views" title={`${views} views on ${source ?? "Instagram"}`}>
      <Eye />
      <b>{views}</b>
      {onInstagram && <InstagramGlyph size={14} />}
      <span className="sr-only"> views on {source ?? "Instagram"}</span>
    </span>
  );
}
