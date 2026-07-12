import Link from "next/link";
import { skillUrl, type Skill, type Category } from "@/lib/skills";
import { SIGNUP_URL } from "@/lib/constants";
import Icon from "./Icon";
import { SourceChips, Button } from "./primitives";
import { SkillMedia } from "./Thumbnail";

export function SkillCard({ skill }: { skill: Skill }) {
  const url = skillUrl(skill.id);
  return (
    <article className="ef-card" style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden",
      display: "flex", flexDirection: "column", transition: "transform .16s cubic-bezier(.2,0,0,1), box-shadow .16s, border-color .16s",
    }}>
      <Link href={url} style={{ position: "relative", display: "block" }}>
        <SkillMedia skill={skill} showBadge={false} />
      </Link>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <Link href={url} className="ef-cardtitle" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, display: "grid", placeItems: "center", background: "var(--bg-soft)", border: "1px solid var(--border)" }}>
            <Icon name={skill.icon} size={17} style={{ color: "var(--ink)" }} />
          </span>
          <h3 style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--ink)", lineHeight: 1.25, marginTop: 2 }}>{skill.name}</h3>
        </Link>
        <p style={{ fontSize: 13.8, lineHeight: 1.55, color: "var(--gray)", margin: 0, flex: 1 }}>{skill.desc}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <SourceChips sources={skill.sources} />
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 4, alignItems: "center" }}>
          <Link href={SIGNUP_URL} style={{ flex: 1 }}>
            <Button size="sm" style={{ width: "100%" }} leading={<Icon name="download" size={15} />}>Download Skill</Button>
          </Link>
          <Link href={url} className="ef-viewlink">View skill <Icon name="arrow-up-right" size={14} /></Link>
        </div>
      </div>
    </article>
  );
}

export function CategoryTile({ cat, skills, active, onPick }: { cat: Category; skills: Skill[]; active: boolean; onPick: (id: Category["id"]) => void }) {
  const count = skills.length;
  return (
    <button onClick={() => onPick(cat.id)} className="ef-cattile" style={{
      textAlign: "left", cursor: "pointer", background: active ? "var(--amber-tint)" : "#fff",
      border: `1px solid ${active ? "color-mix(in oklch, var(--amber) 45%, white)" : "var(--border)"}`,
      borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12,
      transition: "transform .16s cubic-bezier(.2,0,0,1), box-shadow .16s, border-color .16s, background .16s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--ink)", flex: "none" }}>
          <Icon name={cat.icon} size={20} style={{ color: "var(--amber)" }} />
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16.5, letterSpacing: "-0.01em" }}>{cat.label}</div>
          <div style={{ fontSize: 12.5, color: "var(--gray-2)", fontWeight: 500 }}>{count} skills</div>
        </div>
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--gray)", margin: 0 }}>{cat.blurb}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
        {skills.map((s) => (
          <span key={s.id} style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray)", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>{s.name}</span>
        ))}
      </div>
    </button>
  );
}
