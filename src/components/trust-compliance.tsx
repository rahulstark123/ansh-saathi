import { Building2, ShieldCheck, BadgeCheck, Receipt } from "lucide-react";

export const UDYAM_REGISTRATION_NUMBER = "UDYAM-BR-23-0127857";
export const GSTIN_NUMBER = "10DIUPR1358M1ZP";

type TrustComplianceProps = {
  label?: string;
  title?: string;
  tagline?: string;
  description?: string;
  msmeTitle?: string;
  msmeSubtitle?: string;
  udyamLabel?: string;
  gstinLabel?: string;
};

export function TrustCompliance({
  label = "Trust & Compliance",
  title = "ANSH Apps",
  tagline = "Built for every business. Ready for what's next.",
  description = "ANSH Apps is a Government of India MSME-registered software company building simple, affordable, and modern business software for teams, startups, and growing businesses.",
  msmeTitle = "MSME Registered Enterprise",
  msmeSubtitle = "Government of India Udyam Registered",
  udyamLabel = "Udyam Registration Number",
  gstinLabel = "GSTIN",
}: TrustComplianceProps) {
  return (
    <section id="trust-compliance" className="py-16 md:py-24 relative z-10">
      <div className="page-container max-w-5xl">
        <div className="reveal rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="h-4 w-4 text-primary-bright" aria-hidden />
                <span className="text-primary-bright font-semibold uppercase tracking-widest text-xs">
                  {label}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                {title}
              </h2>
              <p className="text-lg md:text-xl font-semibold text-white/90 mb-4">
                {tagline}
              </p>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{msmeTitle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{msmeSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <BadgeCheck className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    {udyamLabel}
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5 tracking-wide">
                    {UDYAM_REGISTRATION_NUMBER}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  <Receipt className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    {gstinLabel}
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5 tracking-wide">
                    {GSTIN_NUMBER}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
