import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Sign up" };

const CDN = "https://res.cloudinary.com/dbsdu7dk5/image/upload";
const AVATARS = [1, 2, 3, 4, 5, 6].map(
  (n) => `${CDN}/c_fill,g_face,w_88,h_88,f_auto,q_auto/easyfetcher/avatars/marketer-${n}.jpg`
);
const ASSISTANTS = [
  { name: "Claude", src: `${CDN}/f_auto,q_auto/easyfetcher/connectors/claude-color` },
  { name: "ChatGPT", src: `${CDN}/f_auto,q_auto/easyfetcher/connectors/chatgpt` },
  { name: "Perplexity", src: `${CDN}/f_auto,q_auto/easyfetcher/connectors/perplexity` },
];
const CHECKS = [
  "Track keyword ranks & spot movers daily",
  "Full SEO & technical audits, prioritised",
  "Client-ready reports in ~2 minutes",
];

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l3 6.3 6.9.9-5 4.8 1.2 6.8L12 17.8 5.9 20.8 7.1 14 2 9.2l6.9-.9z" />
    </svg>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.02fr] bg-[#fbfaf7]">
      {/* LEFT — Clerk sign-up */}
      <div className="flex flex-col px-6 sm:px-10 lg:px-16 py-7">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/ef-icon.png" alt="" width={36} height={36} className="w-9 h-9 object-contain" aria-hidden />
            <span className="text-lg font-extrabold tracking-tight text-[#14181f]">
              Easy <span className="text-amber-500">Fetcher</span>
            </span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-amber-600">
            Sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md py-8">
            <h1 className="text-[30px] font-extrabold tracking-tight text-[#14181f] leading-[1.12] text-balance">
              Create your Easy Fetcher account
            </h1>
            <p className="text-slate-500 text-[15px] mt-2.5 mb-6">
              Connect your data and run SEO skills in your AI assistant — in plain language.
            </p>

            <SignUp
              forceRedirectUrl="/dashboard/billing"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent p-0 w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "bg-[#0e1b2f] hover:bg-[#1c3050] text-white",
                  footerActionLink: "text-amber-600 hover:text-amber-700",
                  // Hide Clerk branding badge (kept from the previous page)
                  footer: { "& .cl-powered-by-clerk": { display: "none" } },
                  internal_poweredByClerk: { display: "none" },
                  poweredByClerk: { display: "none" },
                },
              }}
            />

            <p className="mt-5 text-center text-[12.5px] text-slate-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="https://www.easyfetcher.com/terms" className="text-slate-600 font-semibold underline underline-offset-2 hover:text-amber-600">Terms of Service</a>{" "}
              and{" "}
              <a href="https://www.easyfetcher.com/privacy" className="text-slate-600 font-semibold underline underline-offset-2 hover:text-amber-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — SEO trust panel */}
      <aside className="relative hidden lg:flex flex-col justify-center overflow-hidden px-16 text-slate-100
        bg-[radial-gradient(120%_80%_at_85%_0%,rgba(245,158,11,.20),transparent_55%),linear-gradient(160deg,#0e1b2f_0%,#13233c_55%,#1c3050_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-50
          [background-image:radial-gradient(rgba(255,255,255,.05)_1px,transparent_1.4px)] [background-size:22px_22px]
          [mask-image:linear-gradient(180deg,transparent,#000_40%,transparent)]" />
        <div className="relative max-w-[470px]">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-amber-500 before:content-[''] before:w-5 before:h-0.5 before:bg-amber-500 before:rounded">
            SEO for Claude, ChatGPT &amp; Perplexity
          </span>
          <h2 className="text-[42px] font-extrabold tracking-tight leading-[1.08] mt-[18px] text-balance">
            Your entire SEO workflow, <span className="text-amber-500">inside your AI assistant.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mt-4 max-w-[430px]">
            Rank tracking, site audits, client reports and AI-visibility — run on your own Search Console, GA4 and PageSpeed data, in plain language.
          </p>

          {/* Works with — AI assistant logos */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-[.1em] text-slate-400">Works with</span>
            <div className="flex gap-2">
              {ASSISTANTS.map((a) => (
                <span key={a.name} title={a.name} className="w-[34px] h-[34px] rounded-[9px] bg-white grid place-items-center shadow-[0_2px_8px_rgba(0,0,0,.25)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.src} alt={a.name} width={18} height={18} className="w-[18px] h-[18px] object-contain" />
                </span>
              ))}
            </div>
          </div>

          <ul className="flex flex-col gap-3 mt-7">
            {CHECKS.map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px] text-slate-200">
                <span className="w-6 h-6 rounded-[7px] grid place-items-center bg-amber-500/15 text-amber-500">
                  <Check className="w-3.5 h-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          {/* trust: real marketer photos + rating */}
          <div className="mt-9 flex items-center gap-4 flex-wrap rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
            <div className="flex">
              {AVATARS.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt="SEO marketer"
                  width={44}
                  height={44}
                  className={`w-11 h-11 rounded-full object-cover border-[2.5px] border-[#13233c] ${i > 0 ? "-ml-3" : ""}`}
                />
              ))}
              <span className="w-11 h-11 rounded-full grid place-items-center text-xs font-extrabold text-slate-200 border-[2.5px] border-[#13233c] bg-white/15 -ml-3">
                1k+
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-[15px] h-[15px]" />)}
              </span>
              <b className="text-[14.5px] font-bold text-white">Trusted by 1,000s of SEO marketers &amp; agencies</b>
              <small className="text-[12.5px] text-slate-400">4.9/5 average rating · used across 40+ countries</small>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
