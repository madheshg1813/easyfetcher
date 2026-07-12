// Scoped design tokens + hover/interaction styles for the Skills pages.
// Everything is namespaced under `.ef-skills` so it never leaks into the rest
// of the marketing site. Ported from the Claude design export.

const CSS = `
.ef-skills{
  --ink: oklch(0.21 0.034 264.665);
  --ink-2: oklch(0.279 0.041 260.031);
  --gray: oklch(0.446 0.03 256.802);
  --gray-2: oklch(0.554 0.046 257.417);
  --gray-3: oklch(0.704 0.04 256.788);
  --amber: oklch(0.769 0.188 70.08);
  --amber-strong: oklch(0.705 0.213 47.604);
  --yellow: oklch(0.828 0.189 84.429);
  --amber-soft: oklch(0.962 0.059 95.617);
  --amber-tint: oklch(0.987 0.022 95.277);
  --black: #000;
  --bg: #ffffff;
  --bg-soft: oklch(0.984 0.003 247.858);
  --bg-soft-2: oklch(0.968 0.007 247.896);
  --border: oklch(0.929 0.013 255.508);
  --border-soft: oklch(0.968 0.007 247.896);
  --radius-sm: 8px; --radius: 12px; --radius-lg: 16px; --radius-xl: 24px;
  --shadow-sm: 0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05);
  --shadow: 0 4px 6px -2px rgba(15,23,42,.04), 0 12px 20px -8px rgba(15,23,42,.10);
  --shadow-lg: 0 18px 40px -12px rgba(15,23,42,.18);
  --maxw: 1120px;
  background: var(--bg);
  color: var(--ink);
  font-size: 16px;
  line-height: 1.5;
}
.ef-skills h1,.ef-skills h2,.ef-skills h3,.ef-skills h4,.ef-skills p{margin:0}
.ef-skills a{color:inherit;text-decoration:none}
.ef-skills button{font-family:inherit}
.ef-skills ::selection{background:var(--amber-soft)}
.ef-skills .wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px}
.ef-skills a:focus-visible,.ef-skills button:focus-visible{outline:2px solid var(--amber);outline-offset:2px;border-radius:6px}
@keyframes ef-fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.ef-skills .ef-btn:hover{transform:translateY(-1px);filter:brightness(1.04)}
.ef-skills .ef-btn:active{transform:translateY(0)}
.ef-skills .ef-card:hover{transform:translateY(-4px);box-shadow:var(--shadow);border-color:var(--gray-3)}
.ef-skills .ef-cardtitle{transition:color .14s}
.ef-skills .ef-cardtitle:hover h3{color:var(--amber-strong)}
.ef-skills .ef-viewlink{display:inline-flex;align-items:center;gap:5px;font-size:13.5px;font-weight:600;color:var(--gray);padding:9px 10px;border-radius:8px;transition:color .14s,background .14s;white-space:nowrap}
.ef-skills .ef-viewlink:hover{color:var(--ink);background:var(--bg-soft)}
.ef-skills .ef-cattile:hover{transform:translateY(-3px);box-shadow:var(--shadow);border-color:var(--gray-3)}
.ef-skills .ef-crumb{color:var(--gray);transition:color .14s}
.ef-skills .ef-crumb:hover{color:var(--ink);text-decoration:underline;text-underline-offset:3px}
.ef-skills .ef-steplink{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:14.5px;font-weight:700;color:var(--ink);background:var(--amber-soft);border-radius:8px;padding:8px 14px;transition:transform .14s,filter .14s}
.ef-skills .ef-steplink:hover{transform:translateY(-1px);filter:brightness(1.03)}
.ef-skills .ef-inlinelink{color:var(--amber-strong);font-weight:600;text-decoration:underline;text-underline-offset:2px}
.ef-skills .ef-inlinelink:hover{color:var(--ink)}
.ef-skills .ef-search:focus{border-color:var(--amber);box-shadow:0 0 0 3px var(--amber-tint)}
.ef-skills .ef-footlink:hover{color:#fff}
@media (max-width: 920px){
  .ef-skills .ef-detail-hero{grid-template-columns:1fr !important;gap:32px !important}
  .ef-skills .ef-detail-hero h1{font-size:38px !important}
  .ef-skills .ef-two{grid-template-columns:1fr !important}
  .ef-skills .ef-hero{grid-template-columns:1fr !important;gap:36px !important}
  .ef-skills .ef-hero h1{font-size:44px !important}
}
@media (max-width: 760px){
  .ef-skills .ef-setupcard{grid-template-columns:1fr !important;gap:20px !important}
  .ef-skills .ef-setupcard-art{order:-1;max-width:320px}
}
@media (max-width: 640px){
  .ef-skills .wrap{padding:0 18px}
  .ef-skills .ef-detail-hero h1{font-size:32px !important}
  .ef-skills .ef-hero h1{font-size:36px !important}
}
`;

export default function SkillsTheme() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
