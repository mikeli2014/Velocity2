import React, { useState, useRef } from "react";
import { Icon, KpiCard, Progress, HealthPill, ConfirmModal, Modal, makeId } from "../components/primitives.jsx";
import { ProjectEditor } from "./OkrPage.jsx";
import { ProjectDetail } from "../components/ProjectDetail.jsx";
import { RunDialog } from "../components/RunDialog.jsx";
import { Departments as SeedDepartments, KnowledgeDomains, SkillPacks, KnowledgeSources, Company, Projects, Objectives, Workflows, DeptActivity } from "../data/seed.js";
import { useApi, apiPost, apiStream, ApiError } from "../lib/api.js";

export function DepartmentPage({ deptId, setRoute }) {
  // Department record is derived from `deptId`; user edits in the
  // configuration modal layer on top via per-deptId override map. This
  // way switching departments doesn't need an effect to reset state.
  // Department list comes from /api/v1/departments with seed fallback.
  const { data: apiDepartments } = useApi("/api/v1/departments");
  const Departments = apiDepartments ?? SeedDepartments;
  const baseDept = Departments.find(d => d.id === deptId) || Departments[0];
  const [overridesByDept, setOverridesByDept] = useState({});
  const dept = { ...baseDept, ...(overridesByDept[deptId] || {}) };
  function setDept(next) { setOverridesByDept(o => ({ ...o, [deptId]: next })); }

  const [tab, setTab] = useState("overview");
  const [configuring, setConfiguring] = useState(false);
  const isID = dept.id === "industrial-design";

  const tabs = isID ? [
    { id: "overview", label: "概览" },
    { id: "knowledge", label: "知识中心", count: dept.knowledge },
    { id: "cmf", label: "CMF Intelligence" },
    { id: "market", label: "Market Insights" },
    { id: "skills", label: "技能", count: dept.skills },
    { id: "workflows", label: "工作流", count: dept.workflows },
    { id: "projects", label: "项目", count: dept.projects },
    { id: "assistant", label: "🦞 小龙虾助手" }
  ] : [
    { id: "overview", label: "概览" },
    { id: "knowledge", label: "知识库", count: dept.knowledge },
    { id: "skills", label: "技能", count: dept.skills },
    { id: "workflows", label: "工作流", count: dept.workflows },
    { id: "assistant", label: `${dept.assistant} 助手` }
  ];

  return (
    <div className="content fade-in">
      <div style={{
        margin: "-28px -32px 24px",
        padding: "32px 32px 0",
        background: `linear-gradient(135deg, ${dept.color}10, transparent 60%)`,
        borderBottom: "1px solid var(--border-soft)"
      }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 18, marginBottom: 22 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: dept.color, color: "#fff", display: "grid", placeItems: "center", boxShadow: `0 8px 24px ${dept.color}40` }}>
            {React.createElement(Icon[dept.icon], { size: 26 })}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: dept.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{dept.en} Workspace</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--fg1)" }}>{dept.name}</div>
            <div className="row" style={{ gap: 12, marginTop: 6, fontSize: 13, color: "var(--fg3)" }}>
              <span><Icon.User size={12} style={{ verticalAlign: "-2px" }} /> {dept.lead}</span>
              <span>·</span>
              <span><Icon.Users size={12} style={{ verticalAlign: "-2px" }} /> {dept.people} 人</span>
              <span>·</span>
              <span><Icon.MessageCircle size={12} style={{ verticalAlign: "-2px" }} /> 部门助手 <strong style={{ color: dept.color }}>{dept.assistant}</strong></span>
              <HealthPill status={dept.status} />
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => setConfiguring(true)}><Icon.Settings size={13} /> 配置</button>
            <button
              className="btn btn--primary btn--sm"
              style={{ background: dept.color }}
              onClick={() => setTab("assistant")}
              disabled={!dept.assistant || dept.assistant === "—"}
            >
              <Icon.MessageCircle size={13} /> 打开{dept.assistant}
            </button>
          </div>
        </div>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
          {tabs.map(t => (
            <div key={t.id} className={`tab ${tab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
            </div>
          ))}
        </div>
      </div>

      {tab === "overview" && <DeptOverview dept={dept} />}
      {tab === "knowledge" && <DeptKnowledge dept={dept} setRoute={setRoute} />}
      {tab === "cmf" && <CMFIntelligence dept={dept} />}
      {tab === "market" && <MarketInsights dept={dept} />}
      {tab === "skills" && <DeptSkills dept={dept} setRoute={setRoute} />}
      {tab === "workflows" && <DeptWorkflows dept={dept} />}
      {tab === "projects" && <DeptProjects dept={dept} />}
      {tab === "assistant" && <AssistantChat dept={dept} />}

      {configuring && (
        <DepartmentConfigModal
          dept={dept}
          onClose={() => setConfiguring(false)}
          onSave={(next) => { setDept(next); setConfiguring(false); }}
        />
      )}
    </div>
  );
}

const ROLE_OPTIONS = [
  { v: "ceo",        label: "CEO / 总经理" },
  { v: "vp",         label: "VP / 部门负责人" },
  { v: "lead",       label: "团队负责人" },
  { v: "staff",      label: "一线员工" },
  { v: "consultant", label: "外部顾问" }
];
const CHANNEL_OPTIONS = [
  { v: "web",   label: "Velocity Web", icon: "Globe" },
  { v: "wecom", label: "企业微信",      icon: "MessageCircle" },
  { v: "api",   label: "API",          icon: "Code" }
];

function DepartmentConfigModal({ dept, onClose, onSave }) {
  const [form, setForm] = useState({
    ...dept,
    knowledgeDomainIds: dept.knowledgeDomainIds || KnowledgeDomains.map(d => d.id),
    skillPackIds: dept.skillPackIds || SkillPacks.filter(s => s.dept === dept.id).map(s => s.id),
    workflowIds: dept.workflowIds || Workflows.filter(w => w.deptId === dept.id).map(w => w.id),
    assistantTone: dept.assistantTone || "专业 · 简洁 · 引用来源",
    channels: dept.channels || ["web", "wecom"],
    allowedRoles: dept.allowedRoles || ["vp", "lead", "staff"],
    description: dept.description || `${dept.name} 工作空间 · 由 ${dept.lead || "—"} 管理`
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function toggle(key, id) {
    const cur = form[key] || [];
    set(key, cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  }

  return (
    <Modal
      title={`配置 · ${dept.name}`}
      sub="部门工作空间的元数据、知识域 / 技能 / 工作流绑定、助手与权限。改动只更新当前会话状态。"
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" onClick={() => onSave(form)} style={{ background: dept.color }}>
          <Icon.Save size={13} /> 保存配置
        </button>
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">部门名称</label>
          <input className="input" value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">英文名 (Slug)</label>
          <input className="input" value={form.en || ""} onChange={e => set("en", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">部门负责人</label>
          <input className="input" value={form.lead || ""} onChange={e => set("lead", e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label className="field__label">部门描述</label>
        <textarea className="textarea" value={form.description} onChange={e => set("description", e.target.value)} placeholder="一句话说明部门职责与服务对象。" />
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <Icon.MessageCircle size={14} style={{ color: dept.color }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>部门助手</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label className="field__label">助手名称</label>
            <input className="input" value={form.assistant || ""} onChange={e => set("assistant", e.target.value)} placeholder="例如:小龙虾" />
          </div>
          <div className="field">
            <label className="field__label">默认语气</label>
            <input className="input" value={form.assistantTone} onChange={e => set("assistantTone", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field__label">入口渠道</label>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {CHANNEL_OPTIONS.map(c => {
              const sel = form.channels.includes(c.v);
              const IconC = Icon[c.icon] || Icon.Globe;
              return (
                <button key={c.v} className={`btn btn--sm ${sel ? "btn--primary" : "btn--ghost"}`} onClick={() => toggle("channels", c.v)}>
                  <IconC size={12} /> {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ConfigList
        icon={<Icon.Database size={14} style={{ color: "var(--success)" }} />}
        label={`知识域 (${form.knowledgeDomainIds.length} / ${KnowledgeDomains.length})`}
        items={KnowledgeDomains}
        selected={form.knowledgeDomainIds}
        onToggle={id => toggle("knowledgeDomainIds", id)}
        renderRow={d => (
          <>
            <span style={{ fontSize: 13, color: "var(--fg1)", flex: 1 }}>{d.name}</span>
            <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{d.count} 条</span>
            <span className={`pill ${d.health === "ok" ? "pill--ok" : "pill--warn"}`}>{d.coverage}%</span>
          </>
        )}
      />

      <ConfigList
        icon={<Icon.Sparkles size={14} style={{ color: "var(--vel-violet)" }} />}
        label={`Skill Pack (${form.skillPackIds.length})`}
        items={SkillPacks}
        selected={form.skillPackIds}
        onToggle={id => toggle("skillPackIds", id)}
        renderRow={s => (
          <>
            <span style={{ fontSize: 13, color: "var(--fg1)", flex: 1 }}>{s.name}</span>
            <span className="pill pill--neutral">{s.scope === "platform" ? "平台" : s.scope === "company" ? "全公司" : s.scope === "cross-dept" ? "跨部门" : "部门私有"}</span>
            <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{s.version}</span>
          </>
        )}
      />

      <ConfigList
        icon={<Icon.Workflow size={14} style={{ color: "var(--vel-indigo)" }} />}
        label={`工作流模板 (${form.workflowIds.length})`}
        items={Workflows}
        selected={form.workflowIds}
        onToggle={id => toggle("workflowIds", id)}
        renderRow={w => (
          <>
            <span style={{ fontSize: 13, color: "var(--fg1)", flex: 1 }}>{w.name}</span>
            <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{w.steps.length} 步 · {w.avgTime}</span>
          </>
        )}
      />

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <Icon.Lock size={14} style={{ color: "var(--warning)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>访问角色 ({form.allowedRoles.length})</div>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {ROLE_OPTIONS.map(r => {
            const sel = form.allowedRoles.includes(r.v);
            return (
              <button key={r.v} className={`btn btn--sm ${sel ? "btn--primary" : "btn--ghost"}`} onClick={() => toggle("allowedRoles", r.v)}>{r.label}</button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 6 }}>未勾选的角色默认不能访问 {dept.name}。CEO 始终拥有读权限。</div>
      </div>
    </Modal>
  );
}

function ConfigList({ icon, label, items, selected, onToggle, renderRow }) {
  return (
    <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
      <div className="row" style={{ gap: 8, marginBottom: 10 }}>
        {icon}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflow: "auto", padding: 4 }}>
        {items.map(it => {
          const checked = selected.includes(it.id);
          return (
            <label key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 6, background: checked ? "var(--vel-indigo-50)" : "var(--slate-50)", cursor: "pointer" }}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(it.id)} />
              {renderRow(it)}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DeptOverview({ dept }) {
  const feed = DeptActivity[dept.id] || DeptActivity[dept.parentId] || { questions: [], inbox: [] };
  // Compute real numbers where the seed has them. Sparklines stay
  // synthetic — we don't have time-series telemetry for skill / project
  // health yet (P2-3 in 08_待办路线图.md).
  const deptSkills = SkillPacks.filter(s => s.dept === dept.id);
  const deptProjects = Projects.filter(p => p.deptId === dept.id);
  const totalSkillUses = deptSkills.reduce((acc, s) => acc + (s.uses || 0), 0);
  const projectHealthOk = deptProjects.filter(p => p.health === "ok").length;
  const projectHealthPct = deptProjects.length > 0
    ? Math.round((projectHealthOk / deptProjects.length) * 100)
    : 0;
  return (
    <div>
      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard
          label="部门知识条目"
          value={(dept.knowledge || 0).toLocaleString()}
          spark={[Math.max(0, dept.knowledge - 140), dept.knowledge - 100, dept.knowledge - 70, dept.knowledge - 40, dept.knowledge - 20, dept.knowledge - 10, dept.knowledge - 5, dept.knowledge]}
          color={dept.color}
        />
        <KpiCard
          label="本周助手对话"
          value="—"
          delta="待按部门聚合"
          color="#10b981"
        />
        <KpiCard
          label={`累计技能调用 · ${deptSkills.length} 个 Skill`}
          value={totalSkillUses.toLocaleString()}
          status="up"
          color="#7c3aed"
        />
        <KpiCard
          label={`项目健康率 · ${deptProjects.length} 个项目`}
          value={`${projectHealthPct}%`}
          delta={`${projectHealthOk} ok`}
          status={projectHealthPct >= 80 ? "up" : "down"}
          color="#f59e0b"
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20 }}>
        <div className="card">
          <div className="card__head">
            <div className="card__title"><Icon.Activity size={14} /> 高频问题 (本周)</div>
            <span className="pill pill--neutral">{feed.questions.length} 条</span>
          </div>
          <div>
            {feed.questions.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--fg4)", fontSize: 12 }}>{dept.name} 本周尚无高频问题</div>}
            {feed.questions.map((q, i) => (
              <div key={i} style={{ padding: "12px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>"{q.q}"</div>
                  <span className="pill pill--neutral">{q.uses}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--fg3)" }}>来源 {q.source}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card__head">
            <div className="card__title"><Icon.Inbox size={14} /> 待处理事项</div>
            <span className="pill pill--neutral">{feed.inbox.length} 项</span>
          </div>
          <div>
            {feed.inbox.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--fg4)", fontSize: 12 }}>无待处理事项</div>}
            {feed.inbox.map((t, i) => (
              <div key={i} style={{ padding: "12px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none", display: "flex", gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, marginTop: 7, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.5 }}>{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeptKnowledge({ dept, setRoute }) {
  // Real data: knowledge domains + sources from the API, with seed
  // fallback during the loading window.
  const { data: apiDomains } = useApi("/api/v1/knowledge-domains");
  const allDomains = apiDomains ?? KnowledgeDomains;
  // If the dept has explicitly chosen a subset (via 配置 modal), respect
  // it; otherwise show all company-level domains.
  const domains = (dept.knowledgeDomainIds && dept.knowledgeDomainIds.length > 0)
    ? allDomains.filter(d => dept.knowledgeDomainIds.includes(d.id))
    : allDomains;

  const { data: apiSources, refresh: refreshSources } = useApi("/api/v1/knowledge-sources");
  const allSources = apiSources ?? KnowledgeSources;
  // Filter sources to "this department's universe": scope contains the
  // dept name, OR scope === "公司" (visible to everyone). Sort recent
  // first if there's an `updated` field.
  const deptName = dept.name || "";
  const deptSources = allSources
    .filter(s => (s.scope || "").includes(deptName) || s.scope === "公司")
    .slice(0, 6);

  const [uploadOpen, setUploadOpen] = useState(false);

  function openDomain(domainId) {
    if (!setRoute) return;
    // Jump to the company knowledge center with a deep-link hash so a
    // future deep-link handler in KnowledgePage can scroll to / open
    // this domain. Use history API (lint-friendly).
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#domain:${domainId}`);
    }
    setRoute({ page: "knowledge" });
  }

  function openSourceById(sourceId) {
    if (!setRoute) return;
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#knowledge:${sourceId}`);
    }
    setRoute({ page: "knowledge" });
  }

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>
          知识域 <span style={{ color: "var(--fg3)", fontWeight: 400 }}>· {domains.length} 个 · {dept.knowledge?.toLocaleString() || 0} 条</span>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setUploadOpen(true)}>
          <Icon.Upload size={13} /> 上传到部门
        </button>
      </div>
      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        {domains.map(d => (
          <div
            key={d.id}
            className="card"
            style={{ padding: 16, cursor: "pointer", transition: "transform 0.12s" }}
            onClick={() => openDomain(d.id)}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
            title="点击查看公司知识中心中该域的全部知识源"
          >
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <Icon.Folder size={15} style={{ color: dept.color }} />
              <span className={`pill ${d.health === 'ok' ? 'pill--ok' : 'pill--warn'}`}>{d.coverage}%</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)", marginBottom: 4 }}>{d.name}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800, color: "var(--fg1)" }}>{d.count}</div>
            <div style={{ fontSize: 11, color: "var(--fg3)" }}>条目 · 更新 {d.lastUpdate || "—"}</div>
          </div>
        ))}
        {domains.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1", padding: 32, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
            该部门尚未绑定任何知识域 — 点击右上角「配置」选择
          </div>
        )}
      </div>

      {/* Recent sources visible to this dept (scope=部门 or 公司). Real
          data from /api/v1/knowledge-sources. */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card__head">
          <div className="card__title"><Icon.FileText size={14} /> 本部门可见的最近知识源</div>
          <span style={{ fontSize: 11, color: "var(--fg3)" }}>共 {deptSources.length} 条 · 来自 /api/v1/knowledge-sources</span>
        </div>
        {deptSources.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>暂无可见知识源</div>
        )}
        {deptSources.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center",
              padding: "10px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none",
              cursor: setRoute ? "pointer" : "default"
            }}
            onClick={setRoute ? () => openSourceById(s.id) : undefined}
          >
            <span className="pill pill--neutral">{s.type || "—"}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{s.scope || "—"} · {s.size || "—"} · 更新 {s.updated || "—"}</div>
            </div>
            <span className={`pill ${s.quality === 'verified' ? 'pill--ok' : s.quality === 'flagged' ? 'pill--danger' : 'pill--warn'}`}>{s.quality || "draft"}</span>
            <Icon.ArrowRight size={12} style={{ color: "var(--fg4)" }} />
          </div>
        ))}
      </div>

      {uploadOpen && (
        <DeptUploadModal
          dept={dept}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => { setUploadOpen(false); refreshSources(); }}
        />
      )}
    </div>
  );
}

// Department-scoped upload modal. POSTs to /api/v1/ingest-queue with
// scope pre-set to this department; falls back to local-only if API
// is unreachable.
function DeptUploadModal({ dept, onClose, onUploaded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function pickFile() { fileInputRef.current?.click(); }
  function adoptFile(f) { if (!f) return; setFile(f); if (!title) setTitle(f.name); }

  function fmtSize(bytes) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  function detectType() {
    const lower = (file?.name || title).toLowerCase();
    if (lower.endsWith(".pdf")) return "PDF";
    if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "DOC";
    if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return "PPT";
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "XLSX";
    if (lower.endsWith(".txt") || lower.endsWith(".md")) return "TXT";
    return "FILE";
  }

  async function start() {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      await apiPost("/api/v1/ingest-queue", {
        name: file?.name || title.trim() || "(未命名)",
        type: detectType(),
        size: file ? fmtSize(file.size) : "—",
        state: "review",
        progress: 100,
        scope: dept.name,
        owner: dept.lead || "当前用户"
      });
      onUploaded?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <Modal
      title={`上传到 ${dept.name} 部门`}
      sub={`材料会进入入库队列(scope=${dept.name}),审核通过后绑定到本部门可见的知识源列表。`}
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button
          className="btn btn--primary btn--sm"
          onClick={start}
          disabled={running || (!file && !title.trim())}
          style={(running || (!file && !title.trim())) ? { opacity: 0.5, cursor: "not-allowed" } : { background: dept.color }}
        >
          <Icon.Upload size={13} /> {running ? "上传中…" : "提交入库"}
        </button>
      </>}
    >
      <div className="field">
        <label className="field__label">文件</label>
        <div
          role="button"
          tabIndex={0}
          onClick={pickFile}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); adoptFile(e.dataTransfer?.files?.[0]); }}
          style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 24, textAlign: "center", color: "var(--fg3)", cursor: "pointer" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md"
            style={{ display: "none" }}
            onChange={e => adoptFile(e.target.files?.[0])}
          />
          {file ? (
            <>
              <Icon.FileText size={24} style={{ margin: "0 auto 6px", color: dept.color }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{file.name}</div>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{fmtSize(file.size)} · {detectType()}</div>
            </>
          ) : (
            <>
              <Icon.Upload size={24} style={{ margin: "0 auto 6px", color: "var(--fg4)" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>拖入或点击选择文件</div>
              <input
                type="text"
                placeholder="或输入文件名"
                className="input"
                style={{ marginTop: 10, maxWidth: 280 }}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </>
          )}
        </div>
      </div>
      {error && (
        <div style={{ padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 8, color: "var(--danger-text)", fontSize: 12 }}>
          上传失败:{error}
        </div>
      )}
    </Modal>
  );
}

function CMFIntelligence({ dept }) {
  const swatches = [
    { name: "雾雪白", hex: "#F5F4EE", uses: 42 }, { name: "墨砂黑", hex: "#1F1E1C", uses: 38 },
    { name: "沙金", hex: "#C9A66B", uses: 24 }, { name: "玄铁灰", hex: "#5A5C5F", uses: 31 },
    { name: "薄雾蓝", hex: "#A6BFCB", uses: 18 }, { name: "暖香槟", hex: "#D4B895", uses: 15 },
    { name: "深湖绿", hex: "#1F3D38", uses: 12 }, { name: "瓷釉白", hex: "#EAE8E1", uses: 28 }
  ];
  // 「拖入产品图片」 box clicked → open the CMF 图片识别 skill's
  // RunDialog. Since the SkillPack has the image-input + CMF-output
  // contract, we route through the same skill chat we wired earlier.
  const cmfSkill = SkillPacks.find(s => s.id === "sp-cmf-vision");
  const [running, setRunning] = useState(null);
  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 20 }}>
        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Image size={14} /> 2026 春夏色彩主流</div><span className="pill pill--info">来自 1,046 条 CMF 数据</span></div>
          <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {swatches.map(s => (
              <div key={s.hex} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-soft)" }}>
                <div style={{ height: 80, background: s.hex }} />
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{s.name}</div>
                  <div className="num" style={{ fontSize: 10, color: "var(--fg3)" }}>{s.hex} · {s.uses} 次引用</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="card__title" style={{ marginBottom: 14 }}><Icon.Camera size={14} /> 上传图片识别</div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => cmfSkill && setRunning(cmfSkill)}
            onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && cmfSkill) setRunning(cmfSkill); }}
            style={{
              border: "2px dashed var(--border)",
              borderRadius: 10, padding: 28, textAlign: "center", color: "var(--fg3)",
              cursor: cmfSkill ? "pointer" : "default", transition: "background 0.15s, border-color 0.15s"
            }}
            onMouseEnter={e => { if (cmfSkill) { e.currentTarget.style.borderColor = "var(--vel-indigo)"; e.currentTarget.style.background = "var(--vel-indigo-50)"; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.background = ""; }}
            title={cmfSkill ? "点击启动 CMF 图片识别 (Sonnet 4.6)" : "未找到对应 Skill"}
          >
            <Icon.Upload size={28} style={{ margin: "0 auto 8px", color: "var(--fg4)" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>点击启动「CMF 图片识别」</div>
            <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 4 }}>识别色彩 / 材质 / 表面工艺 / CMF 标签</div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--fg3)" }}>
            最近识别: <strong style={{ color: "var(--fg2)" }}>松下 K3 净水器 (墨砂黑 + 拉丝铝)</strong>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card__head"><div className="card__title"><Icon.GitBranch size={14} /> 材质 × 工艺矩阵 (本季)</div></div>
        <div style={{ padding: 18, overflow: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: 8, textAlign: "left" }}></th>
                {["阳极氧化", "PVD", "喷涂", "拉丝", "高光"].map(p => <th key={p} style={{ padding: 8, fontSize: 11, color: "var(--fg3)", fontWeight: 600 }}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {["铝合金", "ABS", "玻璃", "不锈钢", "陶瓷"].map(m => (
                <tr key={m} style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: 10, fontWeight: 600, color: "var(--fg1)" }}>{m}</td>
                  {[1, 2, 3, 4, 5].map(i => {
                    const v = (m.length * i) % 9;
                    const opacity = v / 9;
                    return <td key={i} style={{ padding: 8, textAlign: "center" }}>
                      <div style={{ width: 36, height: 24, borderRadius: 4, background: `rgba(79,70,229,${opacity})`, margin: "0 auto", color: opacity > 0.5 ? "#fff" : "var(--fg3)", fontSize: 10, display: "grid", placeItems: "center", fontFamily: "var(--font-mono)" }}>{v ? v * 7 : "—"}</div>
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 10 }}>数字代表近 90 天本部门方案中该组合的使用次数。</div>
        </div>
      </div>
      {running && <RunDialog kind="skill" item={running} deptId={dept?.id} onClose={() => setRunning(null)} />}
    </div>
  );
}

function MarketInsights({ dept }) {
  // 「奥维数据分析」 skill backs the live "运行奥维数据分析" CTA.
  const aoweiSkill = SkillPacks.find(s => s.id === "sp-aow");
  const [running, setRunning] = useState(null);
  return (
    <>
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20 }}>
      <div className="card">
        <div className="card__head">
          <div className="card__title"><Icon.BarChart size={14} /> 厨卫品类 价格带分布 · 奥维 2025Q4</div>
          {aoweiSkill && (
            <button className="btn btn--primary btn--sm" onClick={() => setRunning(aoweiSkill)}>
              <Icon.Sparkles size={12} /> 运行奥维数据分析
            </button>
          )}
        </div>
        <div style={{ padding: 22 }}>
          <svg viewBox="0 0 600 220" style={{ width: "100%", height: 220 }}>
            {[
              { x: 30, label: "<2K", v: 28 }, { x: 110, label: "2-3K", v: 42 },
              { x: 190, label: "3-4K", v: 68 }, { x: 270, label: "4-5K", v: 55 },
              { x: 350, label: "5-7K", v: 38 }, { x: 430, label: "7-10K", v: 22 },
              { x: 510, label: ">10K", v: 14 }
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={200 - b.v * 2.5} width="60" height={b.v * 2.5} rx="4" fill={i === 2 ? "#4F46E5" : "#cbd5e1"} />
                <text x={b.x + 30} y="215" textAnchor="middle" fontSize="11" fill="#64748b">{b.label}</text>
                <text x={b.x + 30} y={195 - b.v * 2.5} textAnchor="middle" fontSize="10" fill={i === 2 ? "#4F46E5" : "#94a3b8"} fontWeight="700" fontFamily="JetBrains Mono">{b.v}%</text>
              </g>
            ))}
          </svg>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <span className="pill pill--indigo">3-4K 价格带为头部机会</span>
            <span className="pill pill--warn">{">10K"} 高端段竞品集中</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card__head"><div className="card__title"><Icon.AlertTriangle size={14} /> 竞品规格警报</div></div>
        <div>
          {[
            { brand: "松下 K3", spec: "废水比 1:1, 售价 4,299", flag: "高于我司 3-4K 段" },
            { brand: "海尔 净享 Pro", spec: "1500L 通量 / RO + UF", flag: "超过我司主推" },
            { brand: "美的 X9", spec: "外观采用云朵 CMF", flag: "趋势预警" }
          ].map((c, i) => (
            <div key={i} style={{ padding: 14, borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{c.brand}</div>
              <div style={{ fontSize: 12, color: "var(--fg2)", marginTop: 2 }}>{c.spec}</div>
              <span className="pill pill--warn" style={{ marginTop: 6 }}>{c.flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    {running && <RunDialog kind="skill" item={running} deptId={dept?.id} onClose={() => setRunning(null)} />}
    </>
  );
}

function DeptSkills({ dept, setRoute }) {
  const list = SkillPacks.filter(s => s.dept === dept.id);
  const [running, setRunning] = useState(null);
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          <strong style={{ color: "var(--fg1)" }}>{dept.name}</strong> 拥有 <strong className="num" style={{ color: "var(--fg1)" }}>{list.length}</strong> 个 Skill Pack — 详细 CRUD 可在「技能中心」管理。
        </div>
        <div className="row" style={{ gap: 8 }}>
          {setRoute && (
            <button className="btn btn--ghost btn--sm" onClick={() => setRoute({ page: "skills" })}>
              <Icon.ArrowRight size={13} /> 打开技能中心
            </button>
          )}
          <button
            className="btn btn--primary btn--sm"
            onClick={() => setRoute && setRoute({ page: "skills" })}
            title={setRoute ? "跳到技能中心新建 — 那里有完整的 Skill Pack 编辑器" : "请前往技能中心创建"}
          >
            <Icon.Plus size={13} /> 新增 Skill
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3">
        {list.map(s => (
          <div key={s.id} className="card" style={{ padding: 18 }}>
            <div className="row" style={{ marginBottom: 10, gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: dept.color + "18", color: dept.color, display: "grid", placeItems: "center" }}>
                {React.createElement(Icon[s.icon] || Icon.Sparkles, { size: 17 })}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{s.name}</div>
                <div className="num" style={{ fontSize: 10, color: "var(--fg3)" }}>{s.version} · {s.maintainer}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 10, lineHeight: 1.5 }}>
              <div><strong style={{ color: "var(--fg2)" }}>输入:</strong> {s.input}</div>
              <div><strong style={{ color: "var(--fg2)" }}>输出:</strong> {s.output}</div>
            </div>
            <div className="row" style={{ justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
              <div style={{ fontSize: 11, color: "var(--fg3)" }}>{s.uses} 次 · ★ {s.rating}</div>
              <button className="btn btn--text btn--sm" onClick={() => setRunning(s)}>运行 →</button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1", padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
            {dept.name} 暂无 Skill Pack
          </div>
        )}
      </div>
      {running && <RunDialog kind="skill" item={running} deptId={dept.id} onClose={() => setRunning(null)} />}
    </div>
  );
}

function DeptWorkflows({ dept }) {
  const [running, setRunning] = useState(null);
  // Prefer real Workflows from registry that match this dept; fall back to
  // the original mocked list for departments whose workflows aren't seeded.
  const real = Workflows.filter(w => w.deptId === dept.id);
  if (real.length > 0) {
    return (
      <div className="grid grid-cols-2">
        {real.map(w => (
          <div key={w.id} className="card" style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              {React.createElement(Icon[w.icon] || Icon.Workflow, { size: 16, style: { color: "var(--vel-indigo)" } })}
              <span className="pill pill--neutral">{w.steps.length} 步</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)", marginBottom: 6 }}>{w.name}</div>
            <div style={{ fontSize: 12, color: "var(--fg3)", lineHeight: 1.5, marginBottom: 12 }}>{w.description}</div>
            <div className="row" style={{ gap: 4, marginBottom: 12 }}>
              {w.steps.map((s, si) => (
                <div key={s.id || si} style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--vel-indigo)" }} />
              ))}
            </div>
            <div className="row" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--fg3)" }}>
              <span>{w.uses} 次执行 · {w.avgTime}</span>
              <button className="btn btn--text btn--sm" onClick={() => setRunning(w)}>启动 →</button>
            </div>
          </div>
        ))}
        {running && <RunDialog kind="workflow" item={running} deptId={dept.id} onClose={() => setRunning(null)} />}
      </div>
    );
  }
  const flows = [
    { name: "创建设计简报", steps: 5, uses: 64, time: "约 8 分钟" },
    { name: "材料方案对比", steps: 4, uses: 38, time: "约 5 分钟" },
    { name: "CMF 可行性检查", steps: 6, uses: 27, time: "约 12 分钟" },
    { name: "供应商 / 工艺评审", steps: 7, uses: 19, time: "约 18 分钟" },
    { name: "竞品设计语言图谱", steps: 5, uses: 42, time: "约 10 分钟" },
    { name: "概念评审备忘录", steps: 4, uses: 31, time: "约 6 分钟" }
  ];
  return (
    <div className="grid grid-cols-2">
      {flows.map((f, i) => (
        <div key={i} className="card" style={{ padding: 18 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <Icon.Workflow size={16} style={{ color: "var(--vel-indigo)" }} />
            <span className="pill pill--neutral">{f.steps} 步</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)", marginBottom: 10 }}>{f.name}</div>
          <div className="row" style={{ gap: 4, marginBottom: 12 }}>
            {[...Array(f.steps)].map((_, si) => (
              <div key={si} style={{ flex: 1, height: 4, borderRadius: 2, background: si < f.steps - 1 ? "var(--vel-indigo)" : "var(--slate-200)" }} />
            ))}
          </div>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--fg3)" }}>
            <span>{f.uses} 次执行 · {f.time}</span>
            <button className="btn btn--text btn--sm">启动 →</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeptProjects({ dept }) {
  const isMine = (p) => p.deptId === dept.id || p.dept === dept.name || (p.dept || "").includes(dept.name);
  const seedFiltered = Projects.filter(isMine);
  const seed = seedFiltered.length ? seedFiltered : Projects.slice(0, 3).map(p => ({ ...p, deptId: dept.id, dept: dept.name }));

  const [list, setList] = useState(() => seed.map(p => ({ ...p })));
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  function save(next) {
    setList(prev => {
      const i = prev.findIndex(p => p.id === next.id);
      if (i === -1) return [next, ...prev];
      const cp = prev.slice(); cp[i] = next; return cp;
    });
    setEditing(null);
  }
  function del(id) { setList(prev => prev.filter(p => p.id !== id)); setConfirm(null); }
  function onNew() {
    setEditing({
      id: makeId("proj"), name: "", health: "ok", progress: 0,
      owner: dept.lead || "", deptId: dept.id, dept: dept.name,
      okr: (Objectives[0] && Objectives[0].code) || "O1",
      milestone: "", due: "2026-12-31", risks: 0,
      milestones: [], risksDetail: [], contributors: [], linkedDecisions: [], linkedSources: [],
      __isNew: true
    });
  }

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          共 <strong className="num" style={{ color: "var(--fg1)" }}>{list.length}</strong> 个关键项目 · 关联部门 <strong style={{ color: "var(--fg1)" }}>{dept.name}</strong>
        </div>
        <button className="btn btn--primary btn--sm" onClick={onNew}><Icon.Plus size={13} /> 新增项目</button>
      </div>
      <div className="card">
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--slate-50)" }}>
            <tr style={{ textAlign: "left" }}>
              {["项目", "OKR", "负责人", "里程碑", "进度", "风险", "截止", ""].map((h, i) => <th key={i} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} style={{ borderTop: "1px solid var(--border-soft)" }}>
                <td style={{ padding: "12px 14px" }}>
                  <span className={`dot dot--${p.health}`} />
                  <a onClick={() => setViewing(p)} style={{ cursor: "pointer", color: "var(--fg1)", fontWeight: 600, marginLeft: 8 }}>
                    {p.name || <span style={{ color: "var(--fg4)", fontWeight: 500 }}>未命名</span>}
                  </a>
                </td>
                <td style={{ padding: "12px 14px" }}><span className="pill pill--indigo num">{p.okr}</span></td>
                <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{p.owner || "—"}</td>
                <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{p.milestone || "—"}</td>
                <td style={{ padding: "12px 14px", width: 160 }}><div className="row" style={{ gap: 8 }}><div style={{ flex: 1 }}><Progress value={p.progress} status={p.health} /></div><span className="num" style={{ fontSize: 11 }}>{p.progress}%</span></div></td>
                <td style={{ padding: "12px 14px" }}>{p.risks > 0 ? <span className={`pill ${p.risks > 3 ? 'pill--danger' : 'pill--warn'}`}>⚠ {p.risks}</span> : <span style={{ color: "var(--fg4)", fontSize: 11 }}>—</span>}</td>
                <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg3)" }}>{p.due}</td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                  <div className="row-actions">
                    <button className="icon-btn" title="详情" onClick={() => setViewing(p)}><Icon.Eye size={13} /></button>
                    <button className="icon-btn" title="编辑" onClick={() => setEditing({ ...p })}><Icon.Edit size={13} /></button>
                    <button className="icon-btn icon-btn--danger" title="删除" onClick={() => setConfirm({ p })}><Icon.Trash size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
                {dept.name} 暂无项目 — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>新增第一个</a>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProjectEditor
          project={editing}
          objectives={Objectives}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => save(editing)}
        />
      )}
      {viewing && (
        <ProjectDetail
          project={viewing}
          onClose={() => setViewing(null)}
          onEdit={p => { setViewing(null); setEditing({ ...p }); }}
        />
      )}
      {confirm && (
        <ConfirmModal
          title="删除项目?"
          body={<>将从 <b>{dept.name}</b> 移除项目 <b>"{confirm.p.name}"</b>。该操作仅在本部门视图生效。</>}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => del(confirm.p.id)}
        />
      )}
    </div>
  );
}

function updateAt(arr, i, fn) {
  if (i < 0 || i >= arr.length) return arr;
  const cp = arr.slice();
  cp[i] = fn(cp[i]);
  return cp;
}

function AssistantChat({ dept }) {
  const initial = [
    { role: "user", text: "PVD 工艺与喷涂在零冷水热水器外壳上,500台试产成本对比?" },
    {
      role: "assistant",
      text: "根据当前部门知识库 (CMF 1,046 条 + 工艺 156 条),给出 500 台试产规模的对比:\n\n• PVD: 单件 ¥38-46,工艺周期 3-4 天,色彩稳定性 ★★★★★\n• 喷涂: 单件 ¥12-18,工艺周期 1-2 天,色彩稳定性 ★★★\n\n建议:外观件用 PVD,内部件用喷涂,综合成本下降约 22%。",
      // Source IDs reference seed.KnowledgeSources so citations stay live.
      sourceIds: ["ks-5", "ks-8"],
      sources: ["供应商能力库 / 杭州东方 (内部)"],
      skill: "供应商/材料/工艺检索",
      okr: ["O1", "O3"]
    }
  ];
  const [msgs, setMsgs] = useState(initial);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  // Streams /api/v1/chat/stream with the running transcript. Tokens
  // append in real-time so a slow Sonnet response feels responsive.
  // Soft-fails to a canned reply when the backend returns a stable error
  // slug (e.g. anthropic_not_configured on a preview deploy).
  const send = () => {
    const text = draft.trim();
    if (!text || pending) return;
    const nextMsgs = [...msgs, { role: "user", text }];
    setMsgs(nextMsgs);
    setDraft("");
    setPending(true);

    // Allocate the assistant message up-front so we can mutate its
    // .text in place as tokens arrive.
    const placeholderIdx = nextMsgs.length;
    setMsgs(m => [
      ...m,
      {
        role: "assistant",
        text: "",
        sources: [],
        skill: dept.assistant ? `${dept.assistant} · Sonnet 4.6` : "Sonnet 4.6",
        streaming: true
      }
    ]);

    const wire = nextMsgs.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text
    }));

    let buffered = "";
    apiStream("/api/v1/chat/stream", { messages: wire, deptId: dept.id }, {
      onEvent: (ev) => {
        if (ev.type === "text") {
          buffered += ev.text;
          setMsgs(m => updateAt(m, placeholderIdx, x => ({ ...x, text: buffered })));
        } else if (ev.type === "done") {
          setMsgs(m => updateAt(m, placeholderIdx, x => ({
            ...x,
            streaming: false,
            model: ev.model,
            usage: ev.usage
          })));
          setPending(false);
        } else if (ev.type === "error") {
          setMsgs(m => updateAt(m, placeholderIdx, x => ({
            ...x,
            streaming: false,
            text: ev.detail === "anthropic_not_configured"
              ? "助手未配置:后台缺少 ANTHROPIC_API_KEY,本回合返回模拟内容。\n\n实际部署中,这里会引用部门知识库并写回项目/OKR。"
              : `助手暂时不可用(${ev.detail}),稍后重试。`
          })));
          setPending(false);
        }
      },
      onError: (err) => {
        const detail = err instanceof ApiError ? err.detail : String(err);
        setMsgs(m => updateAt(m, placeholderIdx, x => ({
          ...x,
          streaming: false,
          text: detail === "anthropic_not_configured"
            ? "助手未配置:后台缺少 ANTHROPIC_API_KEY,本回合返回模拟内容。\n\n实际部署中,这里会引用部门知识库并写回项目/OKR。"
            : `助手暂时不可用(${detail || "网络错误"}),稍后重试。`
        })));
        setPending(false);
      }
    });
  };

  function openSource(id) {
    // Lightweight cross-page nav hint: drop a hash so a future deep-link
    // handler in KnowledgePage can scroll to / open this source.
    if (typeof window !== "undefined") {
      window.location.hash = `knowledge:${id}`;
    }
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: 20, height: "calc(100vh - 280px)" }}>
      <div className="card" style={{ display: "flex", flexDirection: "column" }}>
        <div className="card__head">
          <div className="card__title">
            <span style={{ fontSize: 18 }}>🦞</span>
            <span>{dept.assistant} · {dept.name} 助手</span>
            <span className="pill pill--ok"><span className="dot dot--ok" style={{ marginRight: 4 }} />在线</span>
          </div>
          <button className="btn btn--text btn--sm">新对话 +</button>
        </div>
        <div className="scroll" style={{ flex: 1, padding: 22, overflow: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 12, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: m.role === "user" ? "linear-gradient(135deg,#f59e0b,#ef4444)" : dept.color, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 14, fontWeight: 700 }}>
                {m.role === "user" ? "陈" : "🦞"}
              </div>
              <div style={{ maxWidth: "80%" }}>
                <div style={{ background: m.role === "user" ? "var(--vel-indigo)" : "var(--slate-50)", color: m.role === "user" ? "#fff" : "var(--fg1)", padding: "12px 16px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                  {m.text}
                  {m.streaming && (
                    <span style={{ display: "inline-block", width: 7, height: 14, background: "var(--vel-indigo)", marginLeft: 4, verticalAlign: "-2px", animation: "blink 1s steps(2,start) infinite" }} />
                  )}
                  {m.streaming && !m.text && <span style={{ color: "var(--fg4)", fontSize: 12 }}>思考中…</span>}
                </div>
                {((m.sourceIds && m.sourceIds.length) || (m.sources && m.sources.length)) > 0 && (
                  <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {(m.sourceIds || []).map(id => {
                      const src = KnowledgeSources.find(k => k.id === id);
                      if (!src) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => openSource(id)}
                          className="pill pill--indigo"
                          title={src.summary || src.title}
                          style={{ cursor: "pointer", border: "none" }}
                        >
                          <Icon.FileText size={10} /> {src.title}
                        </button>
                      );
                    })}
                    {(m.sources || []).map((s, si) => (
                      <span key={`free-${si}`} className="pill pill--neutral"><Icon.FileText size={10} /> {s}</span>
                    ))}
                  </div>
                )}
                {m.okr && (
                  <div className="row" style={{ gap: 6, marginTop: 4 }}>
                    {m.okr.map(o => <span key={o} className="pill pill--ok num">关联 {o}</span>)}
                    {m.skill && <span className="pill pill--neutral"><Icon.Sparkles size={9} /> {m.skill}</span>}
                  </div>
                )}
                {m.role === "assistant" && (
                  <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 11, color: "var(--fg3)" }}>
                    <button>👍 有用</button>
                    <button>👎 不准确</button>
                    <button>+ 补充知识</button>
                    <button>↗ 写入项目</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: "1px solid var(--border-soft)" }}>
          <div className="row" style={{ gap: 8, padding: "8px 12px", background: "var(--slate-50)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <button className="btn btn--icon btn--text"><Icon.Paperclip size={15} /></button>
            <button className="btn btn--icon btn--text"><Icon.Image size={15} /></button>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !pending && send()}
              placeholder={pending ? "助手思考中…" : `@${dept.assistant} 帮我…`}
              disabled={pending}
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--fg1)" }}
            />
            <button className="btn btn--icon btn--text"><Icon.Mic size={15} /></button>
            <button
              className="btn btn--primary btn--sm"
              onClick={send}
              disabled={pending || !draft.trim()}
              style={(pending || !draft.trim()) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              <Icon.Send size={13} /> {pending ? "发送中…" : "发送"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>注入的上下文</div>
          <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.7 }}>
            <div className="row" style={{ gap: 6 }}><Icon.Building size={11} /> 公司: <strong>{Company.name}</strong></div>
            <div className="row" style={{ gap: 6 }}><Icon.Target size={11} /> OKR: O1, O3</div>
            <div className="row" style={{ gap: 6 }}><Icon.Layers size={11} /> 项目: 全屋净水 2.0</div>
            <div className="row" style={{ gap: 6 }}><Icon.Database size={11} /> 部门知识: {dept.knowledge.toLocaleString()} 条</div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>可用技能</div>
          {SkillPacks.filter(s => s.dept === dept.id).slice(0, 4).map(s => (
            <div key={s.id} style={{ display: "flex", gap: 8, padding: "6px 0", fontSize: 12 }}>
              <Icon.Sparkles size={12} style={{ color: dept.color, marginTop: 3 }} />
              <div>{s.name}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>历史对话 (今日)</div>
          {["PVD vs 喷涂成本", "奥维 Q4 价格带分析", "G3 欧标缺口", "局改方案色彩主推"].map((h, i) => (
            <div key={i} style={{ padding: "6px 0", fontSize: 12, color: "var(--fg2)", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>{h}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
