import React, { useRef, useState, useMemo } from "react";
import { Icon, KpiCard, HealthPill, Modal, ConfirmModal, makeId } from "../components/primitives.jsx";
import { Departments, AssistantRoutingRules as SeedRoutingRules, ROUTE_PRIORITIES, SkillPacks, AuditLog as SeedAuditLog, AUDIT_CATEGORIES } from "../data/seed.js";
import { useApi } from "../lib/api.js";

const ROLE_OPTIONS = [
  { v: "ceo",   label: "CEO" },
  { v: "vp",    label: "VP" },
  { v: "lead",  label: "Lead" },
  { v: "staff", label: "Staff" }
];

// CSV cell formatter — quotes any cell containing comma / quote / newline,
// escapes embedded quotes by doubling them per RFC 4180.
function cellToCsv(v) {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, "\"\"")}"`;
  }
  return s;
}

export function AssistantsPage({ setRoute }) {
  // Routing rules come from /api/v1/routing-rules with seed fallback.
  // Local CRUD stays client-side until write endpoints land.
  const { data: apiRules } = useApi("/api/v1/routing-rules");
  const baseRules = apiRules ?? SeedRoutingRules.map(r => ({ ...r }));
  const [rules, setRules] = useState(baseRules);
  const lastApiRef = useRef(apiRules);
  if (apiRules && apiRules !== lastApiRef.current) {
    lastApiRef.current = apiRules;
    setRules(apiRules);
  }
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  function save(next) {
    setRules(prev => {
      const i = prev.findIndex(r => r.id === next.id);
      if (i === -1) return [next, ...prev];
      const cp = prev.slice(); cp[i] = next; return cp;
    });
    setEditing(null);
  }
  function del(id) { setRules(prev => prev.filter(r => r.id !== id)); setConfirm(null); }
  function move(id, delta) {
    setRules(prev => {
      const i = prev.indexOf(prev.find(r => r.id === id));
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const cp = prev.slice(); [cp[i], cp[j]] = [cp[j], cp[i]]; return cp;
    });
  }
  function toggleEnabled(id) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }
  function onNew() {
    setEditing({
      id: makeId("rt"),
      priority: "medium", enabled: true,
      intent: "", targetDept: Departments[0]?.id || "",
      targetSkill: null, permission: "vp,lead,staff",
      note: "", hits: 0, lastHit: "—",
      __isNew: true
    });
  }
  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__eyebrow">助手中心</div>
        <h1 className="page-head__title">企业助手与 Agent</h1>
        <p className="page-head__subtitle">企业战略助手 + 部门助手 + 专业 Agent。一处管理意图路由、技能权限和企业微信入口。</p>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 22, background: "linear-gradient(135deg,#312E81,#4C1D95)", color: "#fff", border: "none" }}>
          <div style={{ fontSize: 11, color: "#c4b5fd", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>企业级</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>战略助手 · Velocity</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>注入公司全部 OKR / 项目 / 战略知识。CEO / VP 优先入口。</div>
          <div className="row" style={{ gap: 12, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            <span>✦ 全部 8 个 Agent</span><span>·</span><span>本周 142 次</span>
          </div>
        </div>
        {Departments.filter(d => !d.parentId && d.assistant !== "—").slice(0, 5).map(d => (
          <div key={d.id} className="card" style={{ padding: 20, cursor: "pointer" }} onClick={() => setRoute({ page: "department", deptId: d.id })}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: d.color + "18", color: d.color, display: "grid", placeItems: "center" }}>
                {React.createElement(Icon[d.icon], { size: 17 })}
              </div>
              <HealthPill status={d.status} />
            </div>
            <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--fg1)" }}>{d.assistant} 助手</div>
            <div className="row" style={{ gap: 12, marginTop: 12, fontSize: 11, color: "var(--fg3)" }}>
              <span>{d.skills} 个技能</span><span>·</span><span>{d.knowledge.toLocaleString()} 条知识</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card__head">
          <div className="card__title"><Icon.GitBranch size={14} /> 意图路由规则 ({rules.length})</div>
          <div className="row" style={{ gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--fg3)" }}>按优先级从上到下匹配,首条命中即停止</span>
            <button className="btn btn--primary btn--sm" onClick={onNew}><Icon.Plus size={13} /> 新增规则</button>
          </div>
        </div>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--slate-50)" }}>
            <tr style={{ textAlign: "left" }}>
              {["#", "启用", "优先级", "意图模式", "目标部门", "默认 Skill", "权限", "命中", ""].map((h, i) => (
                <th key={i} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map((r, idx) => {
              const dept = Departments.find(d => d.id === r.targetDept);
              const skill = r.targetSkill ? SkillPacks.find(s => s.id === r.targetSkill) : null;
              const pri = ROUTE_PRIORITIES.find(p => p.v === r.priority) || ROUTE_PRIORITIES[1];
              return (
                <tr key={r.id} style={{ borderTop: "1px solid var(--border-soft)", opacity: r.enabled ? 1 : 0.5 }}>
                  <td style={{ padding: "10px 14px", color: "var(--fg3)" }}>
                    <div className="row" style={{ gap: 4 }}>
                      <span className="num">{idx + 1}</span>
                      <button className="icon-btn" style={{ width: 18, height: 18 }} onClick={() => move(r.id, -1)} disabled={idx === 0} title="上移"><Icon.ArrowRight size={10} style={{ transform: "rotate(-90deg)" }} /></button>
                      <button className="icon-btn" style={{ width: 18, height: 18 }} onClick={() => move(r.id, 1)} disabled={idx === rules.length - 1} title="下移"><Icon.ArrowRight size={10} style={{ transform: "rotate(90deg)" }} /></button>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button className={`pill ${r.enabled ? "pill--ok" : "pill--neutral"}`} style={{ cursor: "pointer", border: "none" }} onClick={() => toggleEnabled(r.id)}>
                      {r.enabled ? "启用" : "已停用"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span className="pill" style={{ background: pri.color + "20", color: pri.color, fontWeight: 600 }}>{pri.label}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>{r.intent || <span style={{ color: "var(--fg4)", fontWeight: 500 }}>未配置</span>}</div>
                    {r.note && <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{r.note}</div>}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {dept ? <span className="pill pill--info">{dept.name}</span> : r.targetDept === "platform" ? <span className="pill pill--indigo">平台基础</span> : "—"}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {skill ? <span className="pill pill--neutral"><Icon.Sparkles size={10} /> {skill.name}</span> : <span style={{ fontSize: 11, color: "var(--fg4)" }}>默认助手</span>}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{r.permission}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div className="num" style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 600 }}>{r.hits}</div>
                    <div style={{ fontSize: 11, color: "var(--fg4)" }}>{r.lastHit}</div>
                  </td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <div className="row-actions">
                      <button className="icon-btn" title="编辑" onClick={() => setEditing({ ...r })}><Icon.Edit size={13} /></button>
                      <button className="icon-btn icon-btn--danger" title="删除" onClick={() => setConfirm({ r })}><Icon.Trash size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rules.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>暂无规则 — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>新增第一条</a></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card__head"><div className="card__title"><Icon.Activity size={14} /> 意图路由 · 最近 24 小时</div></div>
        <div style={{ padding: 22 }}>
          <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 12 }}>用户提问 → 部门识别 → 技能匹配 → 知识检索 → 回答。下面是今日实际路由案例:</div>
          {[
            { q: "2026 春夏色彩主推?", dept: "工业设计", skill: "趋势洞察结构化", time: "0.8s", status: "ok" },
            { q: "上海地区净水器投诉率为何上升?", dept: "服务部", skill: "投诉归因", time: "1.4s", status: "ok" },
            { q: "下个季度备货建议?", dept: "供应链", skill: "动销预测", time: "2.1s", status: "warn" },
            { q: "AI Native 战略有哪些反对意见?", dept: "战略助手", skill: "决策日志检索", time: "0.6s", status: "ok" }
          ].map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 500 }}>"{r.q}"</div>
              <Icon.ArrowRight size={12} style={{ color: "var(--fg4)" }} />
              <span className="pill pill--info">{r.dept}</span>
              <span className="pill pill--neutral">{r.skill}</span>
              <span className="num" style={{ fontSize: 11, color: r.status === "ok" ? "var(--success-text)" : "var(--warning-text)" }}>{r.time}</span>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <RoutingRuleEditor
          rule={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => save(editing)}
        />
      )}
      {confirm && (
        <ConfirmModal
          title="删除路由规则?"
          body={<>该规则将不再参与意图匹配,历史命中记录保留在审计日志中。</>}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => del(confirm.r.id)}
        />
      )}
    </div>
  );
}

function RoutingRuleEditor({ rule: r, onChange, onClose, onSave }) {
  function set(k, v) { onChange({ ...r, [k]: v }); }
  const valid = r.intent && r.intent.trim().length > 0;
  const permRoles = (r.permission || "").split(",").map(s => s.trim()).filter(Boolean);
  function togglePerm(role) {
    const next = permRoles.includes(role) ? permRoles.filter(x => x !== role) : [...permRoles, role];
    set("permission", next.join(","));
  }

  const parents = Departments.filter(d => !d.parentId);
  const skillsForDept = SkillPacks.filter(s => s.dept === r.targetDept || s.scope === "platform" || s.scope === "company");

  return (
    <Modal
      title={r.__isNew ? "新增意图路由规则" : "编辑意图路由规则"}
      sub="规则按优先级从上到下匹配,首条命中即停止。意图模式留空表示 Fallback。"
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" disabled={!valid} onClick={onSave} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
          <Icon.Save size={13} /> 保存
        </button>
      </>}
    >
      <div className="field">
        <label className="field__label">意图模式 *</label>
        <input className="input" value={r.intent} onChange={e => set("intent", e.target.value)} placeholder="例如:CMF / 材料 / 工艺 / 色彩 / 表面" />
        <div className="field__hint" style={{ fontSize: 11, color: "var(--fg4)" }}>用 / 分隔关键词,任一命中即触发。生产环境会替换为分类器分数。</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">优先级</label>
          <select className="select" value={r.priority} onChange={e => set("priority", e.target.value)}>
            {ROUTE_PRIORITIES.map(p => <option key={p.v} value={p.v}>{p.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label">启用</label>
          <select className="select" value={r.enabled ? "y" : "n"} onChange={e => set("enabled", e.target.value === "y")}>
            <option value="y">启用</option>
            <option value="n">停用</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">目标部门</label>
          <select className="select" value={r.targetDept} onChange={e => set("targetDept", e.target.value)}>
            <option value="platform">平台基础</option>
            {parents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field__label">默认 Skill (可选)</label>
        <select className="select" value={r.targetSkill || ""} onChange={e => set("targetSkill", e.target.value || null)}>
          <option value="">— 走默认部门助手 —</option>
          {skillsForDept.map(s => <option key={s.id} value={s.id}>{s.name} ({s.scope})</option>)}
        </select>
      </div>

      <div className="field">
        <label className="field__label">允许调用的角色</label>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {ROLE_OPTIONS.map(role => {
            const sel = permRoles.includes(role.v);
            return (
              <button key={role.v} className={`btn btn--sm ${sel ? "btn--primary" : "btn--ghost"}`} onClick={() => togglePerm(role.v)}>{role.label}</button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label className="field__label">备注</label>
        <textarea className="textarea" value={r.note || ""} onChange={e => set("note", e.target.value)} placeholder="可选 — 说明这条规则的设计意图。" />
      </div>
    </Modal>
  );
}

export function GovernancePage({ setRoute }) {
  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__eyebrow">权限与治理</div>
        <h1 className="page-head__title">知识治理</h1>
        <p className="page-head__subtitle">权限隔离、来源追溯、知识质量、审计日志和模型 / 连接器管理。</p>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="可追溯回答率" value="68%" delta="+12pt" status="up" spark={[42, 48, 52, 56, 60, 62, 65, 68]} color="#10b981" />
        <KpiCard label="知识质量(已审核)" value="83%" delta="+4pt" status="up" spark={[70, 72, 76, 78, 80, 80, 82, 83]} color="var(--vel-indigo)" />
        <KpiCard label="禁用 / 过期源" value="42" delta="+8" status="down" spark={[28, 30, 33, 35, 38, 40, 41, 42]} color="#f59e0b" />
        <KpiCard label="本月审计事件" value="186" delta="+24" status="up" spark={[120, 140, 150, 160, 170, 178, 182, 186]} color="#7c3aed" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20 }}>
        <div className="card">
          <div className="card__head">
            <div className="card__title"><Icon.Lock size={14} /> 权限矩阵 (角色 × 范围)</div>
          </div>
          <table style={{ width: "100%", fontSize: 12 }}>
            <thead style={{ background: "var(--slate-50)" }}>
              <tr>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase" }}>角色</th>
                {["公司知识", "战略", "OKR", "部门知识", "助手", "审计"].map(c => (
                  <th key={c} style={{ padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "var(--fg3)" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { role: "CEO", perms: ["RW", "RW", "RW", "R", "RW", "R"] },
                { role: "VP / 部门负责人", perms: ["R", "RW", "RW", "RW", "RW", "R"] },
                { role: "一线员工", perms: ["R", "—", "R", "R", "R", "—"] },
                { role: "IT 管理员", perms: ["RW", "—", "—", "—", "RW", "RW"] },
                { role: "外部顾问", perms: ["—", "—", "—", "R*", "R", "—"] }
              ].map(r => (
                <tr key={r.role} style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--fg1)" }}>{r.role}</td>
                  {r.perms.map((p, i) => (
                    <td key={i} style={{ padding: "10px 8px", textAlign: "center" }}>
                      {p === "RW" && <span className="pill pill--ok num">RW</span>}
                      {p === "R" && <span className="pill pill--info num">R</span>}
                      {p === "R*" && <span className="pill pill--warn num">R*</span>}
                      {p === "—" && <span style={{ color: "var(--fg4)" }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Cloud size={14} /> 数据连接器</div></div>
          <div style={{ padding: 12 }}>
            {[
              { name: "企业微信", state: "ok", users: "12,400" },
              { name: "钉钉", state: "ok", users: "—" },
              { name: "飞书云文档", state: "ok", users: "488" },
              { name: "S3 / 阿里 OSS", state: "ok", users: "—" },
              { name: "奥维数据 API", state: "warn", users: "—" },
              { name: "ERP", state: "warn", users: "—" },
              { name: "Salesforce", state: "danger", users: "—" }
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                <span className={`dot dot--${c.state}`} />
                <div style={{ flex: 1, fontSize: 13, color: "var(--fg1)" }}>{c.name}</div>
                {c.users !== "—" && <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{c.users}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AuditLogPanel setRoute={setRoute} />
    </div>
  );
}

function AuditLogPanel({ setRoute }) {
  const [filterCat, setFilterCat] = useState("all");
  const [filterSev, setFilterSev] = useState("all");
  const [search, setSearch] = useState("");

  // Audit events come from /api/v1/audit-log with seed fallback.
  const { data: apiAudit } = useApi("/api/v1/audit-log");
  const AuditLog = apiAudit ?? SeedAuditLog;

  const filtered = useMemo(() => AuditLog.filter(e => {
    if (filterCat !== "all" && e.category !== filterCat) return false;
    if (filterSev !== "all" && e.severity !== filterSev) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return e.action.toLowerCase().includes(q)
        || e.target.toLowerCase().includes(q)
        || e.actor.toLowerCase().includes(q);
    }
    return true;
  }), [AuditLog, filterCat, filterSev, search]);

  const sevMeta = {
    info:   { cls: "pill--info",    label: "info" },
    warn:   { cls: "pill--warn",    label: "warn" },
    danger: { cls: "pill--danger",  label: "danger" }
  };

  function exportCsv() {
    const headers = ["时间", "操作人", "IP", "类别", "级别", "操作", "对象", "范围"];
    const rows = filtered.map(e => [e.at, e.actor, e.ip, e.category, e.severity, e.action, e.target, e.scope]);
    const csv = [headers, ...rows]
      .map(row => row.map(cellToCsv).join(","))
      .join("\r\n");
    // Prepend BOM so Excel renders the Chinese characters as UTF-8 by default.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `velocity-audit-log-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 250);
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card__head">
        <div className="card__title"><Icon.FileText size={14} /> 审计日志 ({filtered.length})</div>
        <div className="row" style={{ gap: 8 }}>
          <div className="topbar__search" style={{ width: 220, marginLeft: 0 }}>
            <Icon.Search size={13} />
            <input placeholder="按操作 / 对象 / 操作人搜索…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn--ghost btn--sm" onClick={exportCsv} disabled={filtered.length === 0} style={filtered.length === 0 ? { opacity: 0.5 } : {}}>
            <Icon.Upload size={13} /> 导出 CSV
          </button>
        </div>
      </div>

      <div style={{ padding: "10px 18px 0", borderBottom: "1px solid var(--border-soft)" }}>
        <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <button className={`btn btn--sm ${filterCat === "all" ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilterCat("all")}>全部分类</button>
          {AUDIT_CATEGORIES.map(c => (
            <button
              key={c.v}
              className={`btn btn--sm ${filterCat === c.v ? "btn--primary" : "btn--ghost"}`}
              style={filterCat === c.v ? { background: c.color, borderColor: c.color } : undefined}
              onClick={() => setFilterCat(c.v)}
            >{c.label}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginRight: 6 }}>严重级别</span>
          {[{ v: "all", label: "全部" }, { v: "info", label: "info" }, { v: "warn", label: "warn" }, { v: "danger", label: "danger" }].map(s => (
            <button key={s.v} className={`btn btn--sm ${filterSev === s.v ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilterSev(s.v)}>{s.label}</button>
          ))}
        </div>
      </div>

      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead style={{ background: "var(--slate-50)" }}>
          <tr style={{ textAlign: "left" }}>
            {["时间", "操作人", "IP", "类别", "级别", "操作", "对象 / 范围"].map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(e => {
            const cat = AUDIT_CATEGORIES.find(c => c.v === e.category) || AUDIT_CATEGORIES[0];
            const sev = sevMeta[e.severity] || sevMeta.info;
            const clickable = !!e.link && !!setRoute;
            return (
              <tr
                key={e.id}
                style={{
                  borderTop: "1px solid var(--border-soft)",
                  cursor: clickable ? "pointer" : "default"
                }}
                onClick={clickable ? () => setRoute(e.link) : undefined}
                onMouseEnter={clickable ? (ev) => { ev.currentTarget.style.background = "var(--slate-50)"; } : undefined}
                onMouseLeave={clickable ? (ev) => { ev.currentTarget.style.background = "transparent"; } : undefined}
                title={clickable ? "点击跳转到相关页面" : undefined}
              >
                <td style={{ padding: "10px 14px", color: "var(--fg3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{e.at}</td>
                <td style={{ padding: "10px 14px", color: "var(--fg1)", fontWeight: 600 }}>{e.actor}</td>
                <td style={{ padding: "10px 14px", color: "var(--fg3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{e.ip}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span className="pill" style={{ background: cat.color + "20", color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                </td>
                <td style={{ padding: "10px 14px" }}><span className={`pill ${sev.cls}`}>{sev.label}</span></td>
                <td style={{ padding: "10px 14px", color: "var(--fg1)" }}>
                  {e.action}
                  {clickable && <Icon.Chevron size={11} style={{ color: "var(--fg4)", marginLeft: 6, verticalAlign: "-1px" }} />}
                </td>
                <td style={{ padding: "10px 14px", color: "var(--fg2)", fontSize: 12 }}>
                  <div>{e.target}</div>
                  <div style={{ fontSize: 11, color: "var(--fg4)" }}>{e.scope}</div>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={7} style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>没有匹配的审计事件 — 调整筛选条件</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
