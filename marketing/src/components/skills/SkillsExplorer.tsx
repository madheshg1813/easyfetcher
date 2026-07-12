"use client";

import { useState } from "react";
import { type Skill, type Category, type CategoryId } from "@/lib/skills";
import Icon from "./Icon";
import { Eyebrow } from "./primitives";
import { SkillCard, CategoryTile } from "./SkillCard";

type FilterId = "all" | CategoryId;

// `skills` and `categories` are the currently-published set, computed server-side
// (build time) by the hub page, so scheduling gates what appears here.
export default function SkillsExplorer({ skills, categories }: { skills: Skill[]; categories: Category[] }) {
  const [cat, setCat] = useState<FilterId>("all");
  const [q, setQ] = useState("");

  const pick = (id: CategoryId) => {
    setCat(id);
    setTimeout(() => document.getElementById("skills")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const filtered = skills.filter((s) => {
    const okCat = cat === "all" || s.cat === cat;
    const okQ = !q.trim() || (s.name + " " + s.desc).toLowerCase().includes(q.trim().toLowerCase());
    return okCat && okQ;
  });

  const chips: { id: FilterId; label: string; icon: string }[] = [
    { id: "all", label: "All skills", icon: "layout-grid" },
    ...categories.map((c) => ({ id: c.id as FilterId, label: c.label, icon: c.icon })),
  ];

  return (
    <>
      {/* Filterable grid */}
      <section id="skills" style={{ background: "var(--bg-soft)", padding: "76px 0 90px", borderTop: "1px solid var(--border)", scrollMarginTop: 24 }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 26 }}>
            <div>
              <Eyebrow>The Library</Eyebrow>
              <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: "var(--ink)" }}>
                Featured Claude SEO skills
              </h2>
            </div>
            <div style={{ position: "relative", minWidth: 280 }}>
              <Icon name="search" size={17} style={{ color: "var(--gray-2)", position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills…"
                style={{
                  width: "100%", padding: "12px 14px 12px 40px", fontSize: 14.5, fontFamily: "inherit",
                  border: "1px solid var(--border)", borderRadius: 10, background: "#fff", color: "var(--ink)", outline: "none",
                }} className="ef-search" />
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 30 }}>
            {chips.map((c) => {
              const active = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(c.id)} className="ef-chip" style={{
                  display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
                  padding: "9px 15px", borderRadius: 999, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em",
                  background: active ? "var(--ink)" : "#fff", color: active ? "#fff" : "var(--gray)",
                  border: `1px solid ${active ? "var(--ink)" : "var(--border)"}`,
                  transition: "background .15s, color .15s, border-color .15s",
                }}>
                  <Icon name={c.icon} size={14} style={{ color: active ? "var(--amber)" : "var(--gray-2)" }} />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {filtered.length ? (
            <div className="ef-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map((s) => <SkillCard key={s.id} skill={s} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray)" }}>
              <Icon name="search-x" size={32} style={{ color: "var(--gray-3)" }} />
              <p style={{ marginTop: 12, fontWeight: 600, color: "var(--ink)" }}>No skills match “{q}”.</p>
              <p style={{ fontSize: 14 }}>Try a different term or clear the filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories overview — browse by job */}
      <section id="categories" style={{ background: "#fff", padding: "80px 0 84px", borderTop: "1px solid var(--border)" }}>
        <div className="wrap">
          <div style={{ maxWidth: 640, marginBottom: 36 }}>
            <Eyebrow>Browse by category</Eyebrow>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 14, color: "var(--ink)" }}>
              Pick a job to be done
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--gray)", marginTop: 12 }}>
              {categories.length} focused categor{categories.length === 1 ? "y" : "ies"}, {skills.length} battle-tested skill{skills.length === 1 ? "" : "s"}. Tap one to filter the library above.
            </p>
          </div>
          <div className="ef-catgrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
            {categories.map((c) => (
              <CategoryTile key={c.id} cat={c} active={cat === c.id}
                skills={skills.filter((s) => s.cat === c.id)} onPick={pick} />
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
