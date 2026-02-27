import { APP_NAME } from "@/lib/brand";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  markClassName?: string;
  nameClassName?: string;
};

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={joinClassNames("brand-logo-mark", className)}
      focusable="false"
    >
      <defs>
        <linearGradient id="scanrook-mark-bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="60%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#scanrook-mark-bg)" />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" stroke="#d6fbff" strokeOpacity="0.28" strokeWidth="1.5" />
      <path
        d="M22 16h6v5h2v-5h4v5h2v-5h6v10h-2v18a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V26h-2V16Z"
        fill="#f8fbff"
      />
      <rect x="29" y="30" width="6" height="3" rx="1" fill="#0e7490" opacity="0.88" />
    </svg>
  );
}

export default function BrandLogo({
  compact = false,
  className,
  markClassName,
  nameClassName,
}: BrandLogoProps) {
  return (
    <span className={joinClassNames("brand-lockup", className)}>
      <BrandMark className={markClassName} />
      {compact ? <span className="sr-only">{APP_NAME}</span> : <span className={joinClassNames("brand-lockup-name", nameClassName)}>{APP_NAME}</span>}
    </span>
  );
}
