import type { ComponentType } from "react";
import { IMAGES } from "@/lib/cloudinary";

// Codex and Cursor aren't in the Cloudinary asset set, so they're inlined as
// SVG (zero network request, can't 404) rather than served from /public.
function CodexLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M19.503 0H4.496A4.496 4.496 0 000 4.496v15.007A4.496 4.496 0 004.496 24h15.007A4.496 4.496 0 0024 19.503V4.496A4.496 4.496 0 0019.503 0z" fill="#fff" />
      <path d="M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.09.09 0 00.043 0 4.55 4.55 0 013.046.275l.047.022.116.057a4.581 4.581 0 012.188 2.399c.209.51.313 1.041.315 1.595a4.24 4.24 0 01-.134 1.223.123.123 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.123.123 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.107.107 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.441 4.441 0 01-1.945-.466 4.544 4.544 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.81 5.81 0 01-.37-.961 4.582 4.582 0 01-.014-2.298.124.124 0 00.006-.056.085.085 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.896 3.896 0 01-.251-1.192 5.189 5.189 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33.215-.089.43-.164.646-.227a.098.098 0 00.065-.066 4.51 4.51 0 01.829-1.615 4.535 4.535 0 011.837-1.388zm3.482 10.565a.637.637 0 000 1.272h3.636a.637.637 0 100-1.272h-3.636zM8.462 9.23a.637.637 0 00-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 101.095.649l1.454-2.455a.636.636 0 00.005-.64L8.462 9.23z" fill="url(#codex-g)" />
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="codex-g" x1="12" x2="12" y1="3" y2="21">
          <stop stopColor="#B1A7FF" /><stop offset=".5" stopColor="#7A9DFF" /><stop offset="1" stopColor="#3941FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
function CursorLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M11.925 24l10.425-6-10.425-6L1.5 18l10.425 6z" fill="url(#cursor-0)" />
      <path d="M22.35 18V6L11.925 0v12l10.425 6z" fill="url(#cursor-1)" />
      <path d="M11.925 0L1.5 6v12l10.425-6V0z" fill="url(#cursor-2)" />
      <path d="M22.35 6L11.925 24V12L22.35 6z" fill="#555" />
      <path d="M22.35 6l-10.425 6L1.5 6h20.85z" fill="#000" />
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="cursor-0" x1="11.925" x2="11.925" y1="12" y2="24"><stop offset=".16" stopColor="#000" stopOpacity=".39" /><stop offset=".658" stopColor="#000" stopOpacity=".8" /></linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" id="cursor-1" x1="22.35" x2="11.925" y1="6.037" y2="12.15"><stop offset=".182" stopColor="#000" stopOpacity=".31" /><stop offset=".715" stopColor="#000" stopOpacity="0" /></linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" id="cursor-2" x1="11.925" x2="1.5" y1="0" y2="18"><stop stopColor="#000" stopOpacity=".6" /><stop offset=".667" stopColor="#000" stopOpacity=".22" /></linearGradient>
      </defs>
    </svg>
  );
}

// MCP is client-agnostic — the same server works across every MCP-capable AI.
// Logos come from Cloudinary (auto-optimized) where available; Claude Code
// reuses the Claude mark; Codex/Cursor are inlined SVG (not on Cloudinary).
const PLATFORMS: { name: string; logo?: string; Svg?: ComponentType<{ className?: string }> }[] = [
  { name: "Claude", logo: IMAGES.destinations.claude },
  { name: "Claude Code", logo: IMAGES.destinations.claude },
  { name: "ChatGPT", logo: IMAGES.destinations.chatgpt },
  { name: "Codex", Svg: CodexLogo },
  { name: "Perplexity", logo: IMAGES.destinations.perplexity },
  { name: "Cursor", Svg: CursorLogo },
  { name: "Gemini CLI", logo: IMAGES.connectors.gemini },
];

// The "works with any MCP-compatible AI" strip, shared by every MCP page.
export default function PlatformsRow() {
  return (
    <section className="py-10 px-4 sm:px-6 bg-white border-y border-gray-100/80">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-5">
          Works with any MCP-compatible AI
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {PLATFORMS.map((p) => {
            const Svg = p.Svg;
            return (
              <span key={p.name} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt="" width={16} height={16} loading="lazy" decoding="async" className="w-4 h-4 object-contain" />
                ) : Svg ? (
                  <Svg className="w-4 h-4" />
                ) : null}
                {p.name}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
