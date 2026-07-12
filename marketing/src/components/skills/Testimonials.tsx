import { TESTIMONIALS } from "@/lib/testimonials";
import { Eyebrow } from "./primitives";

// Client testimonials band — shared, not page-specific. Colors are hard-coded
// (not theme vars) so the component renders identically outside .ef-skills too.
const C = {
  ink: "#1e2433",
  gray: "#5b6472",
  grayMute: "#8a94a3",
  border: "#e9ecf1",
  star: "#f59e0b",
  amberSoft: "#fff4e6",
  amberStrong: "#d97706",
};

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }} aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={C.star} aria-hidden>
          <path d="M12 2l2.9 6.26 6.6.72-4.9 4.55 1.3 6.47L12 16.77 6.1 20l1.3-6.47L2.5 8.98l6.6-.72z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section style={{ background: "linear-gradient(180deg, #fffdf5 0%, #fffbeb 100%)", padding: "80px 0", borderTop: `1px solid ${C.border}` }}>
      <div className="wrap">
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 44px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow>Customers</Eyebrow></div>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: C.ink }}>
            Loved by marketers
          </h2>
        </div>
        <div className="ef-testgrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18,
              padding: "26px 26px 24px", display: "flex", flexDirection: "column", gap: 16,
              boxShadow: "0 4px 14px -6px rgba(15,23,42,.08)",
            }}>
              <Stars n={t.stars} />
              <p style={{ fontSize: 15, lineHeight: 1.65, color: C.gray, margin: 0, flex: 1 }}>
                “{t.quote}”
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 999, display: "grid", placeItems: "center",
                  background: C.amberSoft, color: C.amberStrong, fontWeight: 800, fontSize: 14,
                }}>
                  {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: C.ink }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: C.grayMute }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
