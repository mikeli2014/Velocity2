import React, { useState } from "react";
import {
  Icon, Progress, HealthPill, Modal, ConfirmModal, EmptyState,
  makeId, STATUS_OPTS, HEALTH_OPTS
} from "../components/primitives.jsx";
import { Objectives as SeedObjectives, Projects as SeedProjects, Decisions as SeedDecisions } from "../data/seed.js";

export function OkrPage() {
  const [tab, setTab] = useState("objectives");
  const [objectives, setObjectives] = useState(() => SeedObjectives.map(o => ({ ...o, krs: o.krs.map(k => ({ ...k })) })));
  const [projects, setProjects] = useState(() => SeedProjects.map(p => ({ ...p })));
  const [decisions, setDecisions] = useState(() => SeedDecisions.map(d => ({ ...d })));

  const [editingObj, setEditingObj] = useState(null);
  const [editingProj, setEditingProj] = useState(null);
  const [editingDec, setEditingDec] = useState(null);
  const [confirm, setConfirm] = useState(null);

  function rollupProgress(o) {
    if (!o.krs || !o.krs.length) return 0;
    return Math.round(o.krs.reduce((s, k) => s + Number(k.progress || 0), 0) / o.krs.length);
  }

  function saveObjective(next) {
    next.progress = rollupProgress(next);
    setObjectives(list => {
      const i = list.findIndex(o => o.id === next.id);
      if (i === -1) return [...list, next];
      const copy = list.slice(); copy[i] = next; return copy;
    });
    setEditingObj(null);
  }
  function deleteObjective(id) { setObjectives(list => list.filter(o => o.id !== id)); setConfirm(null); }
  function newObjective() {
    setEditingObj({
      id: makeId("obj"),
      code: `O${Math.max(...objectives.map(o => parseInt((o.code || "O0").slice(1)) || 0), 0) + 1}`,
      title: "", owner: "", quarter: "FY26", status: "on-track",
      progress: 0, krs: [], linkedProjects: [], __isNew: true
    });
  }

  function saveProject(next) {
    setProjects(list => {
      const i = list.findIndex(p => p.id === next.id);
      if (i === -1) return [...list, next];
      const copy = list.slice(); copy[i] = next; return copy;
    });
    setEditingProj(null);
  }
  function deleteProject(id) { setProjects(list => list.filter(p => p.id !== id)); setConfirm(null); }
  function newProject() {
    setEditingProj({
      id: makeId("proj"), name: "", health: "ok", progress: 0, owner: "", dept: "",
      okr: objectives[0]?.code || "O1", milestone: "", due: "2026-12-31", risks: 0, __isNew: true
    });
  }

  function saveDecision(next) {
    setDecisions(list => {
      const i = list.findIndex(d => d.id === next.id);
      if (i === -1) return [...list, next];
      const copy = list.slice(); copy[i] = next; return copy;
    });
    setEditingDec(null);
  }
  function deleteDecision(id) { setDecisions(list => list.filter(d => d.id !== id)); setConfirm(null); }
  function newDecision() {
    const today = new Date().toISOString().slice(0, 10);
    setEditingDec({ id: makeId("d"), title: "", date: today, owner: "", linkedKR: "kr-1-1", evidence: 0, __isNew: true });
  }

  const tabsCfg = [
    { id: "objectives", label: "公司 Objectives", count: objectives.length },
    { id: "projects", label: "关键项目组合", count: projects.length },
    { id: "alignment", label: "战略对齐图" },
    { id: "decisions", label: "决策日志", count: decisions.length }
  ];

  const headerAction = (() => {
    if (tab === "objectives") return <button className="btn btn--primary btn--sm" onClick={newObjective}><Icon.Plus size={14} /> 新增 Objective</button>;
    if (tab === "projects") return <button className="btn btn--primary btn--sm" onClick={newProject}><Icon.Plus size={14} /> 新增项目</button>;
    if (tab === "decisions") return <button className="btn btn--primary btn--sm" onClick={newDecision}><Icon.Plus size={14} /> 记录决策</button>;
    return null;
  })();

  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">OKR 与关键项目</div>
            <h1 className="page-head__title">目标与关键项目</h1>
            <p className="page-head__subtitle">公司级 Objective、Key Result、关键项目组合,以及战略对齐情况。这些会作为 AI 与部门助手的默认背景注入。</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.RefreshCw size={13} /> 周报生成</button>
            {headerAction}
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabsCfg.map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
          </div>
        ))}
      </div>

      {tab === "objectives" && (
        <div className="grid" style={{ gap: 14 }}>
          {objectives.length === 0 && <EmptyState label="还没有 Objective" cta="新增 Objective" onCta={newObjective} />}
          {objectives.map(o => (
            <ObjectiveCard
              key={o.id} o={o}
              onEdit={() => setEditingObj({ ...o, krs: o.krs.map(k => ({ ...k })), linkedProjects: [...(o.linkedProjects || [])] })}
              onDelete={() => setConfirm({
                title: `删除 ${o.code}?`,
                body: <>将永久删除 Objective <b>{o.title}</b> 及其 <b>{o.krs.length}</b> 个 KR。</>,
                onConfirm: () => deleteObjective(o.id)
              })}
              onUpdateKR={(krId, patch) => {
                setObjectives(list => list.map(x => {
                  if (x.id !== o.id) return x;
                  const krs = x.krs.map(k => k.id === krId ? { ...k, ...patch } : k);
                  const next = { ...x, krs };
                  next.progress = rollupProgress(next);
                  return next;
                }));
              }}
            />
          ))}
        </div>
      )}

      {tab === "projects" && (
        <ProjectsTable
          projects={projects}
          onEdit={p => setEditingProj({ ...p })}
          onDelete={p => setConfirm({
            title: "删除关键项目?",
            body: <>将从组合中移除 <b>"{p.name}"</b>。已记录的决策与对齐图引用不会被自动清理。</>,
            onConfirm: () => deleteProject(p.id)
          })}
          onNew={newProject}
        />
      )}

      {tab === "alignment" && <AlignmentMap objectives={objectives} projects={projects} />}

      {tab === "decisions" && (
        <DecisionLog
          decisions={decisions}
          onEdit={d => setEditingDec({ ...d })}
          onDelete={d => setConfirm({
            title: "删除决策记录?",
            body: <>该条决策日志将被移除,关联的 KR 不受影响。</>,
            onConfirm: () => deleteDecision(d.id)
          })}
          onNew={newDecision}
        />
      )}

      {editingObj && (
        <ObjectiveEditor objective={editingObj} onChange={setEditingObj} onClose={() => setEditingObj(null)} onSave={() => saveObjective(editingObj)} />
      )}
      {editingProj && (
        <ProjectEditor project={editingProj} objectives={objectives} onChange={setEditingProj} onClose={() => setEditingProj(null)} onSave={() => saveProject(editingProj)} />
      )}
      {editingDec && (
        <DecisionEditor decision={editingDec} objectives={objectives} onChange={setEditingDec} onClose={() => setEditingDec(null)} onSave={() => saveDecision(editingDec)} />
      )}
      {confirm && (
        <ConfirmModal title={confirm.title} body={confirm.body} danger onCancel={() => setConfirm(null)} onConfirm={confirm.onConfirm} />
      )}
    </div>
  );
}

function ObjectiveCard({ o, onEdit, onDelete, onUpdateKR }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--vel-indigo-50)", color: "var(--vel-indigo-700)", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 16, fontFamily: "var(--font-mono)" }}>{o.code}</div>
        <div style={{ flex: 1 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg1)" }}>{o.title || <span style={{ color: "var(--fg4)", fontWeight: 500 }}>未命名 Objective</span>}</div>
            <div className="row" style={{ gap: 8 }}>
              <HealthPill status={o.status} />
              <div className="row-actions">
                <button className="icon-btn" title="编辑" onClick={onEdit}><Icon.Edit size={14} /></button>
                <button className="icon-btn icon-btn--danger" title="删除" onClick={onDelete}><Icon.Trash size={14} /></button>
              </div>
            </div>
          </div>
          <div className="row" style={{ gap: 14, fontSize: 12, color: "var(--fg3)" }}>
            <span>{o.owner || "未指派"}</span>
            <span>·</span>
            <span>{o.quarter}</span>
            <span>·</span>
            <span>{(o.linkedProjects || []).length} 关键项目</span>
            <span>·</span>
            <span>{o.krs.length} KR</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 28, fontWeight: 800, color: "var(--fg1)", lineHeight: 1 }}>{o.progress}<span style={{ fontSize: 14, color: "var(--fg3)" }}>%</span></div>
          <div style={{ fontSize: 11, color: "var(--fg3)" }}>OKR 进度</div>
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {o.krs.length === 0 && (
          <div style={{ padding: "10px 12px", background: "var(--slate-50)", borderRadius: 8, fontSize: 12, color: "var(--fg4)", textAlign: "center" }}>
            尚未定义 Key Result — 点击右上 <Icon.Edit size={11} style={{ verticalAlign: "-2px" }} /> 编辑添加
          </div>
        )}
        {o.krs.map(kr => (
          <div key={kr.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr 110px 90px 130px 60px", gap: 12, alignItems: "center", padding: "8px 12px", background: "var(--slate-50)", borderRadius: 8 }}>
            <Icon.Hash size={14} style={{ color: "var(--fg4)" }} />
            <div style={{ fontSize: 13, color: "var(--fg2)" }}>{kr.title}</div>
            <div style={{ fontSize: 11, color: "var(--fg3)" }}>目标 <strong className="num" style={{ color: "var(--fg1)" }}>{kr.target}</strong></div>
            <div style={{ fontSize: 11, color: "var(--fg3)" }}>当前 <strong className="num" style={{ color: "var(--fg1)" }}>{kr.current}</strong></div>
            <input
              type="range" min="0" max="100" value={kr.progress}
              onChange={e => onUpdateKR(kr.id, { progress: Number(e.target.value), status: Number(e.target.value) >= 100 ? "achieved" : kr.status })}
              style={{ width: "100%" }}
              title="拖动调整进度"
            />
            <span className="num" style={{ fontSize: 12, color: "var(--fg2)", textAlign: "right" }}>{kr.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectiveEditor({ objective: o, onChange, onClose, onSave }) {
  function set(k, v) { onChange({ ...o, [k]: v }); }
  function setKR(idx, patch) {
    const krs = o.krs.slice(); krs[idx] = { ...krs[idx], ...patch }; onChange({ ...o, krs });
  }
  function addKR() {
    const krs = [...o.krs, { id: makeId("kr"), title: "", target: "", current: "", progress: 0, status: "on-track" }];
    onChange({ ...o, krs });
  }
  function delKR(idx) {
    const krs = o.krs.filter((_, i) => i !== idx); onChange({ ...o, krs });
  }

  const valid = o.title.trim().length > 0;

  return (
    <Modal
      title={o.__isNew ? "新增 Objective" : `编辑 ${o.code}`}
      sub="Objective 与 Key Result 会作为公司级背景注入到所有 AI 助手与战略画布。"
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" disabled={!valid} onClick={onSave} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
          <Icon.Save size={13} /> 保存
        </button>
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 140px", gap: 12 }}>
        <div className="field">
          <label className="field__label">编号</label>
          <input className="input" value={o.code} onChange={e => set("code", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">标题 *</label>
          <input className="input" value={o.title} onChange={e => set("title", e.target.value)} placeholder="例如:成为全屋净水方案的市场领跑者" />
        </div>
        <div className="field">
          <label className="field__label">状态</label>
          <select className="select" value={o.status} onChange={e => set("status", e.target.value)}>
            {STATUS_OPTS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">负责人</label>
          <input className="input" value={o.owner} onChange={e => set("owner", e.target.value)} placeholder="李慕白" />
        </div>
        <div className="field">
          <label className="field__label">周期</label>
          <input className="input" value={o.quarter} onChange={e => set("quarter", e.target.value)} placeholder="FY26 Q1-Q4" />
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14, marginTop: 4 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Key Results ({o.krs.length})</div>
          <button className="btn btn--ghost btn--sm" onClick={addKR}><Icon.Plus size={13} /> 新增 KR</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {o.krs.map((kr, i) => (
            <div key={kr.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 90px 28px", gap: 8, alignItems: "center", padding: 10, background: "var(--slate-50)", borderRadius: 8 }}>
              <input className="input" placeholder="KR 标题" value={kr.title} onChange={e => setKR(i, { title: e.target.value })} />
              <input className="input" placeholder="目标" value={kr.target} onChange={e => setKR(i, { target: e.target.value })} />
              <input className="input" placeholder="当前" value={kr.current} onChange={e => setKR(i, { current: e.target.value })} />
              <input className="input num" type="number" min="0" max="100" value={kr.progress} onChange={e => setKR(i, { progress: Number(e.target.value) })} />
              <button className="icon-btn icon-btn--danger" onClick={() => delKR(i)}><Icon.Trash size={13} /></button>
            </div>
          ))}
          {o.krs.length === 0 && <div style={{ padding: 14, textAlign: "center", fontSize: 12, color: "var(--fg4)" }}>尚未添加任何 KR</div>}
        </div>
      </div>
    </Modal>
  );
}

function ProjectsTable({ projects, onEdit, onDelete, onNew }) {
  return (
    <div className="card">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead style={{ background: "var(--slate-50)" }}>
          <tr style={{ textAlign: "left" }}>
            {["健康", "项目", "OKR", "负责人", "部门", "里程碑", "进度", "风险", "截止", ""].map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", fontWeight: 600, fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border-soft)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <td style={{ padding: "12px 14px" }}><span className={`dot dot--${p.health}`} /></td>
              <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--fg1)" }}>{p.name}</td>
              <td style={{ padding: "12px 14px" }}><span className="pill pill--indigo num">{p.okr}</span></td>
              <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{p.owner}</td>
              <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{p.dept}</td>
              <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{p.milestone}</td>
              <td style={{ padding: "12px 14px", width: 160 }}>
                <div className="row" style={{ gap: 8 }}>
                  <div style={{ flex: 1 }}><Progress value={p.progress} status={p.health} /></div>
                  <span className="num" style={{ fontSize: 11, color: "var(--fg2)", width: 28 }}>{p.progress}%</span>
                </div>
              </td>
              <td style={{ padding: "12px 14px" }}>
                {p.risks > 0 ? <span className={`pill ${p.risks > 3 ? 'pill--danger' : 'pill--warn'}`}>⚠ {p.risks}</span> : <span style={{ color: "var(--fg4)", fontSize: 11 }}>—</span>}
              </td>
              <td style={{ padding: "12px 14px", color: "var(--fg3)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{p.due}</td>
              <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                <div className="row-actions">
                  <button className="icon-btn" title="编辑" onClick={() => onEdit(p)}><Icon.Edit size={14} /></button>
                  <button className="icon-btn icon-btn--danger" title="删除" onClick={() => onDelete(p)}><Icon.Trash size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
              暂无关键项目 — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>新增一个</a>
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectEditor({ project: p, objectives, onChange, onClose, onSave }) {
  function set(k, v) { onChange({ ...p, [k]: v }); }
  const valid = p.name.trim().length > 0;
  return (
    <Modal
      title={p.__isNew ? "新增关键项目" : "编辑关键项目"}
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" disabled={!valid} onClick={onSave} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
          <Icon.Save size={13} /> 保存
        </button>
      </>}
    >
      <div className="field">
        <label className="field__label">项目名称 *</label>
        <input className="input" value={p.name} onChange={e => set("name", e.target.value)} placeholder="例如:全屋净水 2.0 — 局改方案产品化" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">负责人</label>
          <input className="input" value={p.owner} onChange={e => set("owner", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">部门</label>
          <input className="input" value={p.dept} onChange={e => set("dept", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">关联 OKR</label>
          <select className="select" value={p.okr} onChange={e => set("okr", e.target.value)}>
            {objectives.map(o => <option key={o.id} value={o.code}>{o.code} — {o.title.slice(0, 18)}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">里程碑</label>
          <input className="input" value={p.milestone} onChange={e => set("milestone", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">截止日期</label>
          <input className="input" type="date" value={p.due} onChange={e => set("due", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">健康度</label>
          <select className="select" value={p.health} onChange={e => set("health", e.target.value)}>
            {HEALTH_OPTS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label">进度 ({p.progress}%)</label>
          <input type="range" min="0" max="100" value={p.progress} onChange={e => set("progress", Number(e.target.value))} />
        </div>
        <div className="field">
          <label className="field__label">风险数</label>
          <input className="input num" type="number" min="0" value={p.risks} onChange={e => set("risks", Number(e.target.value))} />
        </div>
      </div>
    </Modal>
  );
}

function AlignmentMap({ objectives, projects }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="card__title" style={{ marginBottom: 16 }}>
        <Icon.GitBranch size={14} style={{ color: "var(--vel-indigo)" }} /> 公司 → 部门 → 关键项目对齐图
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 10 }}>公司 Objectives</div>
          {objectives.map(o => (
            <div key={o.id} style={{ padding: "10px 12px", background: "var(--vel-indigo-50)", border: "1px solid var(--vel-indigo-100)", borderRadius: 8, marginBottom: 8 }}>
              <div className="row" style={{ gap: 8 }}>
                <span className="num" style={{ fontWeight: 800, color: "var(--vel-indigo-700)" }}>{o.code}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{(o.title || "未命名").split("—")[0]}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 10 }}>部门 Objectives</div>
          {[
            { code: "ID-O1", title: "局改方案产品化落地" },
            { code: "ID-O2", title: "CMF 中台 Phase 2" },
            { code: "COP-O1", title: "200 城三角协同" },
            { code: "SVC-O1", title: "县域服务网络" },
            { code: "IT-O1", title: "Velocity 全员推广" }
          ].map(d => (
            <div key={d.code} style={{ padding: "10px 12px", background: "#fff", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8 }}>
              <div className="row" style={{ gap: 8 }}>
                <span className="num" style={{ fontWeight: 700, fontSize: 11, color: "var(--fg2)" }}>{d.code}</span>
                <span style={{ fontSize: 12, color: "var(--fg1)" }}>{d.title}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 10 }}>关键项目</div>
          {projects.slice(0, 5).map(p => (
            <div key={p.id} style={{ padding: "10px 12px", background: "#fff", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`dot dot--${p.health}`} />
              <span style={{ fontSize: 12, color: "var(--fg1)", flex: 1 }}>{p.name}</span>
              <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{p.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DecisionLog({ decisions, onEdit, onDelete, onNew }) {
  return (
    <div className="card">
      {decisions.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
          暂无决策记录 — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>记录第一条</a>
        </div>
      )}
      {decisions.map((d, i) => (
        <div key={d.id} style={{ padding: 18, borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <div className="row" style={{ gap: 10 }}>
              <Icon.Quote size={16} style={{ color: "var(--vel-indigo)" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{d.title || <span style={{ color: "var(--fg4)", fontWeight: 500 }}>未命名决策</span>}</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="pill pill--indigo">关联 {d.linkedKR}</span>
              <div className="row-actions">
                <button className="icon-btn" title="编辑" onClick={() => onEdit(d)}><Icon.Edit size={13} /></button>
                <button className="icon-btn icon-btn--danger" title="删除" onClick={() => onDelete(d)}><Icon.Trash size={13} /></button>
              </div>
            </div>
          </div>
          <div className="row" style={{ gap: 14, fontSize: 12, color: "var(--fg3)", marginLeft: 26 }}>
            <span><Icon.User size={11} style={{ verticalAlign: "-2px" }} /> {d.owner}</span>
            <span><Icon.Calendar size={11} style={{ verticalAlign: "-2px" }} /> {d.date}</span>
            <span><Icon.FileText size={11} style={{ verticalAlign: "-2px" }} /> {d.evidence} 条证据</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionEditor({ decision: d, objectives, onChange, onClose, onSave }) {
  function set(k, v) { onChange({ ...d, [k]: v }); }
  const allKRs = objectives.flatMap(o => o.krs.map(k => ({ id: k.id, label: `${o.code} · ${k.title || k.id}` })));
  const valid = d.title.trim().length > 0;
  return (
    <Modal
      title={d.__isNew ? "记录决策" : "编辑决策"}
      sub="决策日志会进入'公司知识中心',作为可追溯的策略历史。"
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" disabled={!valid} onClick={onSave} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
          <Icon.Save size={13} /> 保存
        </button>
      </>}
    >
      <div className="field">
        <label className="field__label">决策内容 *</label>
        <textarea className="textarea" value={d.title} onChange={e => set("title", e.target.value)} placeholder="例如:全屋净水 2.0 产品定位收敛为'局改焕新'" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">决策人</label>
          <input className="input" value={d.owner} onChange={e => set("owner", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">日期</label>
          <input className="input" type="date" value={d.date} onChange={e => set("date", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
        <div className="field">
          <label className="field__label">关联 KR</label>
          <select className="select" value={d.linkedKR} onChange={e => set("linkedKR", e.target.value)}>
            {allKRs.length === 0 && <option value="">— 无可选 KR —</option>}
            {allKRs.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label">证据条数</label>
          <input className="input num" type="number" min="0" value={d.evidence} onChange={e => set("evidence", Number(e.target.value))} />
        </div>
      </div>
    </Modal>
  );
}
