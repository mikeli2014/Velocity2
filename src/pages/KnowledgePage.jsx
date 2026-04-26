import React, { useState } from "react";
import { Icon, KpiCard, Progress, HealthPill, Modal } from "../components/primitives.jsx";
import { Company, KnowledgeSources as SeedKnowledgeSources, KnowledgeDomains as SeedKnowledgeDomains, Projects, DecisionsRich, IngestQueueItems, INGEST_STATES } from "../data/seed.js";
import { useApi } from "../lib/api.js";

export function KnowledgePage() {
  const [tab, setTab] = useState("sources");
  const [filter, setFilter] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ingestItems, setIngestItems] = useState(() => IngestQueueItems.map(it => ({ ...it })));

  // Phase 2 step 1: knowledge sources come from the FastAPI backend.
  // When the API isn't reachable (dev without backend running, or initial
  // CI runs against a cold deploy) we fall back to the bundled seed so
  // the rest of the page keeps working.
  const { data: apiSources, loading: sourcesLoading, error: sourcesError } = useApi("/api/v1/knowledge-sources");
  const allSources = apiSources ?? SeedKnowledgeSources;
  const sources = filter === "all" ? allSources : allSources.filter(s => (s.scope || "").includes(filter));
  // Domains tab also reads from the API.
  const { data: apiDomains } = useApi("/api/v1/knowledge-domains");
  const KnowledgeDomains = apiDomains ?? SeedKnowledgeDomains;

  function pushIngestItem(it) {
    setIngestItems(prev => [it, ...prev]);
  }
  function patchIngestItem(id, patch) {
    setIngestItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  }

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
            <button className="btn btn--ghost btn--sm" onClick={() => setUploading({ mode: "url" })}><Icon.Globe size={14} /> 网络抓取</button>
            <button className="btn btn--primary btn--sm" onClick={() => setUploading({ mode: "file" })}><Icon.Upload size={14} /> 上传材料</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        <KpiCard label="知识条目" value="1,247" delta="+38" status="up" spark={[1100, 1140, 1170, 1180, 1200, 1220, 1240, 1247]} color="var(--vel-indigo)" />
        <KpiCard label="本月引用次数" value="3,412" delta="+412" status="up" spark={[1800, 2100, 2400, 2600, 2800, 3000, 3200, 3412]} color="#10b981" />
        <KpiCard label="待审核" value="42" delta="+12" status="down" spark={[20, 22, 28, 30, 32, 38, 40, 42]} color="#f59e0b" />
        <KpiCard label="已禁用" value="18" delta="0" status="up" spark={[18, 18, 18, 18, 18, 18, 18, 18]} color="#94a3b8" />
      </div>

      <div className="tabs">
        {[
          { id: "sources", label: "知识来源", count: allSources.length },
          { id: "domains", label: "知识域", count: KnowledgeDomains.length },
          { id: "graph", label: "知识图谱" },
          { id: "ingest", label: "采集队列", count: 6 },
          { id: "feedback", label: "反馈与质量" }
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
          </div>
        ))}
      </div>

      {tab === "sources" && (
        <div>
          <div className="row" style={{ marginBottom: 14, justifyContent: "space-between" }}>
            <div className="row" style={{ gap: 6 }}>
              {["all", "公司", "工业设计", "渠道运营", "服务部"].map(f => (
                <button key={f} className={`btn btn--sm ${filter === f ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilter(f)}>
                  {f === "all" ? "全部" : f}
                </button>
              ))}
              <SourcesDataState loading={sourcesLoading && !apiSources} error={sourcesError} />
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
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border-soft)", cursor: "pointer" }} onClick={() => setViewing(s)}>
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
                    <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn--text btn--sm" onClick={() => setViewing(s)} title="查看详情"><Icon.Eye size={14} /></button>
                    </td>
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
      {tab === "ingest" && (
        <IngestQueue
          items={ingestItems}
          onPatch={patchIngestItem}
        />
      )}
      {tab === "feedback" && <FeedbackPanel />}

      {viewing && <KnowledgeSourceDetail source={viewing} onClose={() => setViewing(null)} />}
      {uploading && (
        <KnowledgeUploadFlow
          mode={uploading.mode}
          onClose={() => setUploading(false)}
          onComplete={(item) => { pushIngestItem(item); setTab("ingest"); }}
        />
      )}
    </div>
  );
}

function KnowledgeSourceDetail({ source: s, onClose }) {
  const linkedProjects = (s.linkedProjects || []).map(id => Projects.find(p => p.id === id)).filter(Boolean);
  const linkedDecisions = (s.linkedDecisions || []).map(id => DecisionsRich.find(d => d.id === id)).filter(Boolean);
  return (
    <Modal
      title={s.title}
      sub={`${s.scope} · ${s.type} · ${s.size}`}
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>关闭</button>
        <button className="btn btn--ghost btn--sm"><Icon.Eye size={13} /> 在 RAG 中预览</button>
        <button className="btn btn--primary btn--sm"><Icon.Edit size={13} /> 编辑元数据</button>
      </>}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <HealthPill status={s.quality} />
        <span className="pill pill--neutral"><Icon.User size={10} /> {s.owner}</span>
        <span className="pill pill--neutral"><Icon.Calendar size={10} /> {s.updated}</span>
        <span className="pill pill--neutral"><Icon.Activity size={10} /> {s.uses} 次引用</span>
        {s.embeddings != null && <span className="pill pill--indigo"><Icon.Database size={10} /> {s.embeddings} 向量片段</span>}
        {s.lang && <span className="pill pill--neutral">{s.lang}</span>}
      </div>

      {s.summary && (
        <KSection icon={<Icon.Sparkles size={14} style={{ color: "var(--vel-indigo)" }} />} label="自动摘要">
          <div style={{ fontSize: 13, color: "var(--fg1)", lineHeight: 1.6, padding: "10px 12px", background: "var(--vel-indigo-50)", border: "1px solid var(--vel-indigo-100)", borderRadius: 8 }}>{s.summary}</div>
        </KSection>
      )}

      {s.excerpt && (
        <KSection icon={<Icon.Quote size={14} style={{ color: "var(--fg3)" }} />} label="关键片段">
          <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.7, padding: "12px 14px", background: "var(--slate-50)", borderRadius: 8, borderLeft: "3px solid var(--slate-300)" }}>{s.excerpt}</div>
        </KSection>
      )}

      {(s.tags || []).length > 0 && (
        <KSection icon={<Icon.Tag size={14} style={{ color: "var(--vel-violet)" }} />} label={`标签 (${s.tags.length})`}>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {s.tags.map(t => <span key={t} className="pill pill--neutral"><Icon.Hash size={10} /> {t}</span>)}
          </div>
        </KSection>
      )}

      {linkedProjects.length > 0 && (
        <KSection icon={<Icon.Layers size={14} style={{ color: "var(--success)" }} />} label={`被引用的关键项目 (${linkedProjects.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {linkedProjects.map(p => (
              <div key={p.id} className="row" style={{ gap: 10, padding: "8px 12px", background: "#fff", border: "1px solid var(--border-soft)", borderRadius: 8 }}>
                <span className={`dot dot--${p.health}`} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", flex: 1 }}>{p.name}</span>
                <span className="pill pill--indigo num">{p.okr}</span>
                <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{p.progress}%</span>
              </div>
            ))}
          </div>
        </KSection>
      )}

      {linkedDecisions.length > 0 && (
        <KSection icon={<Icon.Quote size={14} style={{ color: "var(--vel-violet)" }} />} label={`关联决策 (${linkedDecisions.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {linkedDecisions.map(d => (
              <div key={d.id} style={{ padding: "8px 12px", background: "#fff", border: "1px solid var(--border-soft)", borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{d.title}</div>
                <div className="row" style={{ gap: 12, marginTop: 4, fontSize: 11, color: "var(--fg3)" }}>
                  <span><Icon.User size={10} /> {d.owner}</span>
                  <span><Icon.Calendar size={10} /> {d.date}</span>
                </div>
              </div>
            ))}
          </div>
        </KSection>
      )}

      <KSection icon={<Icon.Cpu size={14} style={{ color: "var(--fg3)" }} />} label="处理元数据">
        <div className="grid grid-cols-2" style={{ gap: 10, fontSize: 12 }}>
          <KMeta label="文件类型" value={s.type} />
          <KMeta label="大小" value={s.size} />
          <KMeta label="页数" value={s.pages || "—"} />
          <KMeta label="语言" value={s.lang || "—"} />
          <KMeta label="上传者" value={s.uploadedBy || s.owner} />
          <KMeta label="向量片段" value={s.embeddings != null ? `${s.embeddings} 段` : "—"} />
        </div>
      </KSection>
    </Modal>
  );
}

function KSection({ icon, label, children }) {
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

function KMeta({ label, value }) {
  return (
    <div style={{ padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6 }}>
      <div style={{ fontSize: 10, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const UPLOAD_STAGES = [
  { id: "fetch",    label: "采集",   desc: "从源拉取或解析上传的文件" },
  { id: "parse",    label: "解析",   desc: "提取文本、表格与元数据" },
  { id: "summary",  label: "摘要",   desc: "AI 自动生成段落摘要与要点" },
  { id: "tag",      label: "打标签", desc: "识别业务标签 / 知识域" },
  { id: "embed",    label: "向量化", desc: "切片并写入向量库 (BGE-M3)" },
  { id: "review",   label: "待审核", desc: "进入人工审核或自动通过" }
];

function KnowledgeUploadFlow({ mode, onClose, onComplete }) {
  const [stage, setStage] = useState(0);
  const [title, setTitle] = useState(mode === "url" ? "https://" : "");
  const [scope, setScope] = useState("公司");
  const [domain, setDomain] = useState(SeedKnowledgeDomains[0].id);
  const [running, setRunning] = useState(false);
  const finished = stage >= UPLOAD_STAGES.length;

  function start() {
    setRunning(true);
    setStage(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setStage(i);
      if (i < UPLOAD_STAGES.length) setTimeout(tick, 700);
      else {
        setRunning(false);
        if (onComplete) {
          const detectedDomain = SeedKnowledgeDomains.find(d => d.id === domain);
          // Detect type from filename extension or url
          const lower = title.toLowerCase();
          const t = mode === "url" ? "URL"
            : lower.endsWith(".pdf") ? "PDF"
            : lower.endsWith(".docx") || lower.endsWith(".doc") ? "DOC"
            : lower.endsWith(".xlsx") || lower.endsWith(".xls") ? "XLSX"
            : lower.endsWith(".pptx") || lower.endsWith(".ppt") ? "PPT"
            : lower.endsWith(".txt") || lower.endsWith(".md") ? "TXT"
            : "FILE";
          onComplete({
            id: `iq-${Date.now().toString(36)}`,
            name: title.trim() || "(未命名)",
            type: t,
            size: "—",
            state: "review",
            progress: 100,
            scope,
            owner: "当前用户",
            uploaded: "刚刚",
            error: null,
            domain: detectedDomain?.name
          });
        }
      }
    };
    setTimeout(tick, 700);
  }

  return (
    <Modal
      title={mode === "url" ? "网络抓取 — 添加来源" : "上传材料 — 添加来源"}
      sub="材料会经过解析、摘要、标签、向量化和质量审核,完成后进入公司知识中心。"
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>{finished ? "完成" : "取消"}</button>
        {!finished && (
          <button
            className="btn btn--primary btn--sm"
            disabled={running || !title.trim()}
            style={(running || !title.trim()) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            onClick={start}
          >
            <Icon.PlayCircle size={13} /> {running ? "处理中…" : "开始处理"}
          </button>
        )}
      </>}
    >
      {!running && stage === 0 && (
        <>
          <div className="field">
            <label className="field__label">{mode === "url" ? "URL" : "文件"}</label>
            {mode === "url"
              ? <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="https://aowei.com/report/2026q1" />
              : (
                <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 28, textAlign: "center", color: "var(--fg3)" }}>
                  <Icon.Upload size={28} style={{ margin: "0 auto 8px", color: "var(--fg4)" }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>拖入或点击选择文件</div>
                  <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 4 }}>支持 PDF / DOCX / PPTX / XLSX / TXT / MD / 图集</div>
                  <input
                    type="text"
                    placeholder="或输入文件名(模拟)"
                    className="input"
                    style={{ marginTop: 12, maxWidth: 320 }}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
              )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label className="field__label">范围 (Scope)</label>
              <select className="select" value={scope} onChange={e => setScope(e.target.value)}>
                <option value="公司">公司级 (全员)</option>
                <option value="工业设计">工业设计部</option>
                <option value="服务部">服务部</option>
                <option value="渠道运营">渠道运营 (COP)</option>
                <option value="供应链">供应链</option>
                <option value="市场部">市场部</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label">归属知识域</label>
              <select className="select" value={domain} onChange={e => setDomain(e.target.value)}>
                {SeedKnowledgeDomains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <Icon.Workflow size={14} style={{ color: "var(--vel-indigo)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>处理流程</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {UPLOAD_STAGES.map((st, i) => {
            const done = stage > i;
            const active = stage === i && running;
            return (
              <div key={st.id} style={{
                display: "grid", gridTemplateColumns: "26px 1fr 110px",
                gap: 10, alignItems: "center",
                padding: "10px 12px",
                background: done ? "#DCFCE7" : active ? "var(--vel-indigo-50)" : "var(--slate-50)",
                border: "1px solid " + (done ? "#86EFAC" : active ? "var(--vel-indigo-100)" : "var(--border-soft)"),
                borderRadius: 8
              }}>
                {done
                  ? <Icon.Check size={14} style={{ color: "var(--success)" }} />
                  : active
                    ? <span className="dot dot--info" style={{ display: "inline-block", animation: "pulse-ring 1.6s ease-out infinite" }} />
                    : <span className="num" style={{ fontSize: 11, color: "var(--fg4)", fontWeight: 800 }}>{String(i + 1).padStart(2, "0")}</span>}
                <div>
                  <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 600 }}>{st.label}</div>
                  <div style={{ fontSize: 11, color: "var(--fg3)" }}>{st.desc}</div>
                </div>
                <span className={`pill ${done ? "pill--ok" : active ? "pill--info" : "pill--neutral"}`}>
                  {done ? "完成" : active ? "进行中" : "待执行"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {finished && (
        <div style={{ padding: "12px 14px", background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 8 }}>
          <div className="row" style={{ gap: 8, marginBottom: 4 }}>
            <Icon.Check size={14} style={{ color: "var(--success)" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>处理完成 · 已加入知识中心</div>
          </div>
          <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
            来源 <strong>"{title}"</strong> 已切分为约 96 个向量片段,自动生成 4 个标签,关联到 <strong>{SeedKnowledgeDomains.find(d => d.id === domain)?.name}</strong>。质量状态:待审核。
          </div>
        </div>
      )}
    </Modal>
  );
}

function KnowledgeGraph() {
  const cx = 360, cy = 220;
  const domains = SeedKnowledgeDomains.slice(0, 8).map((d, i) => {
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
          <radialGradient id="cglow"><stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" /><stop offset="100%" stopColor="#4F46E5" stopOpacity="0" /></radialGradient>
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
            <text x={d.x} y={d.y - 1} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">{d.name.split(" ")[0].slice(0, 4)}</text>
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

function IngestQueue({ items, onPatch }) {
  const [filter, setFilter] = useState("all");
  const update = onPatch;

  function approve(id) { update(id, { state: "approved", progress: 100 }); }
  function reject(id)  { update(id, { state: "rejected" }); }
  function retry(id)   { update(id, { state: "fetching", progress: 5, error: null }); }

  const counts = INGEST_STATES.reduce((acc, s) => {
    acc[s.v] = items.filter(it => it.state === s.v).length;
    return acc;
  }, {});
  const filtered = filter === "all" ? items : items.filter(it => it.state === filter);

  const reviewBg = (st) => st === "approved" ? "#DCFCE7" : st === "rejected" ? "#FEE2E2" : st === "failed" ? "#FEE2E2" : "transparent";

  return (
    <div>
      <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <button className={`btn btn--sm ${filter === "all" ? "btn--primary" : "btn--ghost"}`} onClick={() => setFilter("all")}>全部 ({items.length})</button>
        {INGEST_STATES.map(s => (
          counts[s.v] > 0 ? (
            <button
              key={s.v}
              className={`btn btn--sm ${filter === s.v ? "btn--primary" : "btn--ghost"}`}
              style={filter === s.v ? { background: s.color, borderColor: s.color } : undefined}
              onClick={() => setFilter(s.v)}
            >{s.label} ({counts[s.v]})</button>
          ) : null
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 && (
          <div style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>当前筛选下没有条目</div>
        )}
        {filtered.map((it, i) => {
          const stateMeta = INGEST_STATES.find(s => s.v === it.state) || INGEST_STATES[0];
          const isReview = it.state === "review";
          const isFailed = it.state === "failed";
          const isTerminal = it.state === "approved" || it.state === "rejected";
          return (
            <div key={it.id} style={{
              padding: "14px 18px",
              borderTop: i ? "1px solid var(--border-soft)" : "none",
              background: reviewBg(it.state)
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 200px 60px auto", gap: 14, alignItems: "center" }}>
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <Icon.File size={15} style={{ color: "var(--fg3)" }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>
                      {it.scope} · {it.owner} · {it.uploaded}{it.size !== "—" ? ` · ${it.size}` : ""}
                    </div>
                  </div>
                </div>
                <span className="pill" style={{ background: stateMeta.color + "20", color: stateMeta.color, fontWeight: 600 }}>{stateMeta.label}</span>
                <Progress value={it.progress} status={isReview ? "warn" : isFailed ? "danger" : it.state === "approved" ? "ok" : "info"} />
                <span className="num" style={{ fontSize: 12, color: "var(--fg2)", textAlign: "right" }}>{it.progress}%</span>
                <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                  {isReview && (
                    <>
                      <button className="btn btn--ghost btn--sm" onClick={() => reject(it.id)}><Icon.X size={12} /> 拒绝</button>
                      <button className="btn btn--primary btn--sm" onClick={() => approve(it.id)}><Icon.Check size={12} /> 入库</button>
                    </>
                  )}
                  {isFailed && (
                    <button className="btn btn--ghost btn--sm" onClick={() => retry(it.id)}><Icon.RefreshCw size={12} /> 重试</button>
                  )}
                  {isTerminal && <span style={{ fontSize: 11, color: "var(--fg4)" }}>{it.state === "approved" ? "已入库" : "已拒绝"}</span>}
                </div>
              </div>
              {it.error && (
                <div style={{ marginTop: 8, padding: "8px 10px", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 6, fontSize: 12, color: "#B91C1C" }}>
                  <Icon.AlertTriangle size={11} style={{ verticalAlign: "-2px" }} /> {it.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
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

function SourcesDataState({ loading, error }) {
  if (loading) {
    return (
      <span className="pill pill--neutral" title="正在从后端加载">
        <Icon.RefreshCw size={11} style={{ animation: "spin 1.2s linear infinite" }} />
        加载中…
      </span>
    );
  }
  if (error) {
    return (
      <span
        className="pill pill--warn"
        title={`API 调用失败:${error.message}\n已回退到本地 seed.js 数据。`}
      >
        <Icon.AlertTriangle size={11} /> 离线模式 (seed)
      </span>
    );
  }
  return (
    <span className="pill pill--ok" title="数据来自 /api/v1/knowledge-sources">
      <Icon.Cloud size={11} /> 已连接 API
    </span>
  );
}
