import React, { useState } from "react";
import { Icon, KpiCard, Progress, HealthPill } from "../components/primitives.jsx";
import { OnboardingTour } from "../components/OnboardingTour.jsx";

// localStorage probe — duplicated here to keep OnboardingTour.jsx
// component-only (Vite fast refresh complains about non-component
// exports from component files). Cheap one-liner.
function hasSeenTour() {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem("velocity:tour-dismissed") === "1"; } catch { return false; }
}
import {
  Company,
  Objectives as SeedObjectives,
  Projects as SeedProjects,
  Activity as SeedActivity,
  Departments as SeedDepartments,
  StrategyQuestion as SeedStrategyQuestion,
  Agents as SeedAgents
} from "../data/seed.js";
import { useApi } from "../lib/api.js";

function activityRoute(a) {
  switch (a.type) {
    case "project":   return { page: "okr" };
    case "risk":      return { page: "okr" };
    case "strategy":  return { page: "strategy" };
    case "assistant": return { page: "assistants" };
    case "knowledge": return { page: "knowledge" };
    case "decision":  return { page: "okr" };
    case "routing":   return { page: "assistants" };
    case "view":      return { page: "okr" };
    default:          return null;
  }
}

// Map an audit event row to the activity-feed shape so the homepage
// card can render real edits (POST /objectives, knowledge approve,
// rule toggle, etc.) alongside or instead of the seeded sample feed.
function auditToActivity(e) {
  const verbByAction = (action) => {
    if (!action) return "做了一次操作";
    // Strip noun suffix to leave the verb: "新增项目" → "新增了"
    if (action.startsWith("新增")) return "新增了";
    if (action.startsWith("更新")) return "更新了";
    if (action.startsWith("删除")) return "删除了";
    if (action.startsWith("启用")) return "启用了";
    if (action.startsWith("停用")) return "停用了";
    if (action.includes("入库")) return "入库了";
    return action;
  };
  const nounByCategory = {
    project: "项目", decision: "决策", knowledge: "知识源",
    routing: "路由规则"
  };
  const noun = nounByCategory[e.category] || e.category || "";
  return {
    id: `audit-${e.id}`,
    who: e.actor || "系统",
    what: `${verbByAction(e.action)}${noun}`,
    target: e.target || "—",
    when: e.at || "刚刚",
    type: e.category,
    _link: e.link  // direct deep-link if the audit row carries one
  };
}

export function HomePage({ setRoute }) {
  const [tourOpen, setTourOpen] = useState(false);
  // All read-only — Home is a dashboard. Each useApi falls back to the
  // bundled seed when the endpoint isn't reachable.
  const Objectives    = useApi("/api/v1/objectives").data        ?? SeedObjectives;
  const Projects      = useApi("/api/v1/projects").data          ?? SeedProjects;
  const SeedActivityRows = useApi("/api/v1/activity").data       ?? SeedActivity;
  // Mirror the most recent audit events into the activity feed so
  // operational edits (CRUD writes, ingest approvals, rule toggles)
  // surface alongside the seeded sample. Order: live audit first
  // (newest), then seed activity backfill, capped to 8 rows.
  const auditRows     = useApi("/api/v1/audit-log?limit=8").data || [];
  const Activity = (() => {
    const live = auditRows.slice(0, 6).map(auditToActivity);
    const merged = live.concat(SeedActivityRows);
    return merged.slice(0, 8);
  })();
  const Departments   = useApi("/api/v1/departments").data       ?? SeedDepartments;
  const Agents        = useApi("/api/v1/agents").data            ?? SeedAgents;
  // The "strategy debate teaser" wants a single in-debate question. Pick
  // the first in-debate row from the registry, falling back to the seeded
  // singular if nothing matches.
  const sqList        = useApi("/api/v1/strategy-questions").data;
  const StrategyQuestion = (sqList && (sqList.find(q => q.status === "in-debate") || sqList[0])) || SeedStrategyQuestion;
  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">{Company.fiscalYear} · 企业认知总览</div>
            <h1 className="page-head__title">早上好，志远</h1>
            <p className="page-head__subtitle">
              本周公司有 <strong style={{ color: "var(--fg1)" }}>3 个</strong> 战略议题在研讨中,
              <strong style={{ color: "var(--fg1)" }}>27 个</strong> 关键项目在执行,
              其中 <strong style={{ color: "var(--danger-text)" }}>4 个</strong> 出现风险信号。
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => setTourOpen(true)}>
              <Icon.PlayCircle size={14} /> {hasSeenTour() ? "再看导览" : "🎬 5 分钟产品导览"}
            </button>
            <button className="btn btn--ghost btn--sm"><Icon.Calendar size={14} /> 本季度</button>
            <button className="btn btn--primary btn--sm" onClick={() => setRoute({ page: "strategy" })}>
              <Icon.Plus size={14} /> 提出战略问题
            </button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        <KpiCard label="战略对齐率" value="74%" delta="+6.2pt" status="up" spark={[40, 48, 52, 50, 58, 64, 68, 74]} color="var(--vel-indigo)" />
        <KpiCard label="知识复用率" value="44%" delta="+3.1pt" status="up" spark={[28, 32, 30, 36, 38, 40, 42, 44]} color="#10b981" />
        <KpiCard label="项目健康度" value="81%" delta="-2.4pt" status="down" spark={[88, 90, 86, 84, 85, 83, 82, 81]} color="#f59e0b" />
        <KpiCard label="助手日活员工" value="1,128" delta="+182" status="up" spark={[640, 720, 810, 870, 920, 990, 1040, 1128]} color="#7c3aed" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* OKR snapshot */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Target size={14} style={{ color: "var(--vel-indigo)" }} />
                公司级 OKR · {Company.fiscalYear}
              </div>
              <button className="btn btn--text btn--sm" onClick={() => setRoute({ page: "okr" })}>
                查看全部 <Icon.Chevron size={12} />
              </button>
            </div>
            <div style={{ padding: "4px 0" }}>
              {Objectives.map((o, i) => (
                <div key={o.id} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                  alignItems: "center", gap: 14,
                  padding: "12px 18px",
                  borderTop: i ? "1px solid var(--border-soft)" : "none"
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "var(--vel-indigo-50)", color: "var(--vel-indigo-700)",
                    display: "grid", placeItems: "center",
                    fontWeight: 800, fontSize: 13, fontFamily: "var(--font-mono)"
                  }}>{o.code}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--fg3)" }}>{o.owner}</span>
                      <span style={{ width: 3, height: 3, borderRadius: 99, background: "var(--fg4)" }} />
                      <span style={{ fontSize: 11, color: "var(--fg3)" }}>{o.krs.length} KR · {o.linkedProjects.length} 项目</span>
                    </div>
                  </div>
                  <div style={{ width: 140 }}>
                    <Progress value={o.progress} status={o.status === "on-track" ? "info" : "warn"} />
                  </div>
                  <div style={{ width: 48, textAlign: "right" }} className="num" title={o.progress + "%"}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{o.progress}</span>
                    <span style={{ fontSize: 11, color: "var(--fg3)", marginLeft: 1 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key projects */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Layers size={14} style={{ color: "#10b981" }} />
                关键项目健康度
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span className="pill pill--ok">正常 {Projects.filter(p => p.health === 'ok').length}</span>
                <span className="pill pill--warn">关注 {Projects.filter(p => p.health === 'warn').length}</span>
                <span className="pill pill--danger">风险 {Projects.filter(p => p.health === 'danger').length}</span>
              </div>
            </div>
            <div>
              {Projects.slice(0, 5).map((p, i) => (
                <div key={p.id} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                  gap: 12, alignItems: "center",
                  padding: "11px 18px",
                  borderTop: i ? "1px solid var(--border-soft)" : "none"
                }}>
                  <div className={`dot dot--${p.health}`} style={{ position: "relative" }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>
                      {p.dept} · {p.owner} · 里程碑 <strong style={{ color: "var(--fg2)", fontWeight: 600 }}>{p.milestone}</strong> · {p.due}
                    </div>
                  </div>
                  <span className="pill pill--indigo num">{p.okr}</span>
                  <div style={{ width: 130, display: "flex", alignItems: "center", gap: 8 }}>
                    <Progress value={p.progress} status={p.health} />
                    <span className="num" style={{ fontSize: 12, color: "var(--fg2)", width: 28, textAlign: "right" }}>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy debate teaser */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)",
            color: "#fff",
            border: "none"
          }}>
            <div style={{ padding: 22, display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(255,255,255,0.1)",
                display: "grid", placeItems: "center",
                border: "1px solid rgba(255,255,255,0.15)"
              }}>
                <Icon.Compass size={26} style={{ color: "#c4b5fd" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>战略画布 · 第 3 轮研讨进行中</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{StrategyQuestion.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", marginRight: 6 }}>
                    {StrategyQuestion.agents.slice(0, 5).map((aid, i) => {
                      const ag = Agents.find(a => a.id === aid);
                      return <div key={aid} style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: ag.color, color: "#fff",
                        fontSize: 10, fontWeight: 700,
                        display: "grid", placeItems: "center",
                        marginLeft: i ? -6 : 0,
                        border: "2px solid #312E81"
                      }}>{ag.name[0]}</div>;
                    })}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>7 个 Agent · 3 个赞成 · 1 个反对 · 3 个保留</span>
                </div>
              </div>
              <button className="btn btn--lg" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => setRoute({ page: "strategy" })}>
                进入研讨 <Icon.ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Activity */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Activity size={14} style={{ color: "var(--vel-indigo)" }} />
                动态
              </div>
              <span className="pill pill--ghost">实时</span>
            </div>
            <div style={{ padding: "6px 0" }}>
              {Activity.map((a, i) => {
                // Audit rows already carry a precise deep-link in `_link`
                // ({page, projectId, ruleId, …}); fall back to the
                // category-based router for seeded entries.
                const route = a._link || activityRoute(a);
                return (
                  <div key={a.id} onClick={() => route && setRoute(route)}
                    style={{
                      display: "flex", gap: 10,
                      padding: "10px 18px",
                      borderTop: i ? "1px solid var(--border-soft)" : "none",
                      cursor: route ? "pointer" : "default",
                      transition: "background 0.12s"
                    }}
                    onMouseEnter={e => { if (route) e.currentTarget.style.background = "var(--slate-50)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: a.type === "risk" ? "var(--danger)" : a.type === "strategy" ? "var(--vel-indigo)" : a.type === "knowledge" ? "var(--success)" : "var(--fg4)",
                      marginTop: 6, flexShrink: 0
                    }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--fg2)" }}>
                        <strong style={{ color: "var(--fg1)", fontWeight: 600 }}>{a.who}</strong> {a.what} <span style={{ color: "var(--fg1)", fontWeight: 500 }}>{a.target}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 2 }}>{a.when}</div>
                    </div>
                    {route && <Icon.Chevron size={12} style={{ color: "var(--fg4)", marginTop: 6 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department status */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Layers size={14} style={{ color: "#7c3aed" }} />
                部门工作空间
              </div>
              <button className="btn btn--text btn--sm" onClick={() => setRoute({ page: "departments" })}>
                全部 <Icon.Chevron size={12} />
              </button>
            </div>
            <div style={{ padding: "4px 0" }}>
              {Departments.filter(d => !d.parentId).slice(0, 5).map((d, i) => (
                <div key={d.id} onClick={() => setRoute({ page: "department", deptId: d.id })}
                  style={{
                    display: "flex", gap: 11, alignItems: "center",
                    padding: "10px 18px", cursor: "pointer",
                    borderTop: i ? "1px solid var(--border-soft)" : "none"
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: d.color + "18", color: d.color,
                    display: "grid", placeItems: "center", flexShrink: 0
                  }}>
                    {React.createElement(Icon[d.icon], { size: 15 })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg1)" }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg3)" }}>{d.knowledge ? `${d.knowledge} 条知识 · ${d.skills} 技能` : "未启动"}</div>
                  </div>
                  <HealthPill status={d.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {tourOpen && <OnboardingTour onClose={() => setTourOpen(false)} setRoute={setRoute} />}
    </div>
  );
}
