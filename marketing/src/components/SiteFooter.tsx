import { Zap } from "lucide-react";
import Link from "next/link";
import { SIGNUP_URL, LOGIN_URL } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="py-10 sm:py-12 px-4 sm:px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="EasyFetcher" className="h-8 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Connect your marketing data to Claude AI via the Model Context Protocol.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <div>
              <p className="text-white font-semibold text-sm mb-4">Product</p>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/#connectors" className="hover:text-white transition-colors">Integrations</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Company</p>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href={LOGIN_URL} className="hover:text-white transition-colors">Sign in</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} EasyFetcher. All rights reserved.</p>
          <Link
            href={SIGNUP_URL}
            className="px-5 py-2.5 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </div>
    </footer>
  );
}
