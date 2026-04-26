import React, { useState } from "react";
import { Icon, KpiCard, Progress, HealthPill } from "../components/primitives.jsx";
import { Company, KnowledgeSources, KnowledgeDomains } from "../data/seed.js";

export function KnowledgePage() {
  const [tab, setTab] = useState("sources");
  const [filter, setFilter] = useState("all");
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
        <KpiCard label="知识条目" value="1,247" delta="+38" status="up" spark={[1100, 1140, 1170, 1180, 1200, 1220, 1240, 1247]} color="var(--vel-indigo)" />
        <KpiCard label="本月引用次数" value="3,412" delta="+412" status="up" spark={[1800, 2100, 2400, 2600, 2800, 3000, 3200, 3412]} color="#10b981" />
        <KpiCard label="待审核" value="42" delta="+12" status="down" spark={[20, 22, 28, 30, 32, 38, 40, 42]} color="#f59e0b" />
        <KpiCard label="已禁用" value="18" delta="0" status="up" spark={[18, 18, 18, 18, 18, 18, 18, 18]} color="#94a3b8" />
      </div>

      <div className="tabs">
        {[
          { id: "sources", label: "知识来源", count: KnowledgeSources.length },
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
                    <td style={{ padding: "12px 14px" }}><button className="btn btn--text btn--sm"><Icon.MoreH size={14} /></button></td>
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
