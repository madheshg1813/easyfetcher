// Clean SVG illustrations for the "Up and running" setup steps — one per step,
// in EasyFetcher's slate + amber palette. No external images.

const C = {
  ink: "#1e2433",
  ink2: "#3a4256",
  line: "#e2e8f0",
  line2: "#eef2f7",
  amber: "#f0900e",
  amberSoft: "#fff4e6",
  green: "#16a34a",
  slate: "#94a3b8",
  panel: "#ffffff",
  blue: "#2f5fd0",
  blueSoft: "#e9effc",
};

const box = { width: "100%", height: "100%", display: "block" } as const;

function SignUp() {
  return (
    <svg viewBox="0 0 260 150" style={box} preserveAspectRatio="xMidYMid meet">
      <rect x="46" y="20" width="168" height="110" rx="13" fill={C.panel} stroke={C.line} />
      <rect x="64" y="38" width="74" height="7" rx="3.5" fill={C.ink} />
      <rect x="176" y="32" width="30" height="14" rx="7" fill={C.amberSoft} />
      <text x="191" y="42" fontFamily="Inter" fontSize="7" fontWeight="700" fill={C.amber} textAnchor="middle">Free</text>
      <rect x="64" y="56" width="132" height="15" rx="5" fill={C.line2} stroke={C.line} />
      <rect x="64" y="77" width="132" height="15" rx="5" fill={C.line2} stroke={C.line} />
      <rect x="64" y="100" width="132" height="18" rx="6" fill={C.ink} />
      <text x="130" y="112" fontFamily="Inter" fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle">Sign up free</text>
    </svg>
  );
}

function Connect() {
  return (
    <svg viewBox="0 0 260 150" style={box} preserveAspectRatio="xMidYMid meet">
      <line x1="92" y1="70" x2="168" y2="70" stroke={C.slate} strokeWidth="2" strokeDasharray="4 4" />
      {/* EasyFetcher node */}
      <rect x="48" y="48" width="44" height="44" rx="12" fill={C.ink} />
      <text x="70" y="76" fontFamily="Inter" fontSize="15" fontWeight="800" fill={C.amber} textAnchor="middle">ef</text>
      <text x="70" y="108" fontFamily="Inter" fontSize="7.5" fontWeight="600" fill={C.slate} textAnchor="middle">EasyFetcher</text>
      {/* SERP API node */}
      <rect x="168" y="48" width="44" height="44" rx="12" fill={C.blueSoft} stroke="#cdd9f5" />
      <text x="190" y="75" fontFamily="Inter" fontSize="11" fontWeight="800" fill={C.blue} textAnchor="middle">API</text>
      <text x="190" y="108" fontFamily="Inter" fontSize="7.5" fontWeight="600" fill={C.slate} textAnchor="middle">Live SERP API</text>
      {/* connected check */}
      <circle cx="130" cy="70" r="12" fill={C.green} />
      <path d="M124.5 70 l3.5 3.5 l6 -7" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadHub() {
  return (
    <svg viewBox="0 0 260 150" style={box} preserveAspectRatio="xMidYMid meet">
      {/* card A (dimmed) */}
      <rect x="34" y="30" width="92" height="92" rx="11" fill={C.panel} stroke={C.line} />
      <rect x="34" y="30" width="92" height="38" rx="11" fill={C.line2} />
      <rect x="46" y="78" width="56" height="6" rx="3" fill={C.line} />
      <rect x="46" y="90" width="40" height="5" rx="2.5" fill={C.line2} />
      <rect x="46" y="104" width="68" height="12" rx="4" fill={C.line} />
      {/* card B (highlighted) */}
      <rect x="134" y="30" width="92" height="92" rx="11" fill={C.panel} stroke={C.amber} strokeWidth="1.6" />
      <rect x="134" y="30" width="92" height="38" rx="11" fill={C.amberSoft} />
      <circle cx="160" cy="49" r="9" fill="#fff" stroke={C.line} />
      <path d="M160 45 v6 M157 48.5 l3 3 l3 -3" fill="none" stroke={C.amber} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="146" y="78" width="56" height="6" rx="3" fill={C.ink} />
      <rect x="146" y="90" width="40" height="5" rx="2.5" fill={C.line} />
      <rect x="146" y="103" width="68" height="14" rx="5" fill={C.ink} />
      <text x="180" y="113" fontFamily="Inter" fontSize="7.5" fontWeight="700" fill="#fff" textAnchor="middle">Download</text>
    </svg>
  );
}

// Keep illustration labels short so they never overflow the SVG tile.
function short(name: string) {
  return name.length > 20 ? name.slice(0, 19) + "…" : name;
}

function AddToClaude({ skillName }: { skillName: string }) {
  return (
    <svg viewBox="0 0 260 150" style={box} preserveAspectRatio="xMidYMid meet">
      <rect x="42" y="22" width="176" height="106" rx="13" fill={C.panel} stroke={C.line} />
      <path d="M42 35 a13 13 0 0 1 13 -13 h150 a13 13 0 0 1 13 13 v10 h-176 z" fill={C.ink} />
      <path d="M58 28 l1.6 3.6 l3.6 1.6 l-3.6 1.6 l-1.6 3.6 l-1.6 -3.6 l-3.6 -1.6 l3.6 -1.6 z" fill={C.amber} />
      <text x="70" y="37" fontFamily="Inter" fontSize="8.5" fontWeight="700" fill="#fff">Claude</text>
      {/* skill tile added */}
      <rect x="60" y="62" width="140" height="30" rx="9" fill={C.amberSoft} stroke="#f7d9a8" />
      <rect x="70" y="70" width="14" height="14" rx="4" fill={C.ink} />
      <text x="92" y="80" fontFamily="Inter" fontSize="8" fontWeight="700" fill={C.ink}>{short(skillName)}</text>
      <circle cx="186" cy="77" r="8" fill={C.green} />
      <path d="M182.5 77 l2.5 2.5 l4 -5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="60" y="112" fontFamily="Inter" fontSize="8" fontWeight="600" fill={C.slate}>Skill added to Claude</text>
    </svg>
  );
}

function AskReport({ skillName }: { skillName: string }) {
  return (
    <svg viewBox="0 0 260 150" style={box} preserveAspectRatio="xMidYMid meet">
      {/* user prompt */}
      <rect x="88" y="22" width="132" height="24" rx="9" fill={C.ink} />
      <text x="154" y="37" fontFamily="Inter" fontSize="8" fontWeight="600" fill="#fff" textAnchor="middle">run {short(skillName)}</text>
      {/* assistant answer */}
      <rect x="40" y="56" width="180" height="74" rx="11" fill={C.panel} stroke={C.line} />
      {/* mini stats */}
      {[["Top 3", "2"], ["Top 10", "4"], ["Mover", "+6"]].map((m, i) => (
        <g key={i} transform={`translate(${52 + i * 56}, 66)`}>
          <rect x="0" y="0" width="48" height="26" rx="6" fill={C.line2} />
          <text x="8" y="11" fontFamily="Inter" fontSize="6" fontWeight="700" fill={C.slate}>{m[0].toUpperCase()}</text>
          <text x="8" y="21" fontFamily="Inter" fontSize="10" fontWeight="800" fill={i === 2 ? C.green : C.ink}>{m[1]}</text>
        </g>
      ))}
      {/* sparkline */}
      <path d="M52 118 C72 112 92 114 112 104 C132 96 152 100 172 90 C188 84 200 88 208 84"
        fill="none" stroke={C.amber} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="208" cy="84" r="2.6" fill={C.amber} />
    </svg>
  );
}

export default function StepArt({ step, skillName }: { step: number; skillName: string }) {
  const art =
    step === 0 ? <SignUp /> :
    step === 1 ? <Connect /> :
    step === 2 ? <DownloadHub /> :
    step === 3 ? <AddToClaude skillName={skillName} /> :
    <AskReport skillName={skillName} />;
  return (
    <div style={{
      aspectRatio: "260 / 150", width: "100%", borderRadius: 12, overflow: "hidden",
      background: "linear-gradient(160deg, var(--bg-soft) 0%, var(--bg-soft-2) 100%)",
      border: "1px solid var(--border)",
    }}>
      {art}
    </div>
  );
}
