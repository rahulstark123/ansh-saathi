import Image from "next/image";
import Link from "next/link";
import { MsmeBadge } from "@/components/msme-badge";

type SiteFooterProps = {
  msmeHref?: string;
  showRoadmap?: boolean;
};

export function SiteFooter({
  msmeHref = "/#trust-compliance",
  showRoadmap = true,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#060608] pt-24 pb-12 overflow-hidden">
      <div className="page-container">
        <div className="text-center mb-20 select-none">
          <p
            className="text-8xl sm:text-[7rem] md:text-[190px] lg:text-[250px] font-black tracking-tighter font-outfit bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#ec4899] bg-clip-text text-transparent leading-none"
            aria-hidden="true"
          >
            ANSH Apps
          </p>
          <p className="footer-tagline mt-3 md:mt-5 font-black tracking-tighter font-outfit leading-none text-shimmer-white text-lg sm:text-2xl md:text-3xl lg:text-4xl uppercase">
            Built for every business. Ready for what&apos;s next.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 pb-16 text-center sm:grid-cols-3 sm:gap-12 sm:text-left lg:gap-20">
          <div className="flex flex-col items-center gap-5 sm:items-start">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logoAnshapps.png"
                alt="ANSH Apps"
                width={80}
                height={32}
                className="h-7 w-auto"
              />
              <span className="text-xl font-bold font-outfit text-white tracking-wider">
                ANSH Apps
              </span>
            </div>
            <p className="text-[14px] text-gray-400 leading-relaxed max-w-[260px] mx-auto sm:mx-0">
              Simple, fast, and affordable apps built to run your business and simplify
              your daily life.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.facebook.com/anshapps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1877F2] hover:opacity-80 transition-opacity duration-200"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/anshapps?igsh=d2hwZHVmMWQ3cjJ1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E1306C] hover:opacity-80 transition-opacity duration-200"
                aria-label="Instagram"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UC87q1S2bTuzpj-VwFM6l6fw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF0000] hover:opacity-80 transition-opacity duration-200"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51a3.003 3.003 0 0 0-2.11 2.108C0 8.024 0 12 0 12s0 3.976.503 5.837a3.003 3.003 0 0 0 2.11 2.108c1.862.51 9.387.51 9.387.51s7.525 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.976 24 12 24 12s0-3.976-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 sm:items-start">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Product
            </span>
            <div className="flex flex-col gap-3 text-[14px] text-gray-400">
              <a
                href="https://tasks.anshapps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Ansh Tasks
              </a>
              <a
                href="https://hr.anshapps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Ansh HR
              </a>
              <a
                href="https://expense.anshapps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Ansh Expense
              </a>
              <a
                href="https://visitor.anshapps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Ansh Visitor
              </a>
              <a
                href="https://forms.anshapps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Ansh Forms
              </a>
              <a
                href="https://links.anshapps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Ansh Links
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 sm:items-start">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Get In Touch
            </span>
            <p className="text-[14px] text-gray-400 leading-relaxed max-w-[280px] mx-auto sm:mx-0">
              Have questions or need custom business plans? Talk to our creators.
            </p>
            <div className="flex items-center gap-2 mt-1 group">
              <svg
                className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a
                href="mailto:hello@anshapps.com"
                className="text-[14px] text-emerald-400 font-semibold hover:underline"
              >
                hello@anshapps.com
              </a>
            </div>
            <div className="flex items-center gap-2 group">
              <svg
                className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a
                href="tel:+919625727372"
                className="text-[14px] text-emerald-400 font-semibold hover:underline"
              >
                +91 96257 27372
              </a>
            </div>
            <div className="flex items-center gap-2 group">
              <svg
                className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <a
                href="https://wa.me/919625727372?text=Hi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-emerald-400 font-semibold hover:underline"
              >
                +91 96257 27372
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <MsmeBadge href={msmeHref} />
            <div className="flex flex-wrap gap-6 text-xs text-gray-500">
              <Link href="/saathi" className="hover:text-white transition-colors">
                ANSH Saathi
              </Link>
              {showRoadmap && (
                <Link href="/roadmap" className="hover:text-white transition-colors">
                  Roadmap
                </Link>
              )}
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 leading-normal max-w-4xl">
            The network illustration represents ANSH&apos;s vision of connecting businesses and partners worldwide and does not imply any government affiliation or endorsement.
          </p>
          <p className="text-xs text-gray-500">© 2026 ANSH Apps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
