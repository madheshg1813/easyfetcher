import Link from "next/link";
import Image from "next/image";
import { SIGNUP_URL, LOGIN_URL } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #0e1b2f 0%, #091320 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/ef-icon.png"
                alt="EasyFetcher"
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold tracking-normal text-white">
                Easy <span className="text-amber-500">Fetcher</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Connect your marketing data to Claude AI via the Model Context Protocol.
            </p>
          </div>

          <div className="flex gap-14 sm:gap-20">
            <div>
              <p className="text-white font-bold text-sm mb-5 uppercase tracking-wider text-[13px]">Product</p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/#connectors" className="hover:text-white transition-colors">Integrations</a></li>
                <li><Link href="/skills" className="hover:text-white transition-colors">Skills</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/blogs" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-5 uppercase tracking-wider text-[13px]">Company</p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href={LOGIN_URL} className="hover:text-white transition-colors">Sign in</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} EasyFetcher. All rights reserved.</p>
          <Link
            href={SIGNUP_URL}
            className="px-6 py-2.5 rounded-xl bg-white text-[#0e1b2f] text-sm font-bold hover:bg-gray-100 transition-all shadow-lg shadow-black/10 hover:-translate-y-px"
          >
            Get started free →
          </Link>
        </div>
      </div>
    </footer>
  );
}
