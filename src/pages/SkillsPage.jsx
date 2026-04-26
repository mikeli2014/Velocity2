import React, { useRef, useState } from "react";
import { Icon, KpiCard, Modal, ConfirmModal, makeId } from "../components/primitives.jsx";
import { RunDialog } from "../components/RunDialog.jsx";
import { SkillPacks as SeedSkillPacks, SKILL_SCOPES, SKILL_STATUSES, Departments } from "../data/seed.js";
import { useApi } from "../lib/api.js";

const SKILL_ICONS = ["Search", "Eye", "BarChart", "Sparkles", "GitBranch", "FileText", "Stethoscope", "AlertTriangle", "Workflow", "Cloud", "Lock", "Activity", "Database"];

function SkillCard({ s, dept, onEdit, onDelete, onRun }) {
  const scope = SKILL_SCOPES.find(x => x.v === s.scope) || SKILL_SCOPES[0];
  const status = SKILL_STATUSES.find(x => x.v === s.status) || SKILL_STATUSES[0];
  const accent = dept ? dept.color : "#7c3aed";
  return (
    <div className="card" style={{ padding: 18, position: "relative", opacity: s.status === "deprecated" ? 0.6 : 1 }}>
      <div className="row-actions" style={{ position: "absolute", top: 12, right: 12 }}>
        <button className="icon-btn" title="编辑" onClick={() => onEdit(s)}><Icon.Edit size={13} /></button>
        <button className="icon-btn icon-btn--danger" title="删除" onClick={() => onDelete(s)}><Icon.Trash size={13} /></button>
      </div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10, paddingRight: 56 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: accent + "18", color: accent, display: "grid", placeItems: "center" }}>
          {React.createElement(Icon[s.icon] || Icon.Sparkles, { size: 17 })}
        </div>
        <span className="pill" style={{ background: scope.color + "15", color: scope.color, fontWeight: 600 }}>{scope.label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)", marginBottom: 4 }}>{s.name || <span style={{ color: "var(--fg4)", fontWeight: 500 }}>未命名</span>}</div>
      <div className="row" style={{ gap: 8, marginBottom: 10, fontSize: 11, color: "var(--fg3)" }}>
        <span className="num">{s.version}</span>
        <span style={{ color: "var(--border)" }}>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: status.color, display: "inline-block" }} />
          {status.label}
        </span>
        {dept && <><span style={{ color: "var(--border)" }}>·</span><span style={{ color: dept.color, fontWeight: 600 }}>{dept.name}</span></>}
      </div>
      <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 12, lineHeight: 1.6 }}>
        <div style={{ marginBottom: 3 }}><strong style={{ color: "var(--fg2)" }}>输入:</strong> {s.input}</div>
        <div><strong style={{ color: "var(--fg2)" }}>输出:</strong> {s.output}</div>
      </div>
      <div style={{ padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6, fontSize: 11, color: "var(--fg3)", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span><Icon.User size={10} style={{ verticalAlign: "-1px" }} /> 维护人 <strong style={{ color: "var(--fg1)", marginLeft: 4 }}>{s.maintainer || "未指定"}</strong></span>
        <span className="num">{s.updated || ""}</span>
      </div>
      <div className="row" style={{ justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
        <div className="row" style={{ gap: 12, fontSize: 11, color: "var(--fg3)" }}>
          <span><Icon.Activity size={11} style={{ verticalAlign: "-2px" }} /> <span className="num">{s.uses}</span> 次</span>
          <span><Icon.Star size={11} style={{ verticalAlign: "-2px", color: "#f59e0b" }} /> <span className="num">{s.rating}</span></span>
        </div>
        <button className="btn btn--text btn--sm" disabled={s.status === "deprecated"} onClick={() => onRun && onRun(s)}>运行 <Icon.ArrowRight size={11} /></button>
      </div>
    </div>
  );
}

function SkillEditor({ skill: s, departments, onChange, onClose, onSave }) {
  function set(k, v) { onChange({ ...s, [k]: v }); }
  const valid = s.name.trim().length > 0 && (s.maintainer || "").trim().length > 0;
  return (
    <Modal
      title={s.__isNew ? "新增 Skill Pack" : "编辑 Skill Pack"}
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" disabled={!valid} onClick={onSave} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
          <Icon.Save size={13} /> 保存
        </button>
      </>}
    >
      <div className="field">
        <label className="field__label">技能名称 *</label>
        <input className="input" value={s.name} onChange={e => set("name", e.target.value)} placeholder="例如:供应商 / 材料 / 工艺检索" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">维护人 (Owner) *</label>
          <input className="input" value={s.maintainer || ""} onChange={e => set("maintainer", e.target.value)} placeholder="例如:陈思源 (单一负责人)" />
        </div>
        <div className="field">
          <label className="field__label">版本</label>
          <input className="input num" value={s.version || "v0.1.0"} onChange={e => set("version", e.target.value)} placeholder="v1.0.0" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">所属部门</label>
          <select className="select" value={s.dept} onChange={e => set("dept", e.target.value)}>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            <option value="platform">平台 / IT</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">可见范围</label>
          <select className="select" value={s.scope} onChange={e => set("scope", e.target.value)}>
            {SKILL_SCOPES.map(x => <option key={x.v} value={x.v}>{x.label} — {x.desc}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label">状态</label>
          <select className="select" value={s.status} onChange={e => set("status", e.target.value)}>
            {SKILL_STATUSES.map(x => <option key={x.v} value={x.v}>{x.label}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="field__label">输入</label>
        <input className="input" value={s.input} onChange={e => set("input", e.target.value)} placeholder="例如:设计需求描述 / Excel / 产品图片" />
      </div>
      <div className="field">
        <label className="field__label">输出</label>
        <input className="input" value={s.output} onChange={e => set("output", e.target.value)} placeholder="例如:推荐供应商 / 材料 / 工艺 / 参数" />
      </div>
      <div className="field">
        <label className="field__label">图标</label>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {SKILL_ICONS.map(ic => (
            <button key={ic} type="button"
              onClick={() => set("icon", ic)}
              style={{
                width: 34, height: 34, borderRadius: 7,
                border: s.icon === ic ? "2px solid var(--vel-indigo)" : "1px solid var(--border)",
                background: s.icon === ic ? "var(--vel-indigo-50)" : "white",
                color: s.icon === ic ? "var(--vel-indigo)" : "var(--fg2)",
                cursor: "pointer", display: "grid", placeItems: "center"
              }}>
              {React.createElement(Icon[ic] || Icon.Sparkles, { size: 14 })}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function SkillsPage() {
  // SkillPacks come from /api/v1/skill-packs with seed fallback. Local
  // CRUD stays client-side until skill-pack write endpoints land.
  const { data: apiSkillPacks } = useApi("/api/v1/skill-packs");
  const baseSkillPacks = apiSkillPacks ?? SeedSkillPacks.map(s => ({ ...s }));
  const [list, setList] = useState(baseSkillPacks);
  const lastApiRef = useRef(apiSkillPacks);
  if (apiSkillPacks && apiSkillPacks !== lastApiRef.current) {
    lastApiRef.current = apiSkillPacks;
    setList(apiSkillPacks);
  }
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [running, setRunning] = useState(null);
  const [filterDept, setFilterDept] = useState("all");
  const [filterScope, setFilterScope] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = list.filter(s =>
    (filterDept === "all" || s.dept === filterDept) &&
    (filterScope === "all" || s.scope === filterScope) &&
    (filterStatus === "all" || s.status === filterStatus)
  );

  const counts = {
    total: list.length,
    published: list.filter(s => s.status === "published").length,
    draft: list.filter(s => s.status === "draft").length,
    platform: list.filter(s => s.scope === "platform").length
  };

  function save() {
    setList(prev => {
      const i = prev.findIndex(x => x.id === editing.id);
      const next = { ...editing, updated: new Date().toISOString().slice(0, 10) };
      delete next.__isNew;
      if (i === -1) return [next, ...prev];
      const cp = prev.slice(); cp[i] = next; return cp;
    });
    setEditing(null);
  }
  function del() { setList(prev => prev.filter(x => x.id !== confirm.s.id)); setConfirm(null); }
  function onNew() {
    setEditing({
      id: makeId("sp"), name: "", maintainer: "", version: "v0.1.0",
      dept: "industrial-design", scope: "dept", status: "draft",
      icon: "Sparkles", input: "", output: "",
      uses: 0, rating: 0, updated: new Date().toISOString().slice(0, 10),
      __isNew: true
    });
  }

  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="page-head__eyebrow">技能中心</div>
            <h1 className="page-head__title">Skill Pack 注册表</h1>
            <p className="page-head__subtitle">部门 AI 能力的产品化单元 — 每个 Skill Pack 由一名维护人(Owner)负责,部门负责人审批发布,IT/治理组管理"平台基础"类。</p>
          </div>
          <button className="btn btn--primary btn--sm" onClick={onNew}><Icon.Plus size={13} /> 新增 Skill Pack</button>
        </div>
      </div>

      <div className="card" style={{ padding: "16px 20px", marginBottom: 20, background: "linear-gradient(180deg, var(--vel-indigo-50) 0%, white 100%)", border: "1px solid var(--vel-indigo-100)" }}>
        <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--vel-indigo)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon.Lock size={16} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)", marginBottom: 6 }}>谁管理 Skill Pack?</div>
            <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.7 }}>
              <strong>维护人 (Owner)</strong> 负责单个 Skill 的提示词、工具、评测; <strong>部门负责人</strong> 审批本部门 Skill 的发布与下线; <strong>IT / 治理组</strong> 管理"平台基础"类 (跨部门共享、嵌入审计/权限矩阵)。所有变更进入 <a style={{ color: "var(--vel-indigo)", textDecoration: "underline", cursor: "pointer" }}>知识治理 → 审计日志</a>。
            </div>
            <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {SKILL_SCOPES.map(x => (
                <div key={x.v} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: "white", border: "1px solid var(--border-soft)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: x.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg1)" }}>{x.label}</span>
                  <span style={{ fontSize: 11, color: "var(--fg3)" }}>{x.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 16 }}>
        <KpiCard label="技能总数" value={counts.total} color="var(--vel-indigo)" />
        <KpiCard label="已发布" value={counts.published} color="#10b981" />
        <KpiCard label="草稿" value={counts.draft} color="#f59e0b" />
        <KpiCard label="平台基础" value={counts.platform} color="#7c3aed" />
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", marginRight: 4 }}>部门</span>
          {[{ id: "all", name: "全部" }, ...Departments.filter(d => !d.parentId), { id: "platform", name: "平台" }].map(d => (
            <button key={d.id} onClick={() => setFilterDept(d.id)} className={`pill ${filterDept === d.id ? 'pill--indigo' : 'pill--neutral'}`} style={{ cursor: "pointer", border: "none" }}>{d.name}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", marginRight: 4 }}>范围</span>
          {[{ v: "all", label: "全部" }, ...SKILL_SCOPES].map(x => (
            <button key={x.v} onClick={() => setFilterScope(x.v)} className={`pill ${filterScope === x.v ? 'pill--indigo' : 'pill--neutral'}`} style={{ cursor: "pointer", border: "none" }}>{x.label}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", marginRight: 4 }}>状态</span>
          {[{ v: "all", label: "全部" }, ...SKILL_STATUSES].map(x => (
            <button key={x.v} onClick={() => setFilterStatus(x.v)} className={`pill ${filterStatus === x.v ? 'pill--indigo' : 'pill--neutral'}`} style={{ cursor: "pointer", border: "none" }}>{x.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3">
        {filtered.map(s => {
          const dept = Departments.find(d => d.id === s.dept);
          return (
            <SkillCard
              key={s.id} s={s} dept={dept}
              onEdit={() => setEditing({ ...s })}
              onDelete={() => setConfirm({ s })}
              onRun={() => setRunning(s)}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1", padding: 48, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
            没有匹配的 Skill — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>新增一个</a>
          </div>
        )}
      </div>

      {editing && (
        <SkillEditor
          skill={editing} departments={Departments.filter(d => !d.parentId)}
          onChange={setEditing} onClose={() => setEditing(null)} onSave={save}
        />
      )}
      {confirm && (
        <ConfirmModal
          title="删除 Skill Pack?"
          body={<>确认删除 <b>"{confirm.s.name}"</b>?所有引用该 Skill 的工作流将失效,操作进入审计日志。</>}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={del}
        />
      )}
      {running && <RunDialog kind="skill" item={running} deptId={running.dept} onClose={() => setRunning(null)} />}
    </div>
  );
}
