import Link from "next/link";
import { Building2 } from "lucide-react";

export const DEFAULT_TRUST_COMPLIANCE_HREF = "/#trust-compliance";

export interface MsmeBadgeProps {
  href?: string;
  className?: string;
}

export function MsmeBadge({
  href = DEFAULT_TRUST_COMPLIANCE_HREF,
  className = "",
}: MsmeBadgeProps) {
  const isExternal = href.startsWith("http");

  const content = (
    <>
      <Building2
        className="h-3.5 w-3.5 shrink-0 text-emerald-400/90"
        aria-hidden
      />
      <span className="flex flex-col items-start leading-tight text-left">
        <span className="text-[11px] font-semibold text-gray-300">
          MSME Registered Enterprise
        </span>
        <span className="text-[10px] text-gray-500">
          Government of India Udyam Registered
        </span>
      </span>
    </>
  );

  const baseClassName = `group inline-flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 transition-colors hover:border-white/15 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClassName}
        aria-label="MSME Registered Enterprise — view trust and compliance details on ANSH Apps"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={baseClassName}
      aria-label="MSME Registered Enterprise — view trust and compliance details"
    >
      {content}
    </Link>
  );
}
