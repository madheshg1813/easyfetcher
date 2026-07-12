import type { CSSProperties, ReactNode, ButtonHTMLAttributes } from "react";
import { type SourceId } from "@/lib/skills";

type ButtonVariant = "primary" | "soft" | "outline" | "ghost" | "amber";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  leading,
  trailing,
  className,
  style,
  ...rest
}: ButtonProps) {
  const pad = { sm: "9px 16px", md: "12px 22px", lg: "15px 28px" }[size];
  const fs = { sm: 14, md: 15, lg: 16 }[size];
  const palettes: Record<ButtonVariant, { bg: string; fg: string; bd: string; radius: number; shadow: string }> = {
    primary: { bg: "var(--black)", fg: "#fff", bd: "var(--black)", radius: 8, shadow: "var(--shadow-sm)" },
    soft: { bg: "var(--amber-soft)", fg: "var(--ink)", bd: "transparent", radius: 999, shadow: "none" },
    outline: { bg: "#fff", fg: "var(--ink)", bd: "var(--border)", radius: 8, shadow: "var(--shadow-sm)" },
    ghost: { bg: "transparent", fg: "var(--ink)", bd: "transparent", radius: 8, shadow: "none" },
    amber: { bg: "var(--amber)", fg: "var(--ink)", bd: "var(--amber)", radius: 8, shadow: "var(--shadow-sm)" },
  };
  const p = palettes[variant] || palettes.primary;
  return (
    <button
      {...rest}
      className={"ef-btn " + (className || "")}
      style={{
        fontWeight: 600, fontSize: fs, lineHeight: 1.2, letterSpacing: "-0.01em",
        background: p.bg, color: p.fg, border: `1px solid ${p.bd}`,
        borderRadius: p.radius, boxShadow: p.shadow, padding: pad, cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "transform .14s cubic-bezier(.2,0,0,1), box-shadow .14s, background .14s, filter .14s",
        whiteSpace: "nowrap", ...style,
      }}
    >
      {leading}{children}{trailing}
    </button>
  );
}

type PillTone = "amber" | "slate" | "dark" | "new";

export function Pill({ children, tone = "amber", style }: { children: ReactNode; tone?: PillTone; style?: CSSProperties }) {
  const tones: Record<PillTone, { bg: string; fg: string; bd: string }> = {
    amber: { bg: "var(--amber-tint)", fg: "var(--amber-strong)", bd: "color-mix(in oklch, var(--amber) 35%, white)" },
    slate: { bg: "var(--bg-soft)", fg: "var(--gray)", bd: "var(--border)" },
    dark: { bg: "var(--ink)", fg: "#fff", bd: "var(--ink)" },
    new: { bg: "var(--amber)", fg: "var(--ink)", bd: "var(--amber)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", borderRadius: 999,
      fontWeight: 600, fontSize: 12.5, lineHeight: 1, letterSpacing: "-0.005em",
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, whiteSpace: "nowrap", ...style,
    }}>{children}</span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      fontWeight: 600, fontSize: 13, letterSpacing: ".06em",
      textTransform: "uppercase", color: "var(--amber-strong)",
    }}>
      <span style={{ width: 18, height: 2, background: "var(--amber)", borderRadius: 2 }} />
      {children}
    </div>
  );
}

// Data-source chip with the real logo. Sources with no external logo (the live
// SERP API) fall back to the Easy Fetcher mark — as does any skill with no
// connected source, since it still runs through Easy Fetcher.
const EF_CHIP = { logo: "/ef-icon.png", label: "Easy Fetcher" };

const SOURCE_LOGO: Record<SourceId, { logo: string; label: string }> = {
  gsc: { logo: "/connectors/gsc.svg", label: "Search Console" },
  ga4: { logo: "/connectors/google-analytics.svg", label: "GA4" },
  psi: { logo: "/connectors/pagespeed.svg", label: "PageSpeed" },
  serp: EF_CHIP,
};

function LogoChip({ logo, label }: { logo: string; label: string }) {
  return (
    <span title={label} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "4px 11px 4px 6px", borderRadius: 999,
      background: "var(--bg-soft)", border: "1px solid var(--border)", whiteSpace: "nowrap",
      fontSize: 12, fontWeight: 600, color: "var(--gray)",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt={label} width={16} height={16} style={{ width: 16, height: 16, objectFit: "contain", display: "block" }} />
      {label}
    </span>
  );
}

export function SourceChip({ id }: { id: SourceId }) {
  return <LogoChip {...SOURCE_LOGO[id]} />;
}

// Renders one chip per connected source, or a single Easy Fetcher chip when the
// skill uses no external data source.
export function SourceChips({ sources }: { sources: SourceId[] }) {
  const chips = sources.length ? sources.map((s) => SOURCE_LOGO[s]) : [EF_CHIP];
  return (
    <>
      {chips.map((c, i) => <LogoChip key={i} {...c} />)}
    </>
  );
}
