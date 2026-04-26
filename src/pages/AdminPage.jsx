import React, { useState, useMemo } from "react";
import { Icon, KpiCard, Avatar, Progress } from "../components/primitives.jsx";
import { OrgTree, LLMs, PolicyRouting, DeptUsage, TopUsers } from "../data/seed.js";

export function AdminPage() {
  const [tab, setTab] = useState("usage");
  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">管理后台 · Admin Console</div>
            <h1 className="page-head__title">Velocity 控制台</h1>
            <p className="page-head__subtitle">配置组织结构、模型路由策略、Token 配额、连接器,以及全公司的 AI 使用画像。</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.RefreshCw size={13} /> 同步 HRIS</button>
            <button className="btn btn--ghost btn--sm"><Icon.FileText size={13} /> 导出账单</button>
            <button className="btn btn--primary btn--sm"><Icon.Save size={13} /> 保存策略</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        {[
          { id: "usage", label: "Token 用量", icon: "BarChart" },
          { id: "models", label: "模型与路由", icon: "Cpu" },
          { id: "org", label: "组织结构", icon: "Network" },
          { id: "quota", label: "配额与预算", icon: "Coins" },
          { id: "audit", label: "审计与日志", icon: "FileText" }
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {React.createElement(Icon[t.icon], { size: 13 })}
              {t.label}
            </span>
          </div>
        ))}
      </div>

      {tab === "usage" && <UsageDashboard />}
      {tab === "models" && <ModelsPanel />}
      {tab === "org" && <OrgPanel />}
      {tab === "quota" && <QuotaPanel />}
      {tab === "audit" && <AuditPanel />}
    </div>
  );
}

function UsageDashboard() {
  const [range, setRange] = useState("month");
  const ranges = [
    { id: "today", label: "今日" },
    { id: "week", label: "本周" },
    { id: "month", label: "本月" },
    { id: "quarter", label: "本季度" },
    { id: "year", label: "本年度 (FY26)" }
  ];

  const series = useMemo(() => {
    if (range === "today") return [4.2, 5.1, 4.8, 6.2, 8.4, 12.6, 18.4, 22.8, 26.4, 28.2, 30.4, 32.8, 28.6, 24.2, 18.8, 14.2, 10.6, 8.4, 6.2, 4.8, 3.6, 2.8, 2.2, 1.8];
    if (range === "week") return [82, 124, 138, 142, 156, 88, 42];
    if (range === "month") return [14, 18, 22, 24, 28, 12, 6, 16, 21, 26, 28, 31, 14, 8, 18, 24, 27, 30, 32, 14, 9, 19, 25, 29, 33, 35, 16, 10, 21, 28];
    if (range === "quarter") return [186, 218, 240, 268, 282, 296, 312, 324, 348, 362, 384, 412];
    return [820, 940, 1124, 1268, 1412, 1568, 1684, 1820, 1962, 2104, 2248, 2412];
  }, [range]);

  const labels = useMemo(() => {
    if (range === "today") return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
    if (range === "week") return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    if (range === "month") return Array.from({ length: 30 }, (_, i) => `${i + 1}日`);
    if (range === "quarter") return ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    return ["FY25-Q1", "Q2", "Q3", "Q4", "FY26-Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"];
  }, [range]);

  const totalTokens = series.reduce((a, b) => a + b, 0);
  const totalCost = Math.round(totalTokens * 0.32);

  return (
    <div>
      <div className="row" style={{ gap: 6, marginBottom: 16 }}>
        {ranges.map(r => (
          <button key={r.id} className={`btn btn--sm ${range === r.id ? "btn--primary" : "btn--ghost"}`} onClick={() => setRange(r.id)}>
            {r.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span className="pill pill--ok"><span className="dot dot--ok" style={{ marginRight: 4 }} />实时计费</span>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="总 Tokens (输入)" value={`${(totalTokens * 4.8).toFixed(1)}M`} delta="+18.4%" status="up" spark={series.slice(-8)} color="var(--vel-indigo)" />
        <KpiCard label="总 Tokens (输出)" value={`${(totalTokens * 0.62).toFixed(1)}M`} delta="+22.1%" status="up" spark={series.slice(-8).map(v => v * 0.6)} color="#10b981" />
        <KpiCard label="API 调用次数" value={`${(totalTokens * 18.4).toFixed(0).slice(0, -3)}K`} delta="+12.8%" status="up" spark={series.slice(-8).map(v => v * 1.2)} color="#7c3aed" />
        <KpiCard label="实际花费" value={`¥${(totalCost / 100).toFixed(2)}万`} delta="+¥1.2万" status="up" spark={series.slice(-8).map(v => v * 0.32)} color="#f59e0b" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card__head">
            <div className="card__title"><Icon.Activity size={14} style={{ color: "var(--vel-indigo)" }} /> Token 消耗趋势 · {ranges.find(r => r.id === range).label}</div>
            <div className="row" style={{ gap: 10, fontSize: 11, color: "var(--fg3)" }}>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: "#4F46E5", marginRight: 4 }} />输入</span>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: "#10b981", marginRight: 4 }} />输出</span>
            </div>
          </div>
          <div style={{ padding: 22 }}><UsageChart data={series} labels={labels} /></div>
        </div>

        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Cpu size={14} style={{ color: "#7c3aed" }} /> 按模型分布</div></div>
          <div style={{ padding: 18 }}>
            {[
              { name: "Claude Sonnet 4.5", pct: 42, tokens: "286M", cost: "¥4.2万", color: "#4F46E5" },
              { name: "Claude Haiku 4.5", pct: 24, tokens: "164M", cost: "¥0.8万", color: "#10b981" },
              { name: "DeepSeek V3.2", pct: 14, tokens: "96M", cost: "¥0.2万", color: "#0891b2" },
              { name: "Claude Opus 4.1", pct: 8, tokens: "54M", cost: "¥3.8万", color: "#7c3aed" },
              { name: "通义千问 3 Max", pct: 6, tokens: "42M", cost: "¥0.6万", color: "#ea580c" },
              { name: "豆包 Pro / 其他", pct: 4, tokens: "28M", cost: "¥0.3万", color: "#f59e0b" },
              { name: "私有 LLaMA-70B", pct: 2, tokens: "12M", cost: "¥0", color: "#475569" }
            ].map((m, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{m.name}</span>
                  <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{m.tokens} · {m.cost}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: "var(--slate-100)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 99 }} />
                  </div>
                  <span className="num" style={{ fontSize: 11, color: "var(--fg2)", width: 32, textAlign: "right" }}>{m.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card__head">
          <div className="card__title"><Icon.Layers size={14} style={{ color: "#0D7A3F" }} /> 按部门 · {ranges.find(r => r.id === range).label}</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--slate-50)" }}>
            <tr style={{ textAlign: "left" }}>
              {["部门", "活跃用户", "调用次数", "输入 Tokens", "输出 Tokens", "用量分布", "主用模型", "成本", "高峰时段"].map(h => (
                <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border-soft)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DeptUsage.map(d => {
              const maxIn = Math.max(...DeptUsage.map(x => x.input));
              return (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                      <strong style={{ color: "var(--fg1)" }}>{d.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }} className="num">{d.users}</td>
                  <td style={{ padding: "12px 14px" }} className="num">{d.calls.toLocaleString()}</td>
                  <td style={{ padding: "12px 14px" }} className="num"><strong style={{ color: "var(--fg1)" }}>{d.input}</strong>M</td>
                  <td style={{ padding: "12px 14px" }} className="num">{d.output}M</td>
                  <td style={{ padding: "12px 14px", width: 140 }}>
                    <div style={{ height: 6, background: "var(--slate-100)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${(d.input / maxIn) * 100}%`, height: "100%", background: d.color, borderRadius: 99 }} />
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {d.note === "本地模型" ? <span className="pill pill--neutral">私有 LLaMA</span> : <span className="pill pill--indigo">Sonnet 4.5</span>}
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }} className="num">{d.cost === 0 ? <span style={{ color: "var(--fg4)" }}>—</span> : `¥${d.cost.toLocaleString()}`}</td>
                  <td style={{ padding: "12px 14px", color: "var(--fg3)", fontSize: 12 }}>{d.peak}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Users size={14} /> 高频用户 Top 8</div><span className="pill pill--ghost">本月</span></div>
          <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
            <thead style={{ background: "var(--slate-50)" }}>
              <tr style={{ textAlign: "left" }}>
                {["#", "用户", "部门", "调用", "Tokens", "成本", "高频问题"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", fontSize: 10.5, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TopUsers.map((u, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "10px 14px", color: "var(--fg4)", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar name={u.name} size={24} />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--fg1)" }}>{u.name}</div>
                        <div style={{ fontSize: 10.5, color: "var(--fg3)" }}>{u.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--fg2)" }}>{u.dept}</td>
                  <td style={{ padding: "10px 14px" }} className="num">{u.calls}</td>
                  <td style={{ padding: "10px 14px" }} className="num"><strong>{u.tokens}</strong>M</td>
                  <td style={{ padding: "10px 14px" }} className="num">{u.cost === 0 ? "—" : `¥${u.cost}`}</td>
                  <td style={{ padding: "10px 14px", color: "var(--fg3)", fontSize: 11.5 }}>"{u.top}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Calendar size={14} /> 7×24 调用热力图</div><span className="pill pill--ghost">最近 4 周</span></div>
          <div style={{ padding: 18 }}>
            <Heatmap />
            <div className="row" style={{ justifyContent: "space-between", marginTop: 12, fontSize: 11, color: "var(--fg3)" }}>
              <span>峰值: 周一 10:00 (4,820 调用/小时)</span>
              <div className="row" style={{ gap: 4 }}>
                <span>低</span>
                {[0.1, 0.25, 0.4, 0.6, 0.85].map(o => <div key={o} style={{ width: 12, height: 12, background: `rgba(79,70,229,${o})`, borderRadius: 2 }} />)}
                <span>高</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageChart({ data, labels }) {
  const w = 800, h = 240, pad = 32;
  const max = Math.max(...data) * 1.15;
  const sx = i => pad + (i / (data.length - 1)) * (w - pad * 2);
  const sy = v => h - pad - (v / max) * (h - pad * 2);
  const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(v)}`).join(" ");
  const areaPath = `${linePath} L ${sx(data.length - 1)} ${h - pad} L ${sx(0)} ${h - pad} Z`;
  const outData = data.map(v => v * 0.6);
  const outPath = outData.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(v)}`).join(" ");
  const outArea = `${outPath} L ${sx(outData.length - 1)} ${h - pad} L ${sx(0)} ${h - pad} Z`;
  const peakIdx = data.indexOf(Math.max(...data));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 240 }}>
      <defs>
        <linearGradient id="ingrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="outgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={pad} y1={sy(max * t)} x2={w - pad} y2={sy(max * t)} stroke="#e2e8f0" strokeDasharray="2 4" />
          <text x={pad - 6} y={sy(max * t) + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono">{(max * t).toFixed(0)}M</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#ingrad)" />
      <path d={linePath} fill="none" stroke="#4F46E5" strokeWidth="2" />
      <path d={outArea} fill="url(#outgrad)" />
      <path d={outPath} fill="none" stroke="#10b981" strokeWidth="2" />
      {data.map((v, i) => i % Math.ceil(data.length / 8) === 0 && (
        <text key={i} x={sx(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">{labels[i]}</text>
      ))}
      <circle cx={sx(peakIdx)} cy={sy(data[peakIdx])} r="4" fill="#4F46E5" />
      <circle cx={sx(peakIdx)} cy={sy(data[peakIdx])} r="8" fill="#4F46E5" opacity="0.2" />
      <rect x={sx(peakIdx) - 44} y={sy(data[peakIdx]) - 32} width="88" height="22" rx="4" fill="#0F172A" />
      <text x={sx(peakIdx)} y={sy(data[peakIdx]) - 17} textAnchor="middle" fontSize="10" fill="#fff" fontFamily="JetBrains Mono" fontWeight="700">峰值 {data[peakIdx]}M</text>
    </svg>
  );
}

function Heatmap() {
  const days = ["一", "二", "三", "四", "五", "六", "日"];
  const seed = (d, h) => {
    if (d >= 5) return Math.max(0, Math.sin(d + h) * 0.2 + 0.1);
    if (h < 8 || h > 19) return Math.max(0, Math.sin(d * h) * 0.2 + 0.05);
    const peak = h >= 9 && h <= 18 ? 1 : 0.5;
    return Math.min(1, peak * (0.6 + Math.sin(d + h * 0.3) * 0.3));
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto repeat(24, 1fr)", gap: 2, fontSize: 9, fontFamily: "JetBrains Mono" }}>
      <div></div>
      {Array.from({ length: 24 }, (_, h) => (
        <div key={h} style={{ textAlign: "center", color: "var(--fg4)", fontSize: 8 }}>{h % 6 === 0 ? h : ""}</div>
      ))}
      {days.map((d, di) => (
        <React.Fragment key={di}>
          <div style={{ color: "var(--fg3)", fontSize: 10, padding: "2px 6px 2px 0", textAlign: "right" }}>周{d}</div>
          {Array.from({ length: 24 }, (_, h) => {
            const v = seed(di, h);
            return <div key={h} title={`周${d} ${h}:00 — ${(v * 4820).toFixed(0)} 调用`}
              style={{ aspectRatio: "1", background: `rgba(79,70,229,${v.toFixed(2)})`, borderRadius: 2, minHeight: 14 }} />;
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function ModelsPanel() {
  const cat = { frontier: { label: "旗舰", color: "#7c3aed" }, balanced: { label: "均衡", color: "#4F46E5" }, fast: { label: "快速", color: "#10b981" }, private: { label: "本地私有", color: "#475569" }, embedding: { label: "嵌入", color: "#f59e0b" } };
  return (
    <div>
      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="已启用模型" value="9" delta="+1" status="up" spark={[6, 7, 7, 8, 8, 8, 9, 9]} color="#4F46E5" />
        <KpiCard label="路由策略" value="6" delta="0" status="up" spark={[6, 6, 6, 6, 6, 6, 6, 6]} color="#10b981" />
        <KpiCard label="平均响应延迟" value="1.2s" delta="-0.3s" status="up" spark={[1.8, 1.6, 1.5, 1.4, 1.4, 1.3, 1.2, 1.2]} color="#7c3aed" />
        <KpiCard label="本地模型占比" value="14%" delta="+4pt" status="up" spark={[8, 9, 10, 11, 12, 13, 14, 14]} color="#475569" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card__head">
          <div className="card__title"><Icon.GitBranch size={14} /> 路由策略 · 决定每类请求使用哪个模型</div>
          <button className="btn btn--ghost btn--sm"><Icon.Plus size={13} /> 新增规则</button>
        </div>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--slate-50)" }}>
            <tr style={{ textAlign: "left" }}>
              {["场景", "首选模型", "回退", "原因", ""].map(h => <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {PolicyRouting.map((r, i) => {
              const m = LLMs.find(l => l.id === r.primary);
              const f = LLMs.find(l => l.id === r.fallback);
              return (
                <tr key={i} style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>{r.scope}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: cat[m.category].color }} />
                      <span style={{ fontWeight: 600, color: "var(--fg1)" }}>{m.name}</span>
                      <span className="pill" style={{ background: cat[m.category].color + "15", color: cat[m.category].color }}>{cat[m.category].label}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{f ? f.name : <span style={{ color: "var(--fg4)" }}>—</span>}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--fg3)" }}>{r.reason}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}><button className="btn btn--text btn--sm">编辑</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>模型目录 ({LLMs.length})</div>
        <button className="btn btn--primary btn--sm"><Icon.Plus size={13} /> 接入新模型</button>
      </div>
      <div className="grid grid-cols-3">
        {LLMs.map(m => (
          <div key={m.id} className="card" style={{ padding: 18, position: "relative" }}>
            {m.default && <span className="pill pill--ok" style={{ position: "absolute", top: 14, right: 14 }}>★ 默认</span>}
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: cat[m.category].color + "18", color: cat[m.category].color, display: "grid", placeItems: "center" }}>
                <Icon.Cpu size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--fg3)" }}>{m.vendor}</div>
              </div>
            </div>
            <div className="row" style={{ gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
              <span className="pill" style={{ background: cat[m.category].color + "15", color: cat[m.category].color }}>{cat[m.category].label}</span>
              {m.status === "active" ? <span className="pill pill--ok">运行中</span> : <span className="pill pill--neutral">备用</span>}
              <span className="pill pill--ghost">{m.ctx} ctx</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg3)", marginBottom: 12, padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6 }}>
              {m.uses}
            </div>
            <div className="row" style={{ justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-soft)" }}>
              <div style={{ fontSize: 11, color: "var(--fg3)" }}>
                输入 <strong className="num" style={{ color: "var(--fg1)" }}>¥{m.inputCost}</strong>/M · 输出 <strong className="num" style={{ color: "var(--fg1)" }}>¥{m.outputCost}</strong>/M
              </div>
              <button className="btn btn--text btn--sm">配置 →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrgPanel() {
  const [selected, setSelected] = useState("industrial-design");
  const [expanded, setExpanded] = useState(new Set(["company", "rd", "go", "ops", "back"]));
  const toggle = id => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };
  const findNode = (n, id) => {
    if (n.id === id) return n;
    for (const c of n.children || []) {
      const found = findNode(c, id);
      if (found) return found;
    }
    return null;
  };
  const sel = findNode(OrgTree, selected) || OrgTree;

  return (
    <div>
      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="组织节点" value="38" delta="+2" status="up" spark={[32, 34, 35, 36, 36, 37, 37, 38]} color="#4F46E5" />
        <KpiCard label="部门数" value="14" delta="+1" status="up" spark={[12, 13, 13, 13, 14, 14, 14, 14]} color="#7c3aed" />
        <KpiCard label="活跃用户" value="1,128" delta="+182" status="up" spark={[640, 720, 810, 870, 920, 990, 1040, 1128]} color="#10b981" />
        <KpiCard label="覆盖率" value="9.1%" delta="+1.5pt" status="up" spark={[6, 6.4, 7, 7.4, 8, 8.4, 8.8, 9.1]} color="#f59e0b" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: 20 }}>
        <div className="card">
          <div className="card__head">
            <div className="card__title"><Icon.Network size={14} /> 组织结构树</div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn btn--ghost btn--sm"><Icon.RefreshCw size={12} /> 同步 SAP HR</button>
              <button className="btn btn--primary btn--sm"><Icon.Plus size={12} /> 新增</button>
            </div>
          </div>
          <div style={{ padding: "14px 0", maxHeight: 540, overflow: "auto" }} className="scroll">
            <OrgNode node={OrgTree} depth={0} selected={selected} setSelected={setSelected} expanded={expanded} toggle={toggle} />
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div className="card__title">
              {sel.type === "company" && <Icon.Building size={14} />}
              {sel.type === "center" && <Icon.Boxes size={14} />}
              {sel.type === "dept" && <Icon.Layers size={14} />}
              {sel.type === "team" && <Icon.Users size={14} />}
              {sel.name}
            </div>
            <span className="pill pill--neutral">
              {sel.type === "company" ? "集团" : sel.type === "center" ? "中心" : sel.type === "dept" ? "部门" : "团队"}
            </span>
          </div>
          <div style={{ padding: 22 }}>
            <div className="grid grid-cols-2" style={{ gap: 14, marginBottom: 22 }}>
              <Field label="负责人" value={sel.head} />
              <Field label="人数" value={sel.people?.toLocaleString() + " 人"} />
              <Field label="层级" value={["集团", "中心", "部门", "团队"][["company", "center", "dept", "team"].indexOf(sel.type)]} />
              <Field label="子节点" value={(sel.children?.length || 0) + " 个"} />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>AI 配置(继承自父节点)</div>
            <div style={{ background: "var(--slate-50)", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <ConfigRow icon="Cpu" label="默认模型" value="Claude Sonnet 4.5" override={sel.id === "finance" ? "私有 LLaMA-70B" : null} />
              <ConfigRow icon="Coins" label="月度预算" value="¥12,000" override={sel.type === "dept" ? "¥3,200" : null} />
              <ConfigRow icon="Database" label="知识范围" value="集团 + 中心 + 部门" />
              <ConfigRow icon="Shield" label="数据策略" value={sel.id === "finance" || sel.id === "hr" ? "数据不出域 (仅本地)" : "标准"} />
              <ConfigRow icon="MessageCircle" label="助手" value={sel.id === "industrial-design" ? "🦞 小龙虾" : "继承父级"} />
            </div>

            {sel.children && sel.children.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>下级节点</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {sel.children.map(c => (
                    <div key={c.id} onClick={() => setSelected(c.id)}
                      style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--vel-indigo-50)", color: "var(--vel-indigo-700)", display: "grid", placeItems: "center" }}>
                        {c.type === "team" ? <Icon.Users size={12} /> : <Icon.Layers size={12} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "var(--fg3)" }}>{c.head}</div>
                      </div>
                      <span className="num" style={{ fontSize: 11, color: "var(--fg2)" }}>{c.people} 人</span>
                      <span className="pill pill--neutral">{c.type === "team" ? "团队" : c.type === "dept" ? "部门" : "中心"}</span>
                      <Icon.Chevron size={14} style={{ color: "var(--fg4)" }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgNode({ node, depth, selected, setSelected, expanded, toggle }) {
  const isOpen = expanded.has(node.id);
  const isSel = selected === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const typeIcon = { company: "Building", center: "Boxes", dept: "Layers", team: "Users" }[node.type];
  const typeColor = { company: "#7c3aed", center: "#4F46E5", dept: "#0D7A3F", team: "#0891b2" }[node.type];

  return (
    <>
      <div onClick={() => setSelected(node.id)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 10px", paddingLeft: 12 + depth * 18,
          fontSize: 13, cursor: "pointer",
          background: isSel ? "var(--vel-indigo-50)" : "transparent",
          borderLeft: isSel ? "2px solid var(--vel-indigo)" : "2px solid transparent",
          color: isSel ? "var(--vel-indigo-700)" : "var(--fg1)"
        }}>
        {hasChildren ? (
          <button onClick={e => { e.stopPropagation(); toggle(node.id); }} style={{ width: 16, height: 16, color: "var(--fg3)" }}>
            <Icon.Chevron size={11} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>
        ) : <span style={{ width: 16 }} />}
        <div style={{ width: 22, height: 22, borderRadius: 5, background: typeColor + "15", color: typeColor, display: "grid", placeItems: "center", flexShrink: 0 }}>
          {React.createElement(Icon[typeIcon], { size: 11 })}
        </div>
        <span style={{ fontWeight: isSel ? 700 : node.type === "company" ? 700 : 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
        <span className="num" style={{ fontSize: 10.5, color: "var(--fg4)" }}>{node.people?.toLocaleString()}</span>
      </div>
      {hasChildren && isOpen && node.children.map(c => (
        <OrgNode key={c.id} node={c} depth={depth + 1} selected={selected} setSelected={setSelected} expanded={expanded} toggle={toggle} />
      ))}
    </>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--fg1)", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ConfigRow({ icon, label, value, override }) {
  return (
    <div className="row" style={{ gap: 10, justifyContent: "space-between" }}>
      <div className="row" style={{ gap: 8, color: "var(--fg2)", fontSize: 12 }}>
        {React.createElement(Icon[icon], { size: 13 })}
        {label}
      </div>
      <div className="row" style={{ gap: 8 }}>
        {override && <span className="pill pill--warn">本地覆盖</span>}
        <div style={{ fontSize: 12.5, color: "var(--fg1)", fontWeight: 600 }}>{override || value}</div>
      </div>
    </div>
  );
}

function QuotaPanel() {
  const quotas = [
    { name: "集团 (合计)", used: 6840, budget: 9000 },
    { name: "增长中心", used: 3186, budget: 3500 },
    { name: "  └ 服务部", used: 2218, budget: 2400 },
    { name: "  └ 渠道运营部", used: 844, budget: 1100 },
    { name: "研发中心", used: 1462, budget: 2200 },
    { name: "  └ 工业设计部", used: 962, budget: 1500 },
    { name: "  └ 净水研究院", used: 388, budget: 600 },
    { name: "运营中心", used: 482, budget: 1200 },
    { name: "后台中心", used: 1710, budget: 2100 }
  ];
  return (
    <div>
      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="本月预算" value="¥9.0万" delta="+10%" status="up" spark={[6, 6.5, 7, 7.5, 8, 8.5, 9, 9]} color="#4F46E5" />
        <KpiCard label="已使用" value="¥6.84万" delta="76%" status="up" spark={[20, 28, 38, 46, 55, 62, 70, 76]} color="#10b981" />
        <KpiCard label="预测月底" value="¥9.42万" delta="超 4.7%" status="down" spark={[8, 8.4, 8.7, 8.9, 9.1, 9.2, 9.35, 9.42]} color="#f59e0b" />
        <KpiCard label="高警戒部门" value="2" delta="+1" status="down" spark={[1, 1, 1, 1, 1, 2, 2, 2]} color="#ef4444" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card__head">
          <div className="card__title"><Icon.Coins size={14} /> 预算与使用 (本月)</div>
          <button className="btn btn--ghost btn--sm"><Icon.Edit size={12} /> 调整预算</button>
        </div>
        <div style={{ padding: "8px 0" }}>
          {quotas.map((q, i) => {
            const pct = (q.used / q.budget) * 100;
            const isSub = q.name.startsWith("  ");
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "minmax(0,2fr) 80px 80px minmax(0,3fr) 60px",
                gap: 14, alignItems: "center",
                padding: "11px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none",
                background: isSub ? "var(--slate-50)" : "transparent"
              }}>
                <div style={{ fontSize: 13, fontWeight: isSub ? 500 : 700, color: isSub ? "var(--fg2)" : "var(--fg1)", paddingLeft: isSub ? 14 : 0 }}>{q.name.trim()}</div>
                <div className="num" style={{ fontSize: 12, color: "var(--fg2)", textAlign: "right" }}>¥{q.used.toLocaleString()}</div>
                <div className="num" style={{ fontSize: 12, color: "var(--fg3)", textAlign: "right" }}>/ ¥{q.budget.toLocaleString()}</div>
                <Progress value={pct} status={pct > 90 ? "danger" : pct > 75 ? "warn" : "ok"} />
                <div className="num" style={{ fontSize: 12, fontWeight: 700, color: pct > 90 ? "var(--danger-text)" : pct > 75 ? "var(--warning-text)" : "var(--success-text)", textAlign: "right" }}>{pct.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="card__title" style={{ marginBottom: 14 }}><Icon.Settings size={14} /> 配额规则</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "默认人均月配额", value: "5,000 次调用 / 200K tokens" },
              { label: "超限策略", value: "降级到 Haiku · 通知部门负责人" },
              { label: "免计费模型", value: "私有 LLaMA-70B、BGE-M3 嵌入" },
              { label: "成本对账", value: "每月 1 日生成账单,推送至财务部" },
              { label: "异常告警阈值", value: "单用户单日 > ¥200 / 单部门日环比 +200%" }
            ].map((r, i) => (
              <div key={i} className="row" style={{ justifyContent: "space-between", paddingBottom: 14, borderBottom: i < 4 ? "1px solid var(--border-soft)" : "none" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{r.value}</div>
                </div>
                <button className="btn btn--text btn--sm">编辑</button>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="card__title" style={{ marginBottom: 14 }}><Icon.AlertTriangle size={14} /> 近期超限事件</div>
          {[
            { who: "服务部 · 售后小组", when: "今天 14:32", msg: "单日花费已达 ¥412,触发 200% 环比告警", level: "warn" },
            { who: "李欣 · 净水产品组", when: "昨天 18:04", msg: "单日 tokens > 800K,自动降级到 Haiku", level: "ok" },
            { who: "市场部 · 内容组", when: "昨天 11:20", msg: "本月预算余额 < 10%,已通知 Anna 林", level: "warn" },
            { who: "财务部", when: "3 天前", msg: "尝试调用云端模型被拒(策略: 数据不出域)", level: "danger" }
          ].map((e, i) => (
            <div key={i} style={{ padding: "12px 0", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className={`dot dot--${e.level}`} />
                  <strong style={{ fontSize: 12.5, color: "var(--fg1)" }}>{e.who}</strong>
                </div>
                <span style={{ fontSize: 11, color: "var(--fg4)" }}>{e.when}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--fg2)", marginLeft: 16 }}>{e.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditPanel() {
  const events = [
    { time: "14:32:08", who: "Tomas 朱 · IT", action: "更新模型路由", target: "战略工作台 → Opus 4.1", level: "info" },
    { time: "14:18:42", who: "陈志远 · CEO", action: "查询", target: "战略画布 / DTC 渠道讨论 (Opus)", level: "info" },
    { time: "13:55:21", who: "苏婉 · 工业设计部", action: "上传知识", target: "CMF 春夏 2026.pdf (38 条)", level: "info" },
    { time: "13:42:18", who: "服务部 助手", action: "拒绝请求", target: "客户身份信息 — 触发 PII 策略", level: "warn" },
    { time: "13:18:04", who: "刘瑶 · CFO", action: "财务月度复盘", target: "私有 LLaMA-70B (本地)", level: "info" },
    { time: "12:42:52", who: "韩松 · COO", action: "运行技能", target: "动销预测 / Q2", level: "info" },
    { time: "12:18:24", who: "外部顾问 王平", action: "尝试访问", target: "公司 OKR — 权限拒绝", level: "danger" },
    { time: "11:54:08", who: "Anna 林 · CGO", action: "发起战略问题", target: "DTC 渠道 FY26 投入", level: "info" },
    { time: "11:22:46", who: "周岚 · 渠道运营", action: "补充知识", target: "BP/SC 协同 200 城试点纪要", level: "info" },
    { time: "10:48:12", who: "—", action: "自动配额降级", target: "服务部 · 已降级到 Haiku", level: "warn" }
  ];
  return (
    <div>
      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="今日事件" value="486" delta="+12%" status="up" spark={[380, 400, 420, 430, 450, 460, 475, 486]} color="#4F46E5" />
        <KpiCard label="敏感操作" value="38" delta="+4" status="down" spark={[28, 30, 32, 34, 35, 36, 37, 38]} color="#f59e0b" />
        <KpiCard label="拒绝请求" value="12" delta="+3" status="down" spark={[6, 8, 9, 10, 10, 11, 12, 12]} color="#ef4444" />
        <KpiCard label="可追溯率" value="98.6%" delta="+0.4pt" status="up" spark={[97, 97.4, 97.8, 98, 98.2, 98.4, 98.5, 98.6]} color="#10b981" />
      </div>
      <div className="card">
        <div className="card__head">
          <div className="card__title"><Icon.FileText size={14} /> 实时审计日志</div>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn--ghost btn--sm"><Icon.Filter size={12} /> 过滤</button>
            <button className="btn btn--ghost btn--sm"><Icon.Upload size={12} /> 导出</button>
          </div>
        </div>
        <table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--slate-50)" }}>
            <tr style={{ textAlign: "left" }}>
              {["时间", "用户", "操作", "目标", "级别"].map(h => <th key={h} style={{ padding: "10px 14px", fontSize: 10.5, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--border-soft)" }}>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--fg3)" }}>{e.time}</td>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--fg1)" }}>{e.who}</td>
                <td style={{ padding: "10px 14px", color: "var(--fg2)" }}>{e.action}</td>
                <td style={{ padding: "10px 14px", color: "var(--fg2)" }}>{e.target}</td>
                <td style={{ padding: "10px 14px" }}>
                  {e.level === "info" && <span className="pill pill--info">INFO</span>}
                  {e.level === "warn" && <span className="pill pill--warn">WARN</span>}
                  {e.level === "danger" && <span className="pill pill--danger">DENY</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
