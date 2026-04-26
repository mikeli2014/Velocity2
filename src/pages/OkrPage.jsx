import React, { useState } from "react";
import {
  Icon, Progress, HealthPill, Modal, ConfirmModal, EmptyState,
  makeId, STATUS_OPTS, HEALTH_OPTS
} from "../components/primitives.jsx";
import { ProjectDetail } from "../components/ProjectDetail.jsx";
import {
  Objectives as SeedObjectives,
  Projects as SeedProjects,
  DecisionsRich as SeedDecisions,
  DECISION_STATUSES,
  KnowledgeSources,
  Agents,
  StrategyQuestions,
  KRCheckIns as SeedCheckIns
} from "../data/seed.js";

export function OkrPage() {
  const [tab, setTab] = useState("objectives");
  const [objectives, setObjectives] = useState(() => SeedObjectives.map(o => ({ ...o, krs: o.krs.map(k => ({ ...k })) })));
  const [projects, setProjects] = useState(() => SeedProjects.map(p => ({ ...p })));
  const [decisions, setDecisions] = useState(() => SeedDecisions.map(d => ({ ...d })));

  const [editingObj, setEditingObj] = useState(null);
  const [editingProj, setEditingProj] = useState(null);
  const [editingDec, setEditingDec] = useState(null);
  const [viewingDec, setViewingDec] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [viewingProj, setViewingProj] = useState(null);
  const [checkIns, setCheckIns] = useState(() => SeedCheckIns.map(c => ({ ...c })));
  const [checkInKR, setCheckInKR] = useState(null);

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
    setEditingDec({
      id: makeId("d"),
      title: "", question: "", conclusion: "",
      date: today, owner: "", status: "decided",
      linkedKR: "", linkedQuestion: "",
      assumptions: [], dissent: [], evidenceSources: [], retrospective: "",
      __isNew: true
    });
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
              checkIns={checkIns}
              onCheckIn={(kr) => setCheckInKR({ kr, obj: o })}
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
          onView={p => setViewingProj(p)}
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
          onView={d => setViewingDec(d)}
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
      {viewingProj && (
        <ProjectDetail
          project={viewingProj}
          onClose={() => setViewingProj(null)}
          onEdit={p => { setViewingProj(null); setEditingProj({ ...p }); }}
        />
      )}
      {viewingDec && (
        <DecisionDetail
          decision={viewingDec}
          onClose={() => setViewingDec(null)}
          onEdit={d => { setViewingDec(null); setEditingDec({ ...d }); }}
        />
      )}
      {checkInKR && (
        <KRCheckInDialog
          ctx={checkInKR}
          checkIns={checkIns.filter(c => c.krId === checkInKR.kr.id)}
          onClose={() => setCheckInKR(null)}
          onSubmit={(entry) => {
            setCheckIns(prev => [entry, ...prev]);
            setObjectives(list => list.map(x => {
              if (x.id !== checkInKR.obj.id) return x;
              const krs = x.krs.map(k => k.id === checkInKR.kr.id
                ? { ...k, progress: entry.progress, current: entry.current || k.current, status: entry.progress >= 100 ? "achieved" : k.status }
                : k);
              const next = { ...x, krs };
              next.progress = rollupProgress(next);
              return next;
            }));
            setCheckInKR(null);
          }}
        />
      )}
    </div>
  );
}

function KRCheckInDialog({ ctx, checkIns, onClose, onSubmit }) {
  const { kr, obj } = ctx;
  const [progress, setProgress] = useState(kr.progress);
  const [current, setCurrent] = useState(kr.current || "");
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState(obj.owner ? obj.owner.split("·")[0].trim() : "");
  const valid = note.trim().length > 0;

  function submit() {
    onSubmit({
      id: makeId("ci"),
      krId: kr.id,
      date: new Date().toISOString().slice(0, 10),
      author: author.trim() || "—",
      progress,
      current: current.trim() || kr.current,
      note: note.trim()
    });
  }

  return (
    <Modal
      title={`Check-in · ${obj.code} / ${kr.title}`}
      sub="Check-in 形成 KR 的执行轨迹,可被 AI 助手与战略画布引用,提升决策可追溯率。"
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" disabled={!valid} onClick={submit} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
          <Icon.Save size={13} /> 保存 Check-in
        </button>
      </>}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="pill pill--indigo num">{obj.code}</span>
        <span className="pill pill--neutral">目标 {kr.target}</span>
        <span className="pill pill--neutral">当前 {kr.current}</span>
        <span className="pill pill--neutral">{kr.progress}% 进度</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">本次 Check-in 进度 ({progress}%)</label>
          <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} />
        </div>
        <div className="field">
          <label className="field__label">当前实际值</label>
          <input className="input" value={current} onChange={e => setCurrent(e.target.value)} placeholder={kr.current} />
        </div>
        <div className="field">
          <label className="field__label">提交人</label>
          <input className="input" value={author} onChange={e => setAuthor(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label className="field__label">说明 *</label>
        <textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="本次 check-in 的关键变化、风险或后续动作。" />
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <Icon.Activity size={14} style={{ color: "var(--vel-indigo)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>历史 Check-in ({checkIns.length})</div>
        </div>
        <KRSparkline checkIns={checkIns} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {checkIns.length === 0 && <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "var(--fg4)", background: "var(--slate-50)", borderRadius: 8 }}>暂无历史记录,这将是首次 Check-in</div>}
          {checkIns.map(c => (
            <div key={c.id} style={{ padding: "10px 12px", background: "var(--slate-50)", border: "1px solid var(--border-soft)", borderRadius: 8 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{c.date}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{c.author}</span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{c.current}</span>
                  <span className="pill pill--info num">{c.progress}%</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.5 }}>{c.note}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function KRSparkline({ checkIns }) {
  if (!checkIns || checkIns.length === 0) return null;
  // checkIns are newest-first; reverse for chronological plot
  const data = checkIns.slice().reverse();
  const w = 720, h = 60;
  const xs = data.map((_, i) => (i / Math.max(1, data.length - 1)) * (w - 16) + 8);
  const ys = data.map(d => h - 8 - (d.progress / 100) * (h - 16));
  const points = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  return (
    <div style={{ background: "var(--slate-50)", borderRadius: 8, padding: 8 }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: h }}>
        <polyline points={points} fill="none" stroke="var(--vel-indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.id}>
            <circle cx={xs[i]} cy={ys[i]} r="3.5" fill="var(--vel-indigo)" />
            <text x={xs[i]} y={ys[i] - 8} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="var(--fg3)">{d.progress}%</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ObjectiveCard({ o, onEdit, onDelete, onUpdateKR, onCheckIn, checkIns = [] }) {
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
        {o.krs.map(kr => {
          const krChecks = checkIns.filter(c => c.krId === kr.id);
          const last = krChecks[0];
          return (
            <div key={kr.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr 110px 90px 130px 60px 28px", gap: 12, alignItems: "center", padding: "8px 12px", background: "var(--slate-50)", borderRadius: 8 }}>
              <Icon.Hash size={14} style={{ color: "var(--fg4)" }} />
              <div>
                <div style={{ fontSize: 13, color: "var(--fg2)" }}>{kr.title}</div>
                {last && <div style={{ fontSize: 10, color: "var(--fg4)", marginTop: 2 }}>最近 check-in · {last.date} · {last.author}{krChecks.length > 1 ? ` · 共 ${krChecks.length} 次` : ""}</div>}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg3)" }}>目标 <strong className="num" style={{ color: "var(--fg1)" }}>{kr.target}</strong></div>
              <div style={{ fontSize: 11, color: "var(--fg3)" }}>当前 <strong className="num" style={{ color: "var(--fg1)" }}>{kr.current}</strong></div>
              <input
                type="range" min="0" max="100" value={kr.progress}
                onChange={e => onUpdateKR(kr.id, { progress: Number(e.target.value), status: Number(e.target.value) >= 100 ? "achieved" : kr.status })}
                style={{ width: "100%" }}
                title="拖动调整进度"
              />
              <span className="num" style={{ fontSize: 12, color: "var(--fg2)", textAlign: "right" }}>{kr.progress}%</span>
              <button className="icon-btn" title="Check-in" onClick={() => onCheckIn && onCheckIn(kr)}><Icon.RefreshCw size={13} /></button>
            </div>
          );
        })}
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

function ProjectsTable({ projects, onView, onEdit, onDelete, onNew }) {
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
              <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--fg1)" }}>
                <a onClick={() => onView && onView(p)} style={{ cursor: "pointer", color: "var(--fg1)" }} title="查看项目详情">{p.name}</a>
              </td>
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
                  <button className="icon-btn" title="详情" onClick={() => onView && onView(p)}><Icon.Eye size={14} /></button>
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

  // Milestones
  const milestones = p.milestones || [];
  function setMilestone(i, patch) {
    const next = milestones.slice(); next[i] = { ...next[i], ...patch }; set("milestones", next);
  }
  function addMilestone() {
    set("milestones", [...milestones, { id: makeId("m"), name: "", date: "", status: "todo" }]);
  }
  function delMilestone(i) {
    set("milestones", milestones.filter((_, j) => j !== i));
  }

  // Risks
  const risks = p.risksDetail || [];
  function setRisk(i, patch) {
    const next = risks.slice(); next[i] = { ...next[i], ...patch }; set("risksDetail", next);
  }
  function addRisk() {
    set("risksDetail", [...risks, { id: makeId("r"), text: "", level: "warn", owner: "" }]);
  }
  function delRisk(i) {
    set("risksDetail", risks.filter((_, j) => j !== i));
  }

  // Contributors (free-text chip list)
  const contributors = p.contributors || [];
  const [contribDraft, setContribDraft] = React.useState("");
  function addContrib() {
    const v = contribDraft.trim();
    if (!v || contributors.includes(v)) { setContribDraft(""); return; }
    set("contributors", [...contributors, v]); setContribDraft("");
  }
  function delContrib(name) {
    set("contributors", contributors.filter(c => c !== name));
  }

  // Auto-rollup risks count from risksDetail (so the table badge stays in sync)
  React.useEffect(() => {
    if (risks.length !== p.risks) set("risks", risks.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risks.length]);

  return (
    <Modal
      title={p.__isNew ? "新增关键项目" : "编辑关键项目"}
      sub="项目编辑覆盖里程碑 / 风险 / 参与人。详情视图会同步显示。"
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
        <label className="field__label">项目名称 *</label>
        <input className="input" value={p.name} onChange={e => set("name", e.target.value)} placeholder="例如:全屋净水 2.0 — 局改方案产品化" />
      </div>
      <div className="field">
        <label className="field__label">项目描述</label>
        <textarea className="textarea" value={p.description || ""} onChange={e => set("description", e.target.value)} placeholder="一句话描述项目目标 / 用户场景 / 核心交付。" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">负责人</label>
          <input className="input" value={p.owner || ""} onChange={e => set("owner", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">部门</label>
          <input className="input" value={p.dept || ""} onChange={e => set("dept", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">关联 OKR</label>
          <select className="select" value={p.okr} onChange={e => set("okr", e.target.value)}>
            {objectives.map(o => <option key={o.id} value={o.code}>{o.code} — {o.title.slice(0, 18)}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">当前里程碑</label>
          <input className="input" value={p.milestone || ""} onChange={e => set("milestone", e.target.value)} placeholder="例如:样机评审" />
        </div>
        <div className="field">
          <label className="field__label">启动日期</label>
          <input className="input" type="date" value={p.started || ""} onChange={e => set("started", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">截止日期</label>
          <input className="input" type="date" value={p.due} onChange={e => set("due", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
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
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <Icon.Calendar size={14} style={{ color: "var(--vel-indigo)" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>里程碑 ({milestones.length})</div>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={addMilestone}><Icon.Plus size={12} /> 添加</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {milestones.map((m, i) => (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1fr 130px 110px 28px", gap: 8, alignItems: "center" }}>
              <input className="input" value={m.name} onChange={e => setMilestone(i, { name: e.target.value })} placeholder="里程碑名称" />
              <input className="input" type="date" value={m.date || ""} onChange={e => setMilestone(i, { date: e.target.value })} />
              <select className="select" value={m.status} onChange={e => setMilestone(i, { status: e.target.value })}>
                <option value="todo">未开始</option>
                <option value="in-progress">进行中</option>
                <option value="achieved">已完成</option>
              </select>
              <button className="icon-btn icon-btn--danger" onClick={() => delMilestone(i)}><Icon.Trash size={13} /></button>
            </div>
          ))}
          {milestones.length === 0 && <div style={{ fontSize: 12, color: "var(--fg4)", padding: "8px 0" }}>尚未添加里程碑</div>}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <Icon.AlertTriangle size={14} style={{ color: "var(--warning)" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>风险登记 ({risks.length})</div>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={addRisk}><Icon.Plus size={12} /> 添加</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {risks.map((r, i) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 130px 28px", gap: 8, alignItems: "center" }}>
              <input className="input" value={r.text} onChange={e => setRisk(i, { text: e.target.value })} placeholder="风险描述" />
              <select className="select" value={r.level} onChange={e => setRisk(i, { level: e.target.value })}>
                <option value="info">信息</option>
                <option value="warn">中</option>
                <option value="danger">高</option>
              </select>
              <input className="input" value={r.owner || ""} onChange={e => setRisk(i, { owner: e.target.value })} placeholder="负责人" />
              <button className="icon-btn icon-btn--danger" onClick={() => delRisk(i)}><Icon.Trash size={13} /></button>
            </div>
          ))}
          {risks.length === 0 && <div style={{ fontSize: 12, color: "var(--fg4)", padding: "8px 0" }}>无登记风险</div>}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <Icon.Users size={14} style={{ color: "var(--vel-violet)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>参与人 ({contributors.length})</div>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {contributors.map(c => (
            <span key={c} className="pill pill--neutral" style={{ paddingRight: 4 }}>
              <Icon.User size={11} /> {c}
              <button className="icon-btn" style={{ width: 20, height: 20 }} onClick={() => delContrib(c)} title="移除"><Icon.X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input"
            value={contribDraft}
            onChange={e => setContribDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addContrib(); } }}
            placeholder="输入姓名后回车添加"
          />
          <button className="btn btn--ghost btn--sm" onClick={addContrib}><Icon.Plus size={12} /> 添加</button>
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

function DecisionLog({ decisions, onEdit, onDelete, onNew, onView }) {
  const grouped = DECISION_STATUSES.map(s => ({ ...s, items: decisions.filter(d => (d.status || "decided") === s.v) })).filter(g => g.items.length > 0);
  return (
    <div>
      {decisions.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
          暂无决策记录 — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>记录第一条</a>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {grouped.map(g => (
          <div key={g.v}>
            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: g.color }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{g.label}</div>
              <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{g.items.length}</span>
            </div>
            <div className="card">
              {g.items.map((d, i) => {
                const evidenceCount = (d.evidenceSources || []).length || d.evidence || 0;
                const dissentCount = (d.dissent || []).length;
                const assumptionsCount = (d.assumptions || []).length;
                return (
                  <div key={d.id} style={{ padding: 16, borderTop: i ? "1px solid var(--border-soft)" : "none", cursor: "pointer" }} onClick={() => onView(d)}>
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 6, gap: 10 }}>
                      <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
                        <Icon.Quote size={16} style={{ color: "var(--vel-indigo)", flexShrink: 0 }} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{d.title || <span style={{ color: "var(--fg4)", fontWeight: 500 }}>未命名决策</span>}</div>
                      </div>
                      <div className="row" style={{ gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        {d.linkedKR && <span className="pill pill--indigo">关联 {d.linkedKR}</span>}
                        <div className="row-actions">
                          <button className="icon-btn" title="详情" onClick={() => onView(d)}><Icon.Eye size={13} /></button>
                          <button className="icon-btn" title="编辑" onClick={() => onEdit(d)}><Icon.Edit size={13} /></button>
                          <button className="icon-btn icon-btn--danger" title="删除" onClick={() => onDelete(d)}><Icon.Trash size={13} /></button>
                        </div>
                      </div>
                    </div>
                    {d.conclusion && (
                      <div style={{ fontSize: 12.5, color: "var(--fg2)", lineHeight: 1.55, marginLeft: 26, marginBottom: 6 }}>{d.conclusion}</div>
                    )}
                    <div className="row" style={{ gap: 14, fontSize: 11, color: "var(--fg3)", marginLeft: 26, flexWrap: "wrap" }}>
                      <span><Icon.User size={11} style={{ verticalAlign: "-2px" }} /> {d.owner}</span>
                      <span><Icon.Calendar size={11} style={{ verticalAlign: "-2px" }} /> {d.date}</span>
                      <span><Icon.FileText size={11} style={{ verticalAlign: "-2px" }} /> {evidenceCount} 条证据</span>
                      {assumptionsCount > 0 && <span><Icon.Hash size={11} style={{ verticalAlign: "-2px" }} /> {assumptionsCount} 个关键假设</span>}
                      {dissentCount > 0 && <span style={{ color: "var(--warning-text)" }}><Icon.AlertTriangle size={11} style={{ verticalAlign: "-2px" }} /> {dissentCount} 条反对意见</span>}
                      {d.retrospective && <span style={{ color: "var(--vel-violet)" }}><Icon.RefreshCw size={11} style={{ verticalAlign: "-2px" }} /> 已复盘</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionDetail({ decision: d, onClose, onEdit }) {
  if (!d) return null;
  const evidence = (d.evidenceSources || []).map(id => KnowledgeSources.find(s => s.id === id)).filter(Boolean);
  const status = DECISION_STATUSES.find(s => s.v === (d.status || "decided")) || DECISION_STATUSES[0];
  const linkedQuestion = d.linkedQuestion ? StrategyQuestions.find(q => q.id === d.linkedQuestion) : null;

  return (
    <Modal
      title={d.title}
      sub={`${d.owner || "—"} · ${d.date || "—"}`}
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>关闭</button>
        <button className="btn btn--primary btn--sm" onClick={() => onEdit(d)}><Icon.Edit size={13} /> 编辑决策</button>
      </>}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="pill" style={{ background: status.color + "20", color: status.color, fontWeight: 600 }}>{status.label}</span>
        {d.linkedKR && <span className="pill pill--indigo">关联 {d.linkedKR}</span>}
        {linkedQuestion && <span className="pill pill--info"><Icon.Compass size={10} /> 来自 {linkedQuestion.title}</span>}
      </div>

      {d.question && (
        <Block icon={<Icon.AtSign size={14} style={{ color: "var(--vel-indigo)" }} />} label="决策问题">
          <div style={{ fontSize: 13, color: "var(--fg1)", lineHeight: 1.6 }}>{d.question}</div>
        </Block>
      )}
      {d.conclusion && (
        <Block icon={<Icon.Check size={14} style={{ color: "var(--success)" }} />} label="结论">
          <div style={{ fontSize: 13, color: "var(--fg1)", lineHeight: 1.6, padding: "10px 12px", background: "#DCFCE7", borderRadius: 8 }}>{d.conclusion}</div>
        </Block>
      )}
      {(d.assumptions || []).length > 0 && (
        <Block icon={<Icon.Hash size={14} style={{ color: "var(--vel-indigo)" }} />} label={`关键假设 (${d.assumptions.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {d.assumptions.map((a, i) => (
              <div key={i} style={{ padding: "8px 12px", background: "var(--vel-indigo-50)", border: "1px solid var(--vel-indigo-100)", borderRadius: 8, fontSize: 13, color: "var(--fg1)", lineHeight: 1.5 }}>
                <span className="num" style={{ color: "var(--vel-indigo-700)", fontWeight: 800, marginRight: 8 }}>A{i + 1}</span>{a}
              </div>
            ))}
          </div>
        </Block>
      )}
      {(d.dissent || []).length > 0 && (
        <Block icon={<Icon.AlertTriangle size={14} style={{ color: "var(--warning)" }} />} label={`反对 / 保留意见 (${d.dissent.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {d.dissent.map((c, i) => {
              const ag = Agents.find(a => a.id === c.agent);
              return (
                <div key={i} style={{ padding: "10px 12px", border: "1px solid var(--border-soft)", borderLeft: "3px solid var(--warning)", borderRadius: 8 }}>
                  {ag && (
                    <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                      <span className="pill" style={{ background: ag.color.startsWith("var(") ? "rgba(245,158,11,0.18)" : ag.color + "20", color: ag.color.startsWith("var(") ? "var(--warning-text)" : ag.color, fontWeight: 600 }}>{ag.name}</span>
                      <span style={{ fontSize: 11, color: "var(--fg3)" }}>{ag.role}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "var(--fg1)", lineHeight: 1.5 }}>{c.text}</div>
                </div>
              );
            })}
          </div>
        </Block>
      )}
      {evidence.length > 0 && (
        <Block icon={<Icon.FileText size={14} style={{ color: "var(--success)" }} />} label={`证据来源 (${evidence.length})`}>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {evidence.map(s => (
              <span key={s.id} className="pill pill--indigo">
                <Icon.FileText size={11} /> {s.title}
              </span>
            ))}
          </div>
        </Block>
      )}
      {d.retrospective && (
        <Block icon={<Icon.RefreshCw size={14} style={{ color: "var(--vel-violet)" }} />} label="复盘">
          <div style={{ fontSize: 13, color: "var(--fg1)", lineHeight: 1.6, padding: "10px 12px", background: "#F5F3FF", borderRadius: 8 }}>{d.retrospective}</div>
        </Block>
      )}
    </Modal>
  );
}

function Block({ icon, label, children }) {
  return (
    <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
      <div className="row" style={{ gap: 8, marginBottom: 10 }}>
        {icon}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      </div>
      {children}
    </div>
  );
}

function DecisionEditor({ decision: d, objectives, onChange, onClose, onSave }) {
  function set(k, v) { onChange({ ...d, [k]: v }); }
  const allKRs = objectives.flatMap(o => o.krs.map(k => ({ id: k.id, label: `${o.code} · ${k.title || k.id}` })));
  const valid = d.title.trim().length > 0;
  function setAssumption(i, v) {
    const a = (d.assumptions || []).slice(); a[i] = v; set("assumptions", a);
  }
  function addAssumption() { set("assumptions", [...(d.assumptions || []), ""]); }
  function delAssumption(i) { set("assumptions", (d.assumptions || []).filter((_, j) => j !== i)); }
  function setDissent(i, k, v) {
    const a = (d.dissent || []).slice(); a[i] = { ...a[i], [k]: v }; set("dissent", a);
  }
  function addDissent() { set("dissent", [...(d.dissent || []), { agent: "ag-risk", text: "" }]); }
  function delDissent(i) { set("dissent", (d.dissent || []).filter((_, j) => j !== i)); }
  function toggleEvidence(id) {
    const cur = d.evidenceSources || [];
    set("evidenceSources", cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  }

  return (
    <Modal
      title={d.__isNew ? "记录决策" : "编辑决策"}
      sub="决策日志会进入'公司知识中心',作为可追溯的策略历史。"
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
        <label className="field__label">决策标题 *</label>
        <textarea className="textarea" value={d.title} onChange={e => set("title", e.target.value)} placeholder="例如:全屋净水 2.0 产品定位收敛为'局改焕新'" />
      </div>

      <div className="field">
        <label className="field__label">决策问题 (Question)</label>
        <textarea className="textarea" value={d.question || ""} onChange={e => set("question", e.target.value)} placeholder="例如:全屋净水 2.0 应该面向新房刚需还是局改用户?" />
      </div>

      <div className="field">
        <label className="field__label">结论 (Conclusion)</label>
        <textarea className="textarea" value={d.conclusion || ""} onChange={e => set("conclusion", e.target.value)} placeholder="清晰地描述这次决议的最终结论与执行方向。" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">决策人</label>
          <input className="input" value={d.owner || ""} onChange={e => set("owner", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">日期</label>
          <input className="input" type="date" value={d.date || ""} onChange={e => set("date", e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label">状态</label>
          <select className="select" value={d.status || "decided"} onChange={e => set("status", e.target.value)}>
            {DECISION_STATUSES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">关联 KR</label>
          <select className="select" value={d.linkedKR || ""} onChange={e => set("linkedKR", e.target.value)}>
            <option value="">— 无 —</option>
            {allKRs.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label">关联战略问题</label>
          <select className="select" value={d.linkedQuestion || ""} onChange={e => set("linkedQuestion", e.target.value)}>
            <option value="">— 无 —</option>
            {StrategyQuestions.map(q => <option key={q.id} value={q.id}>{q.title.slice(0, 30)}…</option>)}
          </select>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>关键假设 ({(d.assumptions || []).length})</div>
          <button className="btn btn--ghost btn--sm" onClick={addAssumption}><Icon.Plus size={12} /> 添加</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(d.assumptions || []).map((a, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 28px", gap: 8, alignItems: "center" }}>
              <span className="num" style={{ fontSize: 11, color: "var(--vel-indigo-700)", fontWeight: 800 }}>A{i + 1}</span>
              <input className="input" value={a} onChange={e => setAssumption(i, e.target.value)} placeholder="假设条件…" />
              <button className="icon-btn icon-btn--danger" onClick={() => delAssumption(i)}><Icon.Trash size={13} /></button>
            </div>
          ))}
          {(d.assumptions || []).length === 0 && <div style={{ fontSize: 12, color: "var(--fg4)", padding: "8px 0" }}>尚未添加</div>}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>反对 / 保留意见 ({(d.dissent || []).length})</div>
          <button className="btn btn--ghost btn--sm" onClick={addDissent}><Icon.Plus size={12} /> 添加</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(d.dissent || []).map((c, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 28px", gap: 8, alignItems: "center" }}>
              <select className="select" value={c.agent} onChange={e => setDissent(i, "agent", e.target.value)}>
                {Agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input className="input" value={c.text} onChange={e => setDissent(i, "text", e.target.value)} placeholder="反对意见内容…" />
              <button className="icon-btn icon-btn--danger" onClick={() => delDissent(i)}><Icon.Trash size={13} /></button>
            </div>
          ))}
          {(d.dissent || []).length === 0 && <div style={{ fontSize: 12, color: "var(--fg4)", padding: "8px 0" }}>尚未添加</div>}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>证据来源 ({(d.evidenceSources || []).length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflow: "auto", padding: 4 }}>
          {KnowledgeSources.map(s => {
            const checked = (d.evidenceSources || []).includes(s.id);
            return (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: checked ? "var(--vel-indigo-50)" : "var(--slate-50)", cursor: "pointer" }}>
                <input type="checkbox" checked={checked} onChange={() => toggleEvidence(s.id)} />
                <span style={{ fontSize: 13, color: "var(--fg1)", flex: 1 }}>{s.title}</span>
                <span className="pill pill--neutral">{s.scope}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label className="field__label">复盘 (执行后回填)</label>
        <textarea className="textarea" value={d.retrospective || ""} onChange={e => set("retrospective", e.target.value)} placeholder="决策实际效果如何?有哪些假设被证伪?有哪些值得沉淀的经验?" />
      </div>
    </Modal>
  );
}
