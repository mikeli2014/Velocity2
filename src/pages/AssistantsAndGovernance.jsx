import React from "react";
import { Icon, KpiCard, HealthPill } from "../components/primitives.jsx";
import { Departments } from "../data/seed.js";

export function AssistantsPage({ setRoute }) {
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

      <div className="card">
        <div className="card__head"><div className="card__title"><Icon.GitBranch size={14} /> 意图路由 · 最近 24 小时</div></div>
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
    </div>
  );
}

export function GovernancePage() {
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
    </div>
  );
}
