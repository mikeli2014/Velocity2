// Velocity OS — Knowledge Center, OKR & Projects, Departments index, Skills, Assistants, Governance

const { useState: useS1 } = React;

// =============== Knowledge Center =========================================
function KnowledgePage() {
  const [tab, setTab] = useS1("sources");
  const [filter, setFilter] = useS1("all");
  const sources = filter === "all" ? KnowledgeSources : KnowledgeSources.filter(s => s.scope.includes(filter));

  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">公司知识中心</div>
            <h1 className="page-head__title">公司知识中心</h1>
            <p className="page-head__subtitle">沉淀公司战略、产品、品牌、组织、市场、竞品、流程、制度、项目和术语,作为所有 AI 分析的统一上下文。</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.Globe size={14} /> 网络抓取</button>
            <button className="btn btn--primary btn--sm"><Icon.Upload size={14} /> 上传材料</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        <KpiCard label="知识条目" value="1,247" delta="+38" status="up" spark={[1100,1140,1170,1180,1200,1220,1240,1247]} color="var(--vel-indigo)" />
        <KpiCard label="本月引用次数" value="3,412" delta="+412" status="up" spark={[1800,2100,2400,2600,2800,3000,3200,3412]} color="#10b981" />
        <KpiCard label="待审核" value="42" delta="+12" status="down" spark={[20,22,28,30,32,38,40,42]} color="#f59e0b" />
        <KpiCard label="已禁用" value="18" delta="0" status="up" spark={[18,18,18,18,18,18,18,18]} color="#94a3b8" />
      </div>

      <div className="tabs">
        {[
          { id: "sources", label: "知识来源", count: KnowledgeSources.length },
          { id: "domains", label: "知识域", count: KnowledgeDomains.length },
          { id: "graph", label: "知识图谱" },
          { id: "ingest", label: "采集队列", count: 6 },
          { id: "feedback", label: "反馈与质量" }
        ].map(t => (
          <div key={t.id} className={`tab ${tab===t.id?"is-active":""}`} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
          </div>
        ))}
      </div>

      {tab === "sources" && (
        <div>
          <div className="row" style={{ marginBottom: 14, justifyContent: "space-between" }}>
            <div className="row" style={{ gap: 6 }}>
              {["all", "公司", "工业设计", "渠道运营", "服务部"].map(f => (
                <button key={f} className={`btn btn--sm ${filter===f?"btn--primary":"btn--ghost"}`} onClick={()=>setFilter(f)}>
                  {f === "all" ? "全部" : f}
                </button>
              ))}
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn--ghost btn--sm"><Icon.Filter size={13} /> 筛选</button>
              <div className="topbar__search" style={{ width: 220, marginLeft: 0 }}>
                <Icon.Search size={13} />
                <input placeholder="搜索来源…" />
              </div>
            </div>
          </div>

          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "var(--slate-50)" }}>
                <tr style={{ textAlign: "left" }}>
                  {["来源", "类型", "范围", "质量", "引用", "负责人", "更新", ""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", fontWeight: 600, fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border-soft)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sources.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div className="row" style={{ gap: 10 }}>
                        <div style={{ width: 28, height: 32, borderRadius: 4, background: "var(--vel-indigo-50)", color: "var(--vel-indigo-700)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800 }}>{s.type}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--fg1)" }}>{s.title}</div>
                          <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 1 }}>{s.size}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}><span className="tag">{s.type}</span></td>
                    <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{s.scope}</td>
                    <td style={{ padding: "12px 14px" }}><HealthPill status={s.quality} /></td>
                    <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", color: "var(--fg2)" }}>{s.uses}</td>
                    <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{s.owner}</td>
                    <td style={{ padding: "12px 14px", color: "var(--fg3)", fontSize: 12 }}>{s.updated}</td>
                    <td style={{ padding: "12px 14px" }}><button className="btn btn--text btn--sm"><Icon.MoreH size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "domains" && (
        <div className="grid grid-cols-3">
          {KnowledgeDomains.map(d => (
            <div key={d.id} className="card" style={{ padding: 18 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Icon.Folder size={16} style={{ color: "var(--vel-indigo)" }} />
                  <div style={{ fontWeight: 700, color: "var(--fg1)" }}>{d.name}</div>
                </div>
                <span className={`pill ${d.health === 'ok' ? 'pill--ok' : 'pill--warn'}`}>{d.health === 'ok' ? '健康' : '需补充'}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--fg1)", letterSpacing: "-0.02em" }}>{d.count.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 12 }}>知识条目 · 更新 {d.lastUpdate}</div>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 4 }}>覆盖度 {d.coverage}%</div>
              <Progress value={d.coverage} status={d.coverage >= 80 ? "ok" : d.coverage >= 65 ? "warn" : "danger"} />
            </div>
          ))}
        </div>
      )}

      {tab === "graph" && <KnowledgeGraph />}
      {tab === "ingest" && <IngestQueue />}
      {tab === "feedback" && <FeedbackPanel />}
    </div>
  );
}

function KnowledgeGraph() {
  // a stylized SVG cluster: company center + domain bubbles
  const cx = 360, cy = 220;
  const domains = KnowledgeDomains.slice(0, 8).map((d, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { ...d, x: cx + Math.cos(a) * 200, y: cy + Math.sin(a) * 150 };
  });
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="card__title" style={{ marginBottom: 12 }}>
        <Icon.Map size={14} style={{ color: "#7c3aed" }} /> 知识域关系图谱
      </div>
      <svg viewBox="0 0 720 440" style={{ width: "100%", height: 440, background: "var(--slate-50)", borderRadius: 12 }}>
        <defs>
          <radialGradient id="cglow"><stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3"/><stop offset="100%" stopColor="#4F46E5" stopOpacity="0"/></radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="120" fill="url(#cglow)" />
        {domains.map(d => (
          <line key={d.id} x1={cx} y1={cy} x2={d.x} y2={d.y} stroke="#cbd5e1" strokeDasharray="3 4" />
        ))}
        <circle cx={cx} cy={cy} r="44" fill="#4F46E5" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontWeight="800" fontSize="13">{Company.initials}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">公司知识</text>
        {domains.map(d => (
          <g key={d.id} style={{ cursor: "pointer" }}>
            <circle cx={d.x} cy={d.y} r={Math.max(22, Math.min(40, d.count / 30))} fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x={d.x} y={d.y - 1} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">{d.name.split(" ")[0].slice(0,4)}</text>
            <text x={d.x} y={d.y + 11} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="JetBrains Mono">{d.count}</text>
          </g>
        ))}
      </svg>
      <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 12 }}>
        圆圈大小代表知识条目数量。点击节点查看详情和引用关系。
      </div>
    </div>
  );
}

function IngestQueue() {
  const items = [
    { name: "Q1 财务月度复盘.pptx", state: "parsing", progress: 62 },
    { name: "竞品 G3 发布会要点.docx", state: "embedding", progress: 88 },
    { name: "城运 BP/SC 培训纪要.txt", state: "tagging", progress: 41 },
    { name: "市场调研问卷 Apr.xlsx", state: "queued", progress: 0 },
    { name: "https://aowei.com/report/2026q1", state: "fetching", progress: 18 },
    { name: "供应商资质年检 2026.zip", state: "review", progress: 100 }
  ];
  const stateMap = { parsing: "解析中", embedding: "向量化", tagging: "打标签", queued: "排队中", fetching: "抓取中", review: "待审核" };
  return (
    <div className="card">
      {items.map((it, i) => (
        <div key={i} style={{ padding: "14px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none", display: "grid", gridTemplateColumns: "1fr auto 200px auto", gap: 14, alignItems: "center" }}>
          <div className="row" style={{ gap: 10 }}>
            <Icon.File size={15} style={{ color: "var(--fg3)" }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg1)" }}>{it.name}</div>
          </div>
          <span className={`pill ${it.state === 'review' ? 'pill--warn' : 'pill--info'}`}>{stateMap[it.state]}</span>
          <Progress value={it.progress} status={it.state === 'review' ? 'warn' : 'info'} />
          <span className="num" style={{ fontSize: 12, color: "var(--fg2)", width: 36, textAlign: "right" }}>{it.progress}%</span>
        </div>
      ))}
    </div>
  );
}

function FeedbackPanel() {
  const fb = [
    { who: "苏婉 · 工业设计", what: "标记为不准确", target: "AI 关于 PVD 工艺成本的回答", reason: "成本数据来自 2023 年,需更新", when: "1小时前" },
    { who: "周岚 · 渠道运营", what: "补充知识", target: "二线城市 BP 协同节奏", reason: "新增了 3 个城市试点经验", when: "今早" },
    { who: "孙阳 · 工业设计", what: "标记为有用", target: "零冷水竞品对比表", reason: "—", when: "昨天" }
  ];
  return (
    <div className="card">
      {fb.map((f, i) => (
        <div key={i} style={{ padding: 16, borderTop: i ? "1px solid var(--border-soft)" : "none", display: "flex", gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{f.who[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--fg2)" }}><strong style={{ color: "var(--fg1)" }}>{f.who}</strong> {f.what} <em style={{ color: "var(--fg1)", fontStyle: "normal", fontWeight: 600 }}>{f.target}</em></div>
            {f.reason !== "—" && <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 4 }}>"{f.reason}"</div>}
            <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 4 }}>{f.when}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============== OKR & Projects =========================================
const STATUS_OPTS = [
  { v: "on-track", label: "进行中" },
  { v: "at-risk", label: "有风险" },
  { v: "achieved", label: "已达成" }
];
const HEALTH_OPTS = [
  { v: "ok", label: "健康" },
  { v: "warn", label: "关注" },
  { v: "danger", label: "告警" }
];

function makeId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`; }

// ----- Modal primitives -----
function Modal({ title, sub, onClose, large, children, foot }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${large ? "modal--lg" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <div className="modal__title">{title}</div>
            {sub && <div className="modal__sub">{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon.X size={14} /></button>
        </div>
        <div className="modal__body">{children}</div>
        {foot && <div className="modal__foot">{foot}</div>}
      </div>
    </div>
  );
}

function ConfirmModal({ title, body, danger, onCancel, onConfirm, confirmLabel = "删除" }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onCancel}>取消</button>
        <button className={`btn btn--sm ${danger ? "btn--danger" : "btn--primary"}`} onClick={onConfirm}>{confirmLabel}</button>
      </>}
    >
      <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.6 }}>{body}</div>
    </Modal>
  );
}

// ----- OkrPage with state -----
function OkrPage() {
  const [tab, setTab] = useS1("objectives");
  const [objectives, setObjectives] = useS1(() => Objectives.map(o => ({ ...o, krs: o.krs.map(k => ({ ...k })) })));
  const [projects, setProjects] = useS1(() => Projects.map(p => ({ ...p })));
  const [decisions, setDecisions] = useS1(() => Decisions.map(d => ({ ...d })));

  const [editingObj, setEditingObj] = useS1(null);          // objective being edited
  const [editingProj, setEditingProj] = useS1(null);
  const [editingDec, setEditingDec] = useS1(null);
  const [confirm, setConfirm] = useS1(null);                // { title, body, onConfirm }

  // Recompute objective progress from KRs
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
  function deleteObjective(id) {
    setObjectives(list => list.filter(o => o.id !== id));
    setConfirm(null);
  }
  function newObjective() {
    const n = (objectives.length || 0) + 1;
    setEditingObj({
      id: makeId("obj"),
      code: `O${Math.max(...objectives.map(o => parseInt((o.code||"O0").slice(1))||0), 0) + 1}`,
      title: "",
      owner: "",
      quarter: "FY26",
      status: "on-track",
      progress: 0,
      krs: [],
      linkedProjects: [],
      __isNew: true
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
  function deleteProject(id) {
    setProjects(list => list.filter(p => p.id !== id));
    setConfirm(null);
  }
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
  function deleteDecision(id) {
    setDecisions(list => list.filter(d => d.id !== id));
    setConfirm(null);
  }
  function newDecision() {
    const today = new Date().toISOString().slice(0,10);
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
          <div key={t.id} className={`tab ${tab===t.id?"is-active":""}`} onClick={() => setTab(t.id)}>
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
              onEdit={() => setEditingObj({ ...o, krs: o.krs.map(k => ({ ...k })), linkedProjects: [...(o.linkedProjects||[])] })}
              onDelete={() => setConfirm({
                title: `删除 ${o.code}?`,
                body: <>此操作将永久移除 Objective <b>“{o.title}”</b> 及其下 {o.krs.length} 个 Key Result。关联的关键项目不会被删除。</>,
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
            body: <>将从组合中移除 <b>“{p.name}”</b>。已记录的决策与对齐图引用不会被自动清理。</>,
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
        <ObjectiveEditor
          objective={editingObj}
          onChange={setEditingObj}
          onClose={() => setEditingObj(null)}
          onSave={() => saveObjective(editingObj)}
        />
      )}
      {editingProj && (
        <ProjectEditor
          project={editingProj}
          objectives={objectives}
          onChange={setEditingProj}
          onClose={() => setEditingProj(null)}
          onSave={() => saveProject(editingProj)}
        />
      )}
      {editingDec && (
        <DecisionEditor
          decision={editingDec}
          objectives={objectives}
          onChange={setEditingDec}
          onClose={() => setEditingDec(null)}
          onSave={() => saveDecision(editingDec)}
        />
      )}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          body={confirm.body}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}
    </div>
  );
}

function EmptyState({ label, cta, onCta }) {
  return (
    <div className="card" style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 12 }}>{label}</div>
      {cta && <button className="btn btn--primary btn--sm" onClick={onCta}><Icon.Plus size={14} /> {cta}</button>}
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
            <span>{(o.linkedProjects||[]).length} 关键项目</span>
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

function ProjectEditor({ project: p, objectives, onChange, onClose, onSave }) {
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
            {objectives.map(o => <option key={o.id} value={o.code}>{o.code} — {o.title.slice(0,18)}</option>)}
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
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{(o.title||"未命名").split("—")[0]}</span>
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
          {projects.slice(0,5).map(p => (
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

// =============== Departments index =========================================
function buildDeptTree(list) {
  const byParent = new Map();
  list.forEach(d => {
    const k = d.parentId || "__root__";
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k).push(d);
  });
  return byParent;
}
function deptChildrenOf(list, id) {
  return list.filter(d => d.parentId === id);
}
function deptDescendants(list, id) {
  // returns id + all descendants
  const out = [list.find(d => d.id === id)].filter(Boolean);
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop();
    list.filter(d => d.parentId === cur).forEach(c => { out.push(c); stack.push(c.id); });
  }
  return out;
}
function deptPath(list, id) {
  const path = [];
  let cur = list.find(d => d.id === id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? list.find(d => d.id === cur.parentId) : null;
  }
  return path;
}

function DepartmentTreeNode({ dept, byParent, selectedId, expanded, toggleExpand, onSelect, depth = 0 }) {
  const children = byParent.get(dept.id) || [];
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(dept.id);
  const isSel = selectedId === dept.id;
  const Ico = Icon[dept.icon] || Icon.Building;
  return (
    <div>
      <div
        onClick={() => onSelect(dept.id)}
        style={{
          display: "grid",
          gridTemplateColumns: "16px 22px 1fr auto",
          gap: 6,
          alignItems: "center",
          padding: `6px 8px 6px ${8 + depth * 14}px`,
          marginBottom: 1,
          borderRadius: 6,
          cursor: "pointer",
          background: isSel ? "var(--vel-indigo-50)" : "transparent",
          color: isSel ? "var(--vel-indigo-700)" : "var(--fg2)"
        }}
      >
        <span
          onClick={e => { if (hasChildren) { e.stopPropagation(); toggleExpand(dept.id); } }}
          style={{ display: "inline-grid", placeItems: "center", color: "var(--fg4)", cursor: hasChildren ? "pointer" : "default" }}
        >
          {hasChildren ? (
            <Icon.Chevron size={11} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          ) : <span style={{ width: 11 }} />}
        </span>
        <span style={{ display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 5, background: dept.color + "20", color: dept.color }}>
          <Ico size={13} />
        </span>
        <span style={{ fontSize: 12.5, fontWeight: isSel ? 700 : 500, color: isSel ? "var(--vel-indigo-700)" : "var(--fg1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dept.name}</span>
        <span className="num" style={{ fontSize: 10, color: "var(--fg4)" }}>{hasChildren ? children.length : ""}</span>
      </div>
      {hasChildren && isOpen && children.map(c => (
        <DepartmentTreeNode
          key={c.id} dept={c} byParent={byParent} selectedId={selectedId}
          expanded={expanded} toggleExpand={toggleExpand} onSelect={onSelect} depth={depth + 1}
        />
      ))}
    </div>
  );
}

function DepartmentsIndex({ setRoute }) {
  // Selection: __root__ shows top-level cards; an id shows that dept's detail + its children
  const [selectedId, setSelectedId] = useS1("__root__");
  const [expanded, setExpanded] = useS1(() => new Set(["industrial-design", "service", "cop"]));

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const byParent = buildDeptTree(Departments);
  const isRoot = selectedId === "__root__";
  const selected = !isRoot ? Departments.find(d => d.id === selectedId) : null;
  const path = !isRoot ? deptPath(Departments, selectedId) : [];
  const directChildren = isRoot ? (byParent.get("__root__") || []) : (byParent.get(selectedId) || []);
  const subtree = !isRoot ? deptDescendants(Departments, selectedId) : Departments;
  const rollup = subtree.reduce((acc, d) => ({
    people: acc.people + (d.people || 0),
    knowledge: acc.knowledge + (d.knowledge || 0),
    skills: acc.skills + (d.skills || 0),
    workflows: acc.workflows + (d.workflows || 0),
    projects: acc.projects + (d.projects || 0)
  }), { people: 0, knowledge: 0, skills: 0, workflows: 0, projects: 0 });

  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">部门工作空间</div>
            <h1 className="page-head__title">部门工作空间</h1>
            <p className="page-head__subtitle">支持多级组织结构。每个部门拥有自己的知识库、技能包、工作流和助手。新增子部门通过配置完成,无需重写产品。</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.GitBranch size={13} /> 组织视图</button>
            <button className="btn btn--primary btn--sm"><Icon.Plus size={14} /> 注册新部门</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, alignItems: "start" }}>
        {/* Tree */}
        <div className="card" style={{ padding: 12, position: "sticky", top: 70, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div
            onClick={() => setSelectedId("__root__")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", marginBottom: 8,
              borderRadius: 6,
              background: isRoot ? "var(--vel-indigo-50)" : "transparent",
              color: isRoot ? "var(--vel-indigo-700)" : "var(--fg1)",
              cursor: "pointer",
              fontWeight: 700, fontSize: 13
            }}
          >
            <Icon.Building size={14} /> 集团
            <span className="num" style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg4)" }}>{Departments.filter(d => !d.parentId).length}</span>
          </div>
          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 8 }}>
            {(byParent.get("__root__") || []).map(d => (
              <DepartmentTreeNode
                key={d.id} dept={d} byParent={byParent}
                selectedId={selectedId} expanded={expanded}
                toggleExpand={toggleExpand} onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>

        {/* Right pane */}
        <div>
          {/* Breadcrumb */}
          <div className="row" style={{ gap: 6, marginBottom: 14, fontSize: 12, color: "var(--fg3)", flexWrap: "wrap" }}>
            <span onClick={() => setSelectedId("__root__")} style={{ cursor: "pointer" }}><Icon.Building size={12} style={{ verticalAlign: "-2px" }} /> 集团</span>
            {path.map((p, i) => (
              <React.Fragment key={p.id}>
                <Icon.Chevron size={10} style={{ color: "var(--fg4)" }} />
                <span
                  onClick={() => setSelectedId(p.id)}
                  style={{ cursor: "pointer", fontWeight: i === path.length - 1 ? 700 : 500, color: i === path.length - 1 ? "var(--fg1)" : "var(--fg3)" }}
                >{p.name}</span>
              </React.Fragment>
            ))}
          </div>

          {/* Selected dept summary (skip on root) */}
          {!isRoot && selected && (
            <div className="card" style={{ padding: 22, marginBottom: 18, background: `linear-gradient(135deg, ${selected.color}08, transparent 60%)` }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: selected.color + "20", color: selected.color, display: "grid", placeItems: "center" }}>
                  {React.createElement(Icon[selected.icon] || Icon.Building, { size: 24 })}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--fg1)" }}>{selected.name}</div>
                    <HealthPill status={selected.status} />
                    {directChildren.length > 0 && <span className="pill pill--neutral"><Icon.GitBranch size={10} /> {directChildren.length} 子部门</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg3)" }}>{selected.en} · 负责人 {selected.lead} · {selected.people} 人 · {selected.assistant !== "—" ? `助手 ${selected.assistant}` : "暂未配置助手"}</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn--ghost btn--sm" onClick={() => setRoute({ page: "department", deptId: selected.id })}>
                    进入工作空间 <Icon.ArrowRight size={12} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
                {[
                  { label: "员工 (含子部门)", value: rollup.people.toLocaleString() },
                  { label: "知识条目", value: rollup.knowledge.toLocaleString() },
                  { label: "技能", value: rollup.skills },
                  { label: "工作流", value: rollup.workflows },
                  { label: "项目", value: rollup.projects }
                ].map(s => (
                  <div key={s.label}>
                    <div className="num" style={{ fontSize: 20, fontWeight: 800, color: "var(--fg1)" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "var(--fg3)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Children grid header */}
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {isRoot ? "一级部门" : (directChildren.length > 0 ? "子部门" : "下属团队")}
              <span className="num" style={{ fontSize: 11, color: "var(--fg4)", marginLeft: 6 }}>{directChildren.length}</span>
            </div>
            {!isRoot && directChildren.length === 0 && (
              <button className="btn btn--text btn--sm" onClick={() => setRoute({ page: "department", deptId: selected.id })}>
                查看部门工作空间 <Icon.ArrowRight size={11} />
              </button>
            )}
          </div>

          {directChildren.length === 0 && !isRoot ? (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
              <div style={{ marginBottom: 8 }}>该部门暂无子部门</div>
              <button className="btn btn--ghost btn--sm"><Icon.Plus size={12} /> 添加子部门</button>
            </div>
          ) : (
            <div className="grid grid-cols-3" style={{ gap: 14 }}>
              {directChildren.map(d => (
                <DepartmentCard
                  key={d.id} d={d}
                  childCount={(byParent.get(d.id) || []).length}
                  onOpen={() => setRoute({ page: "department", deptId: d.id })}
                  onDrillIn={() => setSelectedId(d.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartmentCard({ d, childCount, onOpen, onDrillIn }) {
  const Ico = Icon[d.icon] || Icon.Building;
  const hasChildren = childCount > 0;
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        onClick={hasChildren ? onDrillIn : onOpen}
        style={{
          padding: "20px 22px",
          background: `linear-gradient(135deg, ${d.color}10, ${d.color}03)`,
          borderBottom: "1px solid var(--border-soft)",
          cursor: "pointer"
        }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: d.color + "20", color: d.color, display: "grid", placeItems: "center" }}>
            <Ico size={20} />
          </div>
          <div className="row" style={{ gap: 6 }}>
            {hasChildren && <span className="pill pill--neutral"><Icon.GitBranch size={10} /> {childCount}</span>}
            <HealthPill status={d.status} />
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg1)" }}>{d.name}</div>
        <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 2 }}>{d.en} · 负责人 {d.lead}</div>
      </div>
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "知识", value: d.knowledge.toLocaleString() },
          { label: "技能", value: d.skills },
          { label: "工作流", value: d.workflows },
          { label: "项目", value: d.projects }
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div className="num" style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--fg3)", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card__foot" style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          {d.assistant !== "—" ? <><Icon.MessageCircle size={11} style={{ verticalAlign: "-2px" }} /> 助手 <strong style={{ color: "var(--fg2)" }}>{d.assistant}</strong></> : "暂未配置助手"}
        </div>
        <div className="row" style={{ gap: 6 }}>
          {hasChildren && (
            <button className="btn btn--text btn--sm" onClick={onDrillIn} style={{ color: d.color }}>
              下钻 <Icon.Chevron size={11} />
            </button>
          )}
          <button className="btn btn--text btn--sm" onClick={onOpen} style={{ color: d.color }}>
            进入 <Icon.ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== Skill Editor =============================================
const SKILL_ICONS = ["Search","Eye","BarChart3","Sparkles","GitBranch","FileText","Stethoscope","AlertTriangle","Workflow","Zap","Cloud","Lock","Activity","Database"];

function SkillCard({ s, dept, onEdit, onDelete, onRun, allowEdit = true }) {
  const scope = SKILL_SCOPES.find(x => x.v === s.scope) || SKILL_SCOPES[0];
  const status = SKILL_STATUSES.find(x => x.v === s.status) || SKILL_STATUSES[0];
  const accent = dept ? dept.color : "#7c3aed";
  return (
    <div className="card skill-card" style={{ padding: 18, position: "relative", opacity: s.status === "deprecated" ? 0.6 : 1 }}>
      {allowEdit && (
        <div className="row-actions skill-card__actions" style={{ position: "absolute", top: 12, right: 12 }}>
          <button className="icon-btn" title="编辑" onClick={() => onEdit(s)}><Icon.Edit size={13}/></button>
          <button className="icon-btn icon-btn--danger" title="删除" onClick={() => onDelete(s)}><Icon.Trash size={13}/></button>
        </div>
      )}
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10, paddingRight: allowEdit ? 56 : 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: accent + "18", color: accent, display: "grid", placeItems: "center" }}>
          {React.createElement(Icon[s.icon] || Icon.Sparkles, { size: 17 })}
        </div>
        <span className="pill" style={{ background: scope.color+"15", color: scope.color, fontWeight: 600 }}>{scope.label}</span>
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
        <span><Icon.User size={10} style={{ verticalAlign: "-1px" }}/> 维护人 <strong style={{ color: "var(--fg1)", marginLeft: 4 }}>{s.maintainer || "未指定"}</strong></span>
        <span className="num">{s.updated || ""}</span>
      </div>
      <div className="row" style={{ justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
        <div className="row" style={{ gap: 12, fontSize: 11, color: "var(--fg3)" }}>
          <span><Icon.Activity size={11} style={{ verticalAlign: "-2px" }} /> <span className="num">{s.uses}</span> 次</span>
          <span><Icon.Star size={11} style={{ verticalAlign: "-2px", color: "#f59e0b" }} /> <span className="num">{s.rating}</span></span>
        </div>
        <button className="btn btn--text btn--sm" onClick={() => onRun && onRun(s)} disabled={s.status === "deprecated"}>运行 <Icon.ArrowRight size={11} /></button>
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

// =============== Skills, Assistants, Governance =========================================
function SkillsPage() {
  const [list, setList] = uS(() => SkillPacks.map(s => ({ ...s })));
  const [editing, setEditing] = uS(null);
  const [confirm, setConfirm] = uS(null);
  const [filterDept, setFilterDept] = uS("all");
  const [filterScope, setFilterScope] = uS("all");
  const [filterStatus, setFilterStatus] = uS("all");

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
      const next = { ...editing, updated: new Date().toISOString().slice(0,10) };
      delete next.__isNew;
      if (i === -1) return [next, ...prev];
      const cp = prev.slice(); cp[i] = next; return cp;
    });
    setEditing(null);
  }
  function del() { setList(prev => prev.filter(x => x.id !== confirm.s.id)); setConfirm(null); }
  function onNew(scope = "dept", dept = "industrial-design") {
    setEditing({
      id: makeId("sp"), name: "", maintainer: "", version: "v0.1.0",
      dept, scope, status: "draft",
      icon: "Sparkles", input: "", output: "",
      uses: 0, rating: 0, updated: new Date().toISOString().slice(0,10),
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
          <button className="btn btn--primary btn--sm" onClick={() => onNew()}><Icon.Plus size={13}/> 新增 Skill Pack</button>
        </div>
      </div>

      {/* Ownership / governance banner */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 20, background: "linear-gradient(180deg, var(--vel-indigo-50) 0%, white 100%)", border: "1px solid var(--vel-indigo-100)" }}>
        <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--vel-indigo)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon.Lock size={16}/></div>
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

      {/* Counts */}
      <div className="grid grid-cols-4" style={{ marginBottom: 16 }}>
        <KpiCard label="技能总数"   value={counts.total}     color="var(--vel-indigo)" />
        <KpiCard label="已发布"     value={counts.published} color="#10b981" />
        <KpiCard label="草稿"       value={counts.draft}     color="#f59e0b" />
        <KpiCard label="平台基础"   value={counts.platform}  color="#7c3aed" />
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 12, marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", marginRight: 4 }}>部门</span>
          {[{ id: "all", name: "全部" }, ...Departments, { id: "platform", name: "平台" }].map(d => (
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
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1", padding: 48, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
            没有匹配的 Skill — <a onClick={() => onNew()} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>新增一个</a>
          </div>
        )}
      </div>

      {editing && (
        <SkillEditor
          skill={editing} departments={Departments}
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
    </div>
  );
}

function GovernancePage() {
  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__eyebrow">权限与治理</div>
        <h1 className="page-head__title">知识治理</h1>
        <p className="page-head__subtitle">权限隔离、来源追溯、知识质量、审计日志和模型 / 连接器管理。</p>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="可追溯回答率" value="68%" delta="+12pt" status="up" spark={[42,48,52,56,60,62,65,68]} color="#10b981" />
        <KpiCard label="知识质量(已审核)" value="83%" delta="+4pt" status="up" spark={[70,72,76,78,80,80,82,83]} color="var(--vel-indigo)" />
        <KpiCard label="禁用 / 过期源" value="42" delta="+8" status="down" spark={[28,30,33,35,38,40,41,42]} color="#f59e0b" />
        <KpiCard label="本月审计事件" value="186" delta="+24" status="up" spark={[120,140,150,160,170,178,182,186]} color="#7c3aed" />
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
    </div>
  );
}

Object.assign(window, { KnowledgePage, OkrPage, DepartmentsIndex, SkillsPage, GovernancePage, Modal, ConfirmModal, ProjectEditor, SkillEditor, SkillCard, makeId, HEALTH_OPTS });
