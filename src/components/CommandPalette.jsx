import React, { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "./primitives.jsx";
import {
  Objectives, Projects, DecisionsRich, KnowledgeSources,
  SkillPacks, Workflows, Departments, StrategyQuestions
} from "../data/seed.js";

// Global Cmd/Ctrl-K command palette. Indexes every searchable entity in
// seed data and routes the user via setRoute when an item is picked.
//
// Layout follows the existing modal language but renders a centered search
// panel pinned to the top quarter of the viewport (Linear / Raycast style).

const CATEGORIES = [
  { key: "objective",  icon: "Target",      color: "var(--vel-indigo)",  label: "Objective" },
  { key: "project",    icon: "Layers",      color: "#10b981",            label: "项目" },
  { key: "decision",   icon: "Quote",       color: "#7c3aed",            label: "决策" },
  { key: "source",     icon: "Database",    color: "#0EA5E9",            label: "知识源" },
  { key: "skill",      icon: "Sparkles",    color: "#7c3aed",            label: "Skill Pack" },
  { key: "workflow",   icon: "Workflow",    color: "#4F46E5",            label: "工作流" },
  { key: "department", icon: "Building",    color: "#475569",            label: "部门" },
  { key: "question",   icon: "Compass",     color: "#312E81",            label: "战略问题" },
  { key: "page",       icon: "ArrowRight",  color: "#94a3b8",            label: "导航" }
];

function buildIndex() {
  const items = [];

  for (const o of Objectives) {
    items.push({
      type: "objective",
      id: o.id,
      title: `${o.code} · ${o.title}`,
      sub: `${o.owner} · ${o.krs.length} KR · ${o.linkedProjects.length} 项目 · ${o.progress}%`,
      route: { page: "okr" }
    });
  }
  for (const p of Projects) {
    items.push({
      type: "project",
      id: p.id,
      title: p.name,
      sub: `${p.dept} · 关联 ${p.okr} · ${p.progress}% · ${p.due}`,
      route: { page: "okr" }
    });
  }
  for (const d of DecisionsRich) {
    items.push({
      type: "decision",
      id: d.id,
      title: d.title,
      sub: `${d.owner} · ${d.date}${d.linkedKR ? ` · ${d.linkedKR}` : ""}`,
      route: { page: "okr" }
    });
  }
  for (const s of KnowledgeSources) {
    items.push({
      type: "source",
      id: s.id,
      title: s.title,
      sub: `${s.scope} · ${s.type} · ${s.uses} 引用`,
      route: { page: "knowledge" }
    });
  }
  for (const s of SkillPacks) {
    items.push({
      type: "skill",
      id: s.id,
      title: s.name,
      sub: `${s.maintainer} · ${s.version} · ${s.uses} 次`,
      route: { page: "skills" }
    });
  }
  for (const w of Workflows) {
    items.push({
      type: "workflow",
      id: w.id,
      title: w.name,
      sub: `${w.owner} · ${w.steps.length} 步 · ${w.uses} 次`,
      route: { page: "workflows" }
    });
  }
  for (const d of Departments.filter(x => !x.parentId)) {
    items.push({
      type: "department",
      id: d.id,
      title: d.name,
      sub: `${d.lead} · ${d.people} 人 · ${d.skills} 技能`,
      route: { page: "department", deptId: d.id }
    });
  }
  for (const q of StrategyQuestions) {
    items.push({
      type: "question",
      id: q.id,
      title: q.title,
      sub: `${q.asker} · ${q.asked} · ${q.status}`,
      route: { page: "strategy" }
    });
  }
  for (const nav of [
    { id: "home",        title: "首页",            sub: "企业认知总览" },
    { id: "knowledge",   title: "公司知识中心",     sub: "Knowledge sources / domains / governance" },
    { id: "strategy",    title: "战略工作台",       sub: "Strategy questions / War Council" },
    { id: "okr",         title: "OKR 与关键项目",   sub: "Objectives / projects / decisions" },
    { id: "departments", title: "部门工作空间",     sub: "Department registry" },
    { id: "skills",      title: "技能中心",         sub: "Skill Pack registry" },
    { id: "workflows",   title: "工作流中心",       sub: "Workflow templates / runs" },
    { id: "assistants",  title: "助手中心",         sub: "Routing rules / assistants" },
    { id: "governance",  title: "权限与治理",       sub: "Permissions / connectors / audit log" },
    { id: "admin",       title: "管理后台",         sub: "Token usage / models / org / audit" }
  ]) {
    items.push({
      type: "page",
      id: nav.id,
      title: nav.title,
      sub: nav.sub,
      route: { page: nav.id }
    });
  }

  return items;
}

// Cheap fuzzy: substring match on title or sub, case-insensitive. Sort by
// (type rank, position of match in title). Plenty fast for ~120 items.
function rank(items, q) {
  const query = q.trim().toLowerCase();
  if (!query) return items.slice(0, 30);
  const out = [];
  for (const it of items) {
    const t = it.title.toLowerCase();
    const s = (it.sub || "").toLowerCase();
    const ti = t.indexOf(query);
    const si = s.indexOf(query);
    if (ti === -1 && si === -1) continue;
    const score = (ti === -1 ? 100 : ti) + (si === -1 ? 50 : si * 0.1);
    out.push({ ...it, _score: score });
  }
  return out.sort((a, b) => a._score - b._score).slice(0, 50);
}

export function CommandPalette({ setRoute }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const index = useMemo(() => buildIndex(), []);
  const results = useMemo(() => rank(index, query), [index, query]);

  // Clamp active in the render path instead of storing a sanitized value
  // in state — avoids the cascade-render lint warning.
  const safeActive = results.length === 0 ? 0 : Math.min(Math.max(0, active), results.length - 1);

  // Global Cmd/Ctrl-K listener + a custom-event opener so other UI bits
  // (topbar search) can trigger the palette without owning its state.
  useEffect(() => {
    function onKey(e) {
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (isCmdK) {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setActive(0);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    function onOpen() { setOpen(true); setQuery(""); setActive(0); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("velocity:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("velocity:open-palette", onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  if (!open) return null;

  function pick(item) {
    if (item.route && setRoute) setRoute(item.route);
    setOpen(false);
  }

  function onInputKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(results.length - 1, safeActive + 1);
      setActive(next);
      scrollActive(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(0, safeActive - 1);
      setActive(next);
      scrollActive(next);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[safeActive];
      if (item) pick(item);
    }
  }

  function scrollActive(i) {
    setTimeout(() => {
      const el = listRef.current?.querySelector(`[data-cmd-row="${i}"]`);
      if (el?.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }, 0);
  }

  return (
    <div
      className="modal-overlay"
      onClick={() => setOpen(false)}
      style={{ alignItems: "flex-start", paddingTop: "12vh" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(640px, 100%)",
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "70vh"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-soft)" }}>
          <Icon.Search size={16} style={{ color: "var(--fg3)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onInputKey}
            placeholder="搜索 OKR / 项目 / 决策 / 知识 / 技能 / 工作流 / 部门 / 战略问题…"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 15, color: "var(--fg1)",
              fontFamily: "inherit"
            }}
          />
          <kbd style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            padding: "2px 6px", background: "var(--slate-100)", borderRadius: 4, color: "var(--fg3)"
          }}>Esc</kbd>
        </div>

        <div ref={listRef} className="scroll" style={{ flex: 1, overflow: "auto", padding: 6 }}>
          {results.length === 0 && (
            <div style={{ padding: 28, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
              没有匹配的条目 — 尝试换个关键词
            </div>
          )}
          {results.map((r, i) => {
            const cat = CATEGORIES.find(c => c.key === r.type) || CATEGORIES[0];
            const IconC = Icon[cat.icon] || Icon.ArrowRight;
            const isActive = i === safeActive;
            return (
              <div
                key={`${r.type}-${r.id}`}
                data-cmd-row={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(r)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "30px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isActive ? "var(--vel-indigo-50)" : "transparent",
                  border: isActive ? "1px solid var(--vel-indigo-100)" : "1px solid transparent"
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: cat.color + "18", color: cat.color,
                  display: "grid", placeItems: "center"
                }}>
                  <IconC size={14} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--fg3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.sub}
                  </div>
                </div>
                <span className="pill pill--neutral" style={{ flexShrink: 0 }}>{cat.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 14px", borderTop: "1px solid var(--border-soft)",
          background: "var(--slate-50)", fontSize: 11, color: "var(--fg3)"
        }}>
          <div>{results.length} 个结果</div>
          <div style={{ display: "flex", gap: 14 }}>
            <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> 选择</span>
            <span><Kbd>↵</Kbd> 打开</span>
            <span><Kbd>Esc</Kbd> 关闭</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd style={{
      fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
      padding: "1px 5px", background: "#fff", border: "1px solid var(--border)",
      borderRadius: 3, color: "var(--fg2)"
    }}>{children}</kbd>
  );
}
