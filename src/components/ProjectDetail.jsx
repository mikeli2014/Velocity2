import React from "react";
import { Icon, Modal, Progress, HealthPill } from "./primitives.jsx";
import { Objectives, Departments, KnowledgeSources, DecisionsRich } from "../data/seed.js";

// Project detail modal — shows milestones, risks, contributors, linked OKRs,
// linked decisions and linked knowledge sources. Read-only; CRUD lives in
// ProjectEditor. Used from OkrPage and DepartmentPage > 项目 tab.
export function ProjectDetail({ project, onClose, onEdit }) {
  if (!project) return null;
  const obj = Objectives.find(o => o.code === project.okr);
  const dept = Departments.find(d => d.id === project.deptId);
  const decisions = (project.linkedDecisions || []).map(id => DecisionsRich.find(d => d.id === id)).filter(Boolean);
  const sources = (project.linkedSources || []).map(id => KnowledgeSources.find(s => s.id === id)).filter(Boolean);
  const milestones = project.milestones || [];
  const risks = project.risksDetail || [];
  const contributors = project.contributors || [];

  const milestoneStatusMap = {
    achieved: { cls: "pill--ok", txt: "已完成" },
    "in-progress": { cls: "pill--info", txt: "进行中" },
    todo: { cls: "pill--neutral", txt: "未开始" }
  };
  const riskLevelMap = {
    danger: { cls: "pill--danger", icon: "AlertTriangle" },
    warn: { cls: "pill--warn", icon: "AlertTriangle" },
    info: { cls: "pill--info", icon: "Activity" }
  };

  return (
    <Modal
      title={project.name || "项目详情"}
      sub={`${dept?.name || project.dept || "—"} · ${project.owner || "未指派"}`}
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>关闭</button>
        {onEdit && <button className="btn btn--primary btn--sm" onClick={() => onEdit(project)}><Icon.Edit size={13} /> 编辑项目</button>}
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Stat label="健康度" value={<HealthPill status={project.health} />} />
        <Stat label="进度" value={
          <div className="row" style={{ gap: 8 }}>
            <div style={{ flex: 1 }}><Progress value={project.progress} status={project.health} /></div>
            <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{project.progress}%</span>
          </div>
        } />
        <Stat label="关联 OKR" value={
          obj ? <span className="pill pill--indigo num">{obj.code} · {obj.title.split("—")[0].trim()}</span> : "—"
        } />
      </div>

      {project.description && (
        <div style={{ padding: "12px 14px", background: "var(--slate-50)", borderRadius: 8, fontSize: 13, color: "var(--fg2)", lineHeight: 1.6 }}>
          {project.description}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Stat label="启动日期" value={<span className="num" style={{ fontSize: 13 }}>{project.started || "—"}</span>} />
        <Stat label="当前里程碑" value={<span style={{ fontSize: 13, fontWeight: 600 }}>{project.milestone || "—"}</span>} />
        <Stat label="截止日期" value={<span className="num" style={{ fontSize: 13 }}>{project.due}</span>} />
      </div>

      {contributors.length > 0 && (
        <div className="field">
          <label className="field__label">参与人 ({contributors.length})</label>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {contributors.map(c => (
              <span key={c} className="pill pill--neutral"><Icon.User size={11} /> {c}</span>
            ))}
          </div>
        </div>
      )}

      <Section icon={<Icon.Calendar size={14} style={{ color: "var(--vel-indigo)" }} />} title={`里程碑 (${milestones.length})`}>
        {milestones.length === 0 && <Empty text="尚未设置里程碑" />}
        {milestones.map((m, i) => {
          const ms = milestoneStatusMap[m.status] || milestoneStatusMap.todo;
          return (
            <div key={m.id} style={{
              display: "grid", gridTemplateColumns: "20px 1fr 110px 100px",
              gap: 10, alignItems: "center",
              padding: "10px 12px",
              background: m.status === "in-progress" ? "var(--vel-indigo-50)" : "var(--slate-50)",
              border: m.status === "in-progress" ? "1px solid var(--vel-indigo-100)" : "1px solid var(--border-soft)",
              borderRadius: 8,
              marginBottom: i < milestones.length - 1 ? 6 : 0
            }}>
              <Icon.Hash size={13} style={{ color: m.status === "achieved" ? "var(--success)" : "var(--fg4)" }} />
              <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: m.status === "in-progress" ? 700 : 500 }}>{m.name}</div>
              <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{m.date}</span>
              <span className={`pill ${ms.cls}`} style={{ justifySelf: "end" }}>{ms.txt}</span>
            </div>
          );
        })}
      </Section>

      <Section
        icon={<Icon.AlertTriangle size={14} style={{ color: risks.length ? "var(--warning)" : "var(--fg4)" }} />}
        title={`风险登记册 (${risks.length})`}
      >
        {risks.length === 0 && <Empty text="无登记风险" />}
        {risks.map((r, i) => {
          const lvl = riskLevelMap[r.level] || riskLevelMap.info;
          const RIcon = Icon[lvl.icon];
          return (
            <div key={r.id} style={{
              display: "flex", gap: 10,
              padding: "10px 12px",
              border: "1px solid var(--border-soft)",
              borderLeft: `3px solid ${r.level === "danger" ? "var(--danger)" : r.level === "warn" ? "var(--warning)" : "var(--info)"}`,
              borderRadius: 8,
              marginBottom: i < risks.length - 1 ? 6 : 0
            }}>
              <RIcon size={14} style={{ color: r.level === "danger" ? "var(--danger)" : "var(--warning)", marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13, color: "var(--fg1)", lineHeight: 1.5 }}>
                <div>{r.text}</div>
                {r.owner && <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 4 }}>负责人 · {r.owner}</div>}
              </div>
              <span className={`pill ${lvl.cls}`}>{r.level === "danger" ? "高" : r.level === "warn" ? "中" : "信息"}</span>
            </div>
          );
        })}
      </Section>

      {decisions.length > 0 && (
        <Section icon={<Icon.Quote size={14} style={{ color: "var(--vel-violet)" }} />} title={`关联决策 (${decisions.length})`}>
          {decisions.map((d, i) => (
            <div key={d.id} style={{
              padding: "10px 12px",
              background: "#fff",
              border: "1px solid var(--border-soft)",
              borderRadius: 8,
              marginBottom: i < decisions.length - 1 ? 6 : 0
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{d.title}</div>
              <div className="row" style={{ gap: 12, marginTop: 4, fontSize: 11, color: "var(--fg3)" }}>
                <span><Icon.User size={10} /> {d.owner}</span>
                <span><Icon.Calendar size={10} /> {d.date}</span>
                <span><Icon.FileText size={10} /> {(d.evidenceSources || []).length} 条证据</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {sources.length > 0 && (
        <Section icon={<Icon.Database size={14} style={{ color: "var(--success)" }} />} title={`关联知识 (${sources.length})`}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {sources.map(s => (
              <span key={s.id} className="pill pill--indigo">
                <Icon.FileText size={11} /> {s.title}
              </span>
            ))}
          </div>
        </Section>
      )}
    </Modal>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: "10px 12px", background: "var(--slate-50)", borderRadius: 8 }}>
      <div style={{ fontSize: 10, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
      <div className="row" style={{ gap: 8, marginBottom: 10 }}>
        {icon}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--fg4)", background: "var(--slate-50)", borderRadius: 8 }}>{text}</div>
  );
}
