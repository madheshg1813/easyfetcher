"use client";

import { useEffect, useState } from "react";
import { SOURCES, type Skill } from "@/lib/skills";
import Icon from "./Icon";
import { SourceChips, Button } from "./primitives";
import { SkillMedia } from "./Thumbnail";

export default function InstallModal({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!skill) { setShown(false); return; }
    setCopied(false);
    setShown(false);
    const t = setTimeout(() => setShown(true), 16);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [skill, onClose]);

  if (!skill) return null;
  const cmd = `/install easyfetcher/${skill.id}`;
  const copy = () => {
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const steps = [
    { i: "plug", t: "Connect your data", d: `Link ${skill.sources.map((s) => SOURCES[s].label).join(" & ")} in EasyFetcher.` },
    { i: "download", t: "Install the skill", d: "Add it to Claude with one click or the command below." },
    { i: "message-square", t: "Just ask", d: `Say “run ${skill.name}” and Claude does the rest.` },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,.55)",
      backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20,
      opacity: shown ? 1 : 0, transition: "opacity .18s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20, maxWidth: 520, width: "100%", maxHeight: "90vh", overflow: "auto",
        boxShadow: "var(--shadow-lg)",
        opacity: shown ? 1 : 0, transform: shown ? "scale(1)" : "scale(.96)",
        transition: "opacity .22s cubic-bezier(.2,0,0,1), transform .22s cubic-bezier(.2,0,0,1)",
      }}>
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ width: 46, height: 46, flex: "none", borderRadius: 12, display: "grid", placeItems: "center", background: "var(--ink)" }}>
            <Icon name={skill.icon} size={23} style={{ color: "var(--amber)" }} />
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", marginTop: 6 }}>{skill.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 9, width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", flex: "none" }}>
            <Icon name="x" size={17} style={{ color: "var(--gray)" }} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <SkillMedia skill={skill} rounded />
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--gray)", margin: 0 }}>{skill.desc}</p>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--gray-2)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Requires</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <SourceChips sources={skill.sources} />
            </div>
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, display: "grid", placeItems: "center", background: "var(--amber-tint)", border: "1px solid color-mix(in oklch, var(--amber) 30%, white)", fontWeight: 800, fontSize: 13, color: "var(--amber-strong)" }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>{s.t}</div>
                  <div style={{ fontSize: 13.5, color: "var(--gray)", lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--ink)", borderRadius: 11, padding: "12px 14px" }}>
              <Icon name="terminal" size={16} style={{ color: "var(--amber)" }} />
              <code style={{ flex: 1, color: "#fff", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13.5 }}>{cmd}</code>
              <button onClick={copy} style={{ background: copied ? "var(--amber)" : "rgba(255,255,255,.12)", color: copied ? "var(--ink)" : "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name={copied ? "check" : "copy"} size={13} /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 11, marginTop: 22 }}>
            <Button style={{ flex: 1 }} leading={<Icon name="download" size={16} />}>Download Skill</Button>
            <Button variant="outline" style={{ flex: 1 }} leading={<Icon name="external-link" size={16} />}>Open in Claude</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
