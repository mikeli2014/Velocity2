import React, { useState, useMemo } from "react";
import { Icon, KpiCard, Modal } from "../components/primitives.jsx";
import {
  Workflows, WorkflowRuns, WORKFLOW_STATUSES,
  Departments, SkillPacks, KnowledgeDomains
} from "../data/seed.js";

const STEP_ROLES = {
  human:    { label: "人工",   color: "#475569", bg: "#f1f5f9" },
  system:   { label: "系统",   color: "#0891b2", bg: "#cffafe" },
  skill:    { label: "技能",   color: "#7c3aed", bg: "#ede9fe" },
  ai:       { label: "AI 推理", color: "#4f46e5", bg: "#e0e7ff" },
  approval: { label: "审批",   color: "#b45309", bg: "#fef3c7" }
};

const RUN_STATUS = {
  ok:       { label: "已完成", cls: "pill--ok" },
  warn:     { label: "有偏差", cls: "pill--warn" },
  fail:     { label: "失败",   cls: "pill--danger" },
  approval: { label: "待审批", cls: "pill--info" }
};

export function WorkflowsPage() {
  const [tab, setTab] = useState("templates");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewing, setViewing] = useState(null);

  const filtered = useMemo(() => Workflows.filter(w => {
    if (filterDept !== "all" && w.deptId !== filterDept) return false;
    if (filterStatus !== "all" && w.status !== filterStatus) return false;
    return true;
  }), [filterDept, filterStatus]);

  const statsToday = useMemo(() => ({
    total: Workflows.length,
    published: Workflows.filter(w => w.status === "published").length,
    runs: WorkflowRuns.length,
    fails: WorkflowRuns.filter(r => r.status === "fail").length
  }), []);

  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">工作流中心</div>
            <h1 className="page-head__title">工作流模板与执行</h1>
            <p className="page-head__subtitle">
              工作流是部门 AI 工作的产品化单元 — 把人工、系统、技能、AI 推理和审批步骤组合起来,
              支持从"提问"到"交付物"的端到端落地。模板可以跨部门复用,运行记录可追溯到知识源与 OKR。
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.RefreshCw size={13} /> 同步模板</button>
            <button className="btn btn--primary btn--sm"><Icon.Plus size={13} /> 新建工作流</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        <KpiCard label="工作流模板" value={statsToday.total} delta={`+1`} status="up" spark={[3, 4, 5, 6, 7, 7, 8, statsToday.total]} color="var(--vel-indigo)" />
        <KpiCard label="已发布" value={statsToday.published} delta="+1" status="up" spark={[3, 4, 5, 5, 6, 6, 7, statsToday.published]} color="#10b981" />
        <KpiCard label="本周执行次数" value="3,438" delta="+412" status="up" spark={[1800, 2100, 2400, 2600, 2800, 3000, 3200, 3438]} color="#7c3aed" />
        <KpiCard label="失败 / 阻塞" value={statsToday.fails} delta="-1" status="up" spark={[3, 3, 2, 2, 2, 1, 1, statsToday.fails]} color="#f59e0b" />
      </div>

      <div className="tabs">
        {[
          { id: "templates", label: "工作流模板", count: filtered.length },
          { id: "runs", label: "运行记录", count: WorkflowRuns.length },
          { id: "library", label: "技能 × 知识域映射" }
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
          </div>
        ))}
      </div>

      {tab === "templates" && (
        <div>
          <div className="row" style={{ marginBottom: 14, justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              <button className={`btn btn--sm ${filterDept === "all" ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilterDept("all")}>全部部门</button>
              {Departments.filter(d => !d.parentId).map(d => (
                <button
                  key={d.id}
                  className={`btn btn--sm ${filterDept === d.id ? "btn--primary" : "btn--ghost"}`}
                  onClick={() => setFilterDept(d.id)}
                  style={filterDept === d.id ? { background: d.color } : undefined}
                >{d.name}</button>
              ))}
              <button className={`btn btn--sm ${filterDept === "platform" ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilterDept("platform")}>平台基础</button>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {[{ v: "all", label: "全部状态" }].concat(WORKFLOW_STATUSES).map(s => (
                <button key={s.v} className={`btn btn--sm ${filterStatus === s.v ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilterStatus(s.v)}>{s.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2">
            {filtered.length === 0 && (
              <div className="card" style={{ gridColumn: "1 / -1", padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
                没有匹配的工作流 — 调整筛选条件
              </div>
            )}
            {filtered.map(w => <WorkflowCard key={w.id} w={w} onView={setViewing} />)}
          </div>
        </div>
      )}

      {tab === "runs" && <RunsTable runs={WorkflowRuns} />}
      {tab === "library" && <SkillDomainMap />}

      {viewing && <WorkflowDetail w={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function WorkflowCard({ w, onView }) {
  const dept = Departments.find(d => d.id === w.deptId);
  const accent = dept ? dept.color : "#7c3aed";
  const status = WORKFLOW_STATUSES.find(s => s.v === w.status) || WORKFLOW_STATUSES[0];
  const IconComp = Icon[w.icon] || Icon.Workflow;
  return (
    <div className="card" style={{ padding: 18, opacity: w.status === "deprecated" ? 0.6 : 1 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: accent + "18", color: accent, display: "grid", placeItems: "center" }}>
            <IconComp size={17} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{w.name}</div>
            <div className="num" style={{ fontSize: 10, color: "var(--fg3)" }}>{w.version} · {w.owner}</div>
          </div>
        </div>
        <span className="pill" style={{ background: status.color + "20", color: status.color, fontWeight: 600 }}>{status.label}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.55, marginBottom: 12 }}>{w.description}</div>

      <div style={{ padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6, fontSize: 11, color: "var(--fg3)", marginBottom: 12, lineHeight: 1.6 }}>
        <div><strong style={{ color: "var(--fg2)" }}>输入:</strong> {w.input}</div>
        <div><strong style={{ color: "var(--fg2)" }}>输出:</strong> {w.output}</div>
      </div>

      <div className="row" style={{ gap: 4, marginBottom: 12 }}>
        {w.steps.map((s, i) => {
          const role = STEP_ROLES[s.role] || STEP_ROLES.system;
          return (
            <div key={s.id} title={`${i + 1}. ${s.name} · ${role.label}`}
              style={{
                flex: 1, height: 6, borderRadius: 2,
                background: role.bg,
                borderTop: `2px solid ${role.color}`
              }}
            />
          );
        })}
      </div>

      <div className="row" style={{ justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
        <div className="row" style={{ gap: 12, fontSize: 11, color: "var(--fg3)" }}>
          <span><Icon.Activity size={11} style={{ verticalAlign: "-2px" }} /> <span className="num">{w.uses}</span> 次</span>
          <span><Icon.Clock size={11} style={{ verticalAlign: "-2px" }} /> {w.avgTime}</span>
          <span style={{ color: "var(--fg4)" }}>· 最近 {w.lastRun}</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn--text btn--sm" onClick={() => onView(w)}>查看 <Icon.ArrowRight size={11} /></button>
          <button className="btn btn--primary btn--sm" disabled={w.status === "deprecated"} style={w.status === "deprecated" ? { opacity: 0.5 } : { background: accent }}>
            <Icon.PlayCircle size={13} /> 运行
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowDetail({ w, onClose }) {
  const dept = Departments.find(d => d.id === w.deptId);
  const accent = dept ? dept.color : "#7c3aed";
  const skills = (w.linkedSkills || []).map(id => SkillPacks.find(s => s.id === id)).filter(Boolean);
  const domains = (w.linkedDomains || []).map(id => KnowledgeDomains.find(k => k.id === id)).filter(Boolean);
  const status = WORKFLOW_STATUSES.find(s => s.v === w.status) || WORKFLOW_STATUSES[0];

  return (
    <Modal
      title={w.name}
      sub={`${dept?.name || "平台基础"} · ${w.version} · ${w.owner}`}
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>关闭</button>
        <button className="btn btn--ghost btn--sm"><Icon.Edit size={13} /> 编辑模板</button>
        <button className="btn btn--primary btn--sm" style={{ background: accent }}><Icon.PlayCircle size={13} /> 立即运行</button>
      </>}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="pill" style={{ background: status.color + "20", color: status.color, fontWeight: 600 }}>{status.label}</span>
        <span className="pill pill--neutral"><Icon.Activity size={10} /> {w.uses} 次执行</span>
        <span className="pill pill--neutral"><Icon.Clock size={10} /> 平均 {w.avgTime}</span>
        <span className="pill pill--neutral">最近 {w.lastRun}</span>
      </div>

      <div style={{ padding: "12px 14px", background: "var(--slate-50)", borderRadius: 8, fontSize: 13, color: "var(--fg2)", lineHeight: 1.6 }}>
        {w.description}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label className="field__label">输入</label>
          <div style={{ fontSize: 13, color: "var(--fg1)" }}>{w.input}</div>
        </div>
        <div className="field">
          <label className="field__label">输出</label>
          <div style={{ fontSize: 13, color: "var(--fg1)" }}>{w.output}</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <Icon.Workflow size={14} style={{ color: "var(--vel-indigo)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>步骤 ({w.steps.length})</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {w.steps.map((s, i) => {
            const role = STEP_ROLES[s.role] || STEP_ROLES.system;
            const skill = s.skillId ? SkillPacks.find(sp => sp.id === s.skillId) : null;
            return (
              <div key={s.id} style={{
                display: "grid", gridTemplateColumns: "26px 1fr 90px 80px",
                gap: 10, alignItems: "center",
                padding: "10px 12px",
                background: "#fff", border: "1px solid var(--border-soft)",
                borderLeft: `3px solid ${role.color}`,
                borderRadius: 8
              }}>
                <div className="num" style={{ fontWeight: 800, color: "var(--fg3)" }}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 600 }}>{s.name}</div>
                  {skill && <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>使用技能 · <strong style={{ color: "var(--vel-indigo)" }}>{skill.name}</strong></div>}
                  {s.approver && <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>审批人 · {s.approver}</div>}
                </div>
                <span className="pill" style={{ background: role.bg, color: role.color, fontWeight: 600 }}>{role.label}</span>
                <span className="num" style={{ fontSize: 11, color: "var(--fg3)", textAlign: "right" }}>{s.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {(skills.length > 0 || domains.length > 0) && (
        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
          <div className="row" style={{ gap: 8, marginBottom: 12 }}>
            <Icon.Sparkles size={14} style={{ color: "var(--vel-violet)" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>引用资产</div>
          </div>
          {skills.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 6 }}>技能 ({skills.length})</div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {skills.map(s => <span key={s.id} className="pill pill--indigo"><Icon.Sparkles size={10} /> {s.name}</span>)}
              </div>
            </div>
          )}
          {domains.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 6 }}>知识域 ({domains.length})</div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {domains.map(d => <span key={d.id} className="pill pill--ok"><Icon.Database size={10} /> {d.name} · {d.count}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function RunsTable({ runs }) {
  return (
    <div className="card">
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead style={{ background: "var(--slate-50)" }}>
          <tr style={{ textAlign: "left" }}>
            {["状态", "工作流", "触发", "执行人", "开始", "时长", "结果"].map(h => (
              <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map(r => {
            const wf = Workflows.find(w => w.id === r.workflowId);
            const st = RUN_STATUS[r.status] || RUN_STATUS.ok;
            return (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border-soft)" }}>
                <td style={{ padding: "12px 14px" }}><span className={`pill ${st.cls}`}>{st.label}</span></td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--fg1)" }}>{wf ? wf.name : "—"}</td>
                <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{r.trigger}</td>
                <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{r.actor}</td>
                <td style={{ padding: "12px 14px", color: "var(--fg3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{r.started}</td>
                <td style={{ padding: "12px 14px", color: "var(--fg3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{r.duration}</td>
                <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{r.output}</td>
              </tr>
            );
          })}
          {runs.length === 0 && (
            <tr><td colSpan={7} style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>暂无运行记录</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SkillDomainMap() {
  // Aggregate which workflows use which skills/domains, so platform/governance
  // owners can see fan-out.
  const skillUsage = {};
  const domainUsage = {};
  Workflows.forEach(w => {
    (w.linkedSkills || []).forEach(sid => { (skillUsage[sid] = skillUsage[sid] || []).push(w); });
    (w.linkedDomains || []).forEach(did => { (domainUsage[did] = domainUsage[did] || []).push(w); });
  });

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="card">
        <div className="card__head">
          <div className="card__title"><Icon.Sparkles size={14} style={{ color: "var(--vel-violet)" }} /> 技能 → 工作流</div>
        </div>
        <div>
          {Object.keys(skillUsage).map((sid, i) => {
            const s = SkillPacks.find(x => x.id === sid);
            if (!s) return null;
            return (
              <div key={sid} style={{ padding: "12px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{s.name}</div>
                  <span className="pill pill--indigo num">{skillUsage[sid].length} 个工作流</span>
                </div>
                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  {skillUsage[sid].map(w => <span key={w.id} className="pill pill--neutral"><Icon.Workflow size={10} /> {w.name}</span>)}
                </div>
              </div>
            );
          })}
          {Object.keys(skillUsage).length === 0 && <div style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>尚无技能 → 工作流映射</div>}
        </div>
      </div>
      <div className="card">
        <div className="card__head">
          <div className="card__title"><Icon.Database size={14} style={{ color: "var(--success)" }} /> 知识域 → 工作流</div>
        </div>
        <div>
          {Object.keys(domainUsage).map((did, i) => {
            const d = KnowledgeDomains.find(x => x.id === did);
            if (!d) return null;
            return (
              <div key={did} style={{ padding: "12px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{d.name}</div>
                    <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{d.count} 条</span>
                  </div>
                  <span className="pill pill--ok num">{domainUsage[did].length} 个工作流</span>
                </div>
                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  {domainUsage[did].map(w => <span key={w.id} className="pill pill--neutral"><Icon.Workflow size={10} /> {w.name}</span>)}
                </div>
              </div>
            );
          })}
          {Object.keys(domainUsage).length === 0 && <div style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>尚无知识域 → 工作流映射</div>}
        </div>
      </div>
    </div>
  );
}
