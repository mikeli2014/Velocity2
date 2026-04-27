import React, { useState } from "react";
import { Icon, Modal, makeId } from "../components/primitives.jsx";
import { StrategyQuestion, StrategyQuestions, STRATEGY_STATUSES, Agents, DebateMessages as SeedDebateMessages, KnowledgeSources, Objectives } from "../data/seed.js";
import { useApi, apiPost, apiStream, ApiError } from "../lib/api.js";

export function StrategyPage() {
  const [tab, setTab] = useState("canvas");
  const [questions, setQuestions] = useState(() => StrategyQuestions.map(q => ({ ...q })));
  const [questionId, setQuestionId] = useState(StrategyQuestion.id);
  const [creating, setCreating] = useState(false);
  const question = questions.find(q => q.id === questionId) || StrategyQuestion;
  const status = STRATEGY_STATUSES.find(s => s.v === question.status) || STRATEGY_STATUSES[0];
  const eyebrow = question.status === "decided"
    ? `战略工作台 · 已定调`
    : question.status === "draft"
      ? `战略工作台 · 草稿`
      : `战略工作台 · 第 ${question.rounds || 1} 轮研讨`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--header-h))" }}>
      <div style={{ padding: "16px 28px 0", borderBottom: "1px solid var(--border-soft)", background: "#fff" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--vel-indigo)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--fg1)", letterSpacing: "-0.01em" }}>{question.title}</div>
              <span className="pill" style={{ background: status.color + "20", color: status.color, fontWeight: 600 }}>{status.label}</span>
            </div>
            <div className="row" style={{ gap: 10, fontSize: 12, color: "var(--fg3)", marginTop: 4 }}>
              <span><Icon.User size={11} style={{ verticalAlign: "-2px" }} /> {question.asker}</span>
              <span>·</span>
              <span>{question.asked}</span>
              <span>·</span>
              <span>关联 OKR <strong style={{ color: "var(--vel-indigo-700)" }}>{(question.okrs || []).join(", ") || "—"}</strong></span>
              <span>·</span>
              <span>{(question.context || []).length} 条背景资料</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.Save size={13} /> 保存</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setCreating(true)}><Icon.Plus size={13} /> 提出新问题</button>
            <button className="btn btn--primary btn--sm"><Icon.Sparkles size={13} /> 生成 OKR / 项目草案</button>
          </div>
        </div>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
          {[
            { id: "registry", label: "战略问题", count: StrategyQuestions.length },
            { id: "canvas", label: "画布 (Spatial)" },
            { id: "war", label: "War Council" },
            { id: "options", label: "战略选项", count: question.optionsCount || 0 },
            { id: "output", label: "结构化输出" }
          ].map(t => (
            <div key={t.id} className={`tab ${tab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {tab === "registry" && <QuestionRegistry questions={questions} currentId={questionId} onSelect={(id) => { setQuestionId(id); setTab("canvas"); }} onNew={() => setCreating(true)} />}
        {/* All four panels now work for any strategy question. Canvas +
            WarCouncil read DB-backed seeds; Options is persisted via
            POST /options/generate; StructuredOutput is ephemeral and
            generated on demand. */}
        {tab === "canvas" && <StrategyCanvas question={question} />}
        {tab === "war" && <WarCouncil question={question} />}
        {tab === "options" && <StrategyOptions question={question} />}
        {tab === "output" && <StructuredOutput question={question} />}
      </div>

      {creating && (
        <NewQuestionModal
          onClose={() => setCreating(false)}
          onCreate={(q) => {
            setQuestions(prev => [q, ...prev]);
            setQuestionId(q.id);
            setCreating(false);
            setTab("canvas");
          }}
        />
      )}
    </div>
  );
}

function NewQuestionModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [asker, setAsker] = useState("陈志远 · CEO");
  const [okrs, setOkrs] = useState([]);
  const [context, setContext] = useState([]);
  const [agents, setAgents] = useState(["ag-product", "ag-finance", "ag-gtm", "ag-risk"]);
  const valid = title.trim().length > 0;

  function toggle(arr, setter, id) {
    setter(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  }

  function submit() {
    onCreate({
      id: makeId("sq"),
      title: title.trim(),
      summary: summary.trim(),
      asker,
      asked: new Date().toISOString().slice(0, 10),
      status: "draft",
      rounds: 0, optionsCount: 0, decisionId: null,
      context, okrs, agents,
      __isNew: true
    });
  }

  return (
    <Modal
      title="提出战略问题"
      sub="战略问题是 Velocity 战略画布的入口。挑选背景资料和 Agent 后,即可启动多轮研讨。"
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>取消</button>
        <button className="btn btn--primary btn--sm" disabled={!valid} onClick={submit} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
          <Icon.Sparkles size={13} /> 创建并启动研讨
        </button>
      </>}
    >
      <div className="field">
        <label className="field__label">问题 *</label>
        <textarea className="textarea" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如:FY26 是否加大线上 DTC 渠道投入?" />
      </div>
      <div className="field">
        <label className="field__label">摘要 / 背景 (Optional)</label>
        <textarea className="textarea" value={summary} onChange={e => setSummary(e.target.value)} placeholder="简要说明这个问题为什么需要研讨,以及关心的核心维度。" />
      </div>
      <div className="field">
        <label className="field__label">提问人</label>
        <input className="input" value={asker} onChange={e => setAsker(e.target.value)} />
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <Icon.Target size={14} style={{ color: "var(--vel-indigo)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>关联 OKR ({okrs.length})</div>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {Objectives.map(o => {
            const sel = okrs.includes(o.code);
            return (
              <button key={o.id} className={`btn btn--sm ${sel ? "btn--primary" : "btn--ghost"}`} onClick={() => toggle(okrs, setOkrs, o.code)}>
                <span className="num">{o.code}</span> · {o.title.split("—")[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <Icon.FileText size={14} style={{ color: "var(--success)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>背景资料 ({context.length})</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflow: "auto", padding: 4 }}>
          {KnowledgeSources.map(s => {
            const sel = context.includes(s.id);
            return (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: sel ? "var(--vel-indigo-50)" : "var(--slate-50)", cursor: "pointer" }}>
                <input type="checkbox" checked={sel} onChange={() => toggle(context, setContext, s.id)} />
                <span style={{ fontSize: 13, color: "var(--fg1)", flex: 1 }}>{s.title}</span>
                <span className="pill pill--neutral">{s.scope}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <Icon.Users size={14} style={{ color: "var(--vel-violet)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>参与 Agent ({agents.length})</div>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {Agents.map(a => {
            const sel = agents.includes(a.id);
            return (
              <button key={a.id} className={`btn btn--sm ${sel ? "btn--primary" : "btn--ghost"}`} onClick={() => toggle(agents, setAgents, a.id)}>
                {a.name}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function QuestionRegistry({ questions, currentId, onSelect, onNew }) {
  const groups = STRATEGY_STATUSES.map(s => ({
    ...s,
    items: questions.filter(q => q.status === s.v)
  })).filter(g => g.items.length > 0);

  return (
    <div className="scroll" style={{ height: "100%", overflow: "auto", padding: 32, background: "var(--bg-page)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18, alignItems: "flex-start", gap: 24 }}>
          <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.6, flex: 1 }}>
            战略问题 (Strategy Questions) 是 Velocity 的核心战略资产 — 它把"想法 → 研讨 → 选项 → 决策 → OKR / 关键项目"沉淀成可追溯的工作流。
            点击任一问题进入研讨画布。
          </div>
          <button className="btn btn--primary btn--sm" onClick={onNew}><Icon.Plus size={13} /> 提出新问题</button>
        </div>

        {groups.map(g => (
          <div key={g.v} style={{ marginBottom: 22 }}>
            <div className="row" style={{ gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: g.color }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{g.label}</div>
              <span className="num" style={{ fontSize: 11, color: "var(--fg3)" }}>{g.items.length}</span>
            </div>
            <div className="grid grid-cols-2">
              {g.items.map(q => {
                const isCurrent = q.id === currentId;
                return (
                  <div key={q.id}
                    onClick={() => onSelect(q.id)}
                    className="card"
                    style={{
                      padding: 18,
                      cursor: "pointer",
                      borderColor: isCurrent ? "var(--vel-indigo)" : "var(--border-soft)",
                      borderWidth: isCurrent ? 2 : 1,
                      borderStyle: "solid"
                    }}
                  >
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                        {(q.okrs || []).map(o => <span key={o} className="pill pill--indigo num">关联 {o}</span>)}
                      </div>
                      {isCurrent && <span className="pill pill--info">当前</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg1)", marginBottom: 6, lineHeight: 1.4 }}>{q.title}</div>
                    <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.6, marginBottom: 12 }}>{q.summary}</div>
                    <div className="row" style={{ gap: 12, fontSize: 11, color: "var(--fg3)", flexWrap: "wrap" }}>
                      <span><Icon.User size={11} style={{ verticalAlign: "-2px" }} /> {q.asker}</span>
                      <span><Icon.Calendar size={11} style={{ verticalAlign: "-2px" }} /> {q.asked}</span>
                      <span><Icon.Users size={11} style={{ verticalAlign: "-2px" }} /> {q.agents.length} 个 Agent</span>
                      {q.rounds > 0 && <span><Icon.Activity size={11} style={{ verticalAlign: "-2px" }} /> {q.rounds} 轮研讨</span>}
                      {q.optionsCount > 0 && <span><Icon.GitBranch size={11} style={{ verticalAlign: "-2px" }} /> {q.optionsCount} 个选项</span>}
                      {q.decisionId && <span style={{ color: "var(--success-text)" }}><Icon.Quote size={11} style={{ verticalAlign: "-2px" }} /> 已沉淀决策</span>}
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

function CanvasToolbarButton({ title, icon, active, onClick }) {
  const IconC = Icon[icon] || Icon.Plus;
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 8,
        color: active ? "#fff" : "rgba(255,255,255,0.7)",
        background: active ? "rgba(99,102,241,0.4)" : "transparent",
        display: "grid", placeItems: "center"
      }}
    >
      <IconC size={16} />
    </button>
  );
}

function CanvasPicker({ title, empty, items, onPick, onClose }) {
  return (
    <div
      style={{
        position: "absolute", left: "50%", bottom: 78, transform: "translateX(-50%)",
        width: 360, maxHeight: 320,
        background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        color: "#fff",
        zIndex: 11,
        display: "flex", flexDirection: "column"
      }}
    >
      <div className="row" style={{ justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{title}</div>
        <button onClick={onClose} style={{ color: "rgba(255,255,255,0.5)", display: "grid", placeItems: "center" }}><Icon.X size={13} /></button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 6 }}>
        {items.length === 0 && <div style={{ padding: 18, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{empty}</div>}
        {items.map(it => {
          const IconC = Icon[it.icon] || Icon.User;
          return (
            <button
              key={it.id}
              onClick={() => onPick(it.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "8px 10px", borderRadius: 7,
                color: "#fff", textAlign: "left",
                background: "transparent",
                cursor: "pointer"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 7, background: it.color || "#4F46E5", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <IconC size={13} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{it.sub}</div>
              </div>
              <Icon.Plus size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StrategyCanvas({ question }) {
  // Defaults derive from the active question so the canvas works for any
  // strategy question, not just sq-1. Empty agent / context lists fall
  // back to "all 8 agents" / "first 3 source ids" so the layout has
  // something to render — the user can edit further via the toolbar.
  const seedQuestion = question || StrategyQuestion;
  const cx = 50, cy = 50;
  const [agentIds, setAgentIds] = useState(() =>
    (seedQuestion.agents && seedQuestion.agents.length > 0)
      ? seedQuestion.agents
      : Agents.map(a => a.id)
  );
  const [contextIds, setContextIds] = useState(() =>
    (seedQuestion.context || []).slice(0, 3)
  );
  const [picker, setPicker] = useState(null); // "agent" | "context" | null

  function placeOnRing(items, ringIndex, radiusY) {
    const n = items.length || 1;
    return items.map((item, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = ringIndex === 0 ? 32 : 44;
      return { ...item, x: 50 + Math.cos(angle) * r, y: 50 + Math.sin(angle) * radiusY };
    });
  }

  const agentNodes = placeOnRing(agentIds.map(id => Agents.find(a => a.id === id)).filter(Boolean), 0, 30);
  const contextNodes = placeOnRing(contextIds.map(id => KnowledgeSources.find(s => s.id === id)).filter(Boolean).map(s => ({ ...s, isContext: true })), 1, 42);
  const allNodes = [...agentNodes, ...contextNodes];

  const availableAgents = Agents.filter(a => !agentIds.includes(a.id));
  const availableSources = KnowledgeSources.filter(s => !contextIds.includes(s.id));

  return (
    <div className="canvas-stage scroll" style={{ height: "100%" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(99,102,241,0.6)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.2)" />
            </linearGradient>
          </defs>
          {allNodes.map((p, i) => (
            <line key={i}
              x1={`${cx}%`} y1={`${cy}%`}
              x2={`${p.x}%`} y2={`${p.y}%`}
              stroke="url(#line)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6"
            />
          ))}
        </svg>

        <div style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          width: 320, padding: 22,
          background: "linear-gradient(135deg, #312E81, #4C1D95)",
          color: "#fff", borderRadius: 18,
          boxShadow: "0 20px 60px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          zIndex: 5
        }}>
          <div style={{ fontSize: 10, color: "#c4b5fd", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>战略问题 · Mission</div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 12 }}>{seedQuestion.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            上下文已注入: {contextIds.length} 条公司知识 · {(seedQuestion.okrs || []).length} 个 OKR · {agentIds.length} 个 Agent
          </div>
          <div className="row" style={{ marginTop: 14, gap: 8 }}>
            <span className="pill" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>第 3 轮</span>
            <span className="pill" style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}>研讨中</span>
          </div>
        </div>

        {agentNodes.map(p => {
          const lastMsg = SeedDebateMessages.filter(m => m.agent === p.id).slice(-1)[0];
          return (
            <div key={p.id} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)",
              width: 220,
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              borderRadius: 12, padding: 12,
              color: "#fff",
              boxShadow: `0 10px 30px ${p.color}30`
            }}>
              <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: p.color, display: "grid", placeItems: "center", color: "#fff" }}>
                  {React.createElement(Icon[p.icon] || Icon.User, { size: 14 })}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{p.focus}</div>
                </div>
                {lastMsg && (
                  <span className="pill" style={{
                    background: lastMsg.stance === "pro" ? "rgba(16,185,129,0.18)" : lastMsg.stance === "con" ? "rgba(239,68,68,0.18)" : "rgba(245,158,11,0.18)",
                    color: lastMsg.stance === "pro" ? "#6ee7b7" : lastMsg.stance === "con" ? "#fca5a5" : "#fcd34d"
                  }}>
                    {lastMsg.stance === "pro" ? "赞成" : lastMsg.stance === "con" ? "反对" : "保留"}
                  </span>
                )}
                <button
                  onClick={() => setAgentIds(ids => ids.filter(x => x !== p.id))}
                  title="从画布移除"
                  style={{ width: 18, height: 18, borderRadius: 4, color: "rgba(255,255,255,0.4)", display: "grid", placeItems: "center" }}
                >
                  <Icon.X size={11} />
                </button>
              </div>
              {lastMsg && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, maxHeight: 50, overflow: "hidden" }}>
                  {lastMsg.text.slice(0, 80)}…
                </div>
              )}
            </div>
          );
        })}

        {contextNodes.map(p => (
          <div key={p.id} style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)",
            width: 200,
            background: "rgba(99, 102, 241, 0.18)",
            border: "1px dashed rgba(99,102,241,0.45)",
            backdropFilter: "blur(10px)",
            borderRadius: 10, padding: 10,
            color: "#c7d2fe"
          }}>
            <div className="row" style={{ gap: 6, marginBottom: 4 }}>
              <Icon.FileText size={11} />
              <span style={{ fontSize: 10, color: "rgba(199,210,254,0.7)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{p.type}</span>
              <button
                onClick={() => setContextIds(ids => ids.filter(x => x !== p.id))}
                title="从画布移除"
                style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: 3, color: "rgba(199,210,254,0.5)", display: "grid", placeItems: "center" }}
              >
                <Icon.X size={10} />
              </button>
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>{p.title.slice(0, 36)}{p.title.length > 36 ? "…" : ""}</div>
            <div style={{ fontSize: 10, color: "rgba(199,210,254,0.6)", marginTop: 3 }}>{p.scope} · {p.uses} 引用</div>
          </div>
        ))}

        {picker === "agent" && (
          <CanvasPicker
            title="添加 Agent"
            empty="所有专业 Agent 已在画布上"
            items={availableAgents.map(a => ({ id: a.id, label: a.name, sub: a.role, color: a.color, icon: a.icon }))}
            onPick={id => { setAgentIds(ids => [...ids, id]); setPicker(null); }}
            onClose={() => setPicker(null)}
          />
        )}
        {picker === "context" && (
          <CanvasPicker
            title="添加背景资料"
            empty="可用的知识源已经全部加入画布"
            items={availableSources.map(s => ({ id: s.id, label: s.title, sub: `${s.type} · ${s.scope}`, color: "#6366f1", icon: "FileText" }))}
            onPick={id => { setContextIds(ids => [...ids, id]); setPicker(null); }}
            onClose={() => setPicker(null)}
          />
        )}

        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 4, padding: 4,
          background: "rgba(15,23,42,0.92)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, backdropFilter: "blur(20px)", zIndex: 10
        }}>
          <CanvasToolbarButton title="添加 Agent" icon="User" active={picker === "agent"} onClick={() => setPicker(picker === "agent" ? null : "agent")} />
          <CanvasToolbarButton title="添加背景资料" icon="FileText" active={picker === "context"} onClick={() => setPicker(picker === "context" ? null : "context")} />
          <CanvasToolbarButton title="重置画布" icon="RefreshCw" onClick={() => { setAgentIds((seedQuestion.agents && seedQuestion.agents.length > 0) ? seedQuestion.agents : Agents.map(a => a.id)); setContextIds((seedQuestion.context || []).slice(0, 3)); setPicker(null); }} />
          <CanvasToolbarButton title="清空画布" icon="X" onClick={() => { setAgentIds([]); setContextIds([]); setPicker(null); }} />
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "4px 4px" }} />
          <button className="btn btn--primary btn--sm" style={{ padding: "0 12px" }} disabled={agentIds.length === 0}>
            <Icon.Sparkles size={13} /> 进入下一轮
          </button>
        </div>
      </div>
    </div>
  );
}

function WarCouncil({ question }) {
  const questionId = question.id;
  // Live debate transcript from the API. Seed fallback is gated to sq-1
  // (the only question with hand-authored DebateMessages); for any other
  // question we render the live API result (or empty while loading).
  const { data: apiMessages, refresh } = useApi(`/api/v1/strategy-questions/${questionId}/debate`);
  const fallback = questionId === "sq-1"
    ? SeedDebateMessages.map(m => ({
        id: `${m.agent}-${m.round}`,
        round: m.round,
        agentId: m.agent,
        stance: m.stance,
        text: m.text,
        sources: m.sources || []
      }))
    : [];
  const messages = apiMessages ?? fallback;
  const hasMessages = messages.length > 0;
  const rounds = Array.from(new Set(messages.map(m => m.round))).sort((a, b) => a - b);
  const nextRound = hasMessages ? (rounds[rounds.length - 1] || 0) + 1 : 1;
  // sq-5 has agents=[] in seed. When the question carries no agents,
  // default the round to all 8 personas so the launch button doesn't
  // 400 with no_agents.
  const questionAgents = question.agents || [];
  const effectiveAgentIds = questionAgents.length > 0
    ? questionAgents
    : Agents.map(a => a.id);
  const usingDefaultAgents = questionAgents.length === 0;

  const [running, setRunning] = useState(false);
  const [synth, setSynth] = useState(null);
  const [synthLoading, setSynthLoading] = useState(false);
  const [error, setError] = useState(null);
  // Live state during a streaming round: agents currently in flight,
  // and per-agent buffered text so each avatar lights up + types in
  // real-time. Cleared on done.
  const [liveRound, setLiveRound] = useState(null);

  function runRound() {
    if (running) return;
    setRunning(true);
    setError(null);
    setLiveRound({ round: null, current: null, buffers: {} });
    // Explicit agent list when the question itself has none (sq-5 etc.).
    // The backend will accept either an explicit list or fall back to
    // question.agents — we send explicit when defaulting so the user
    // sees the full council, not a 400.
    const body = usingDefaultAgents ? { agentIds: effectiveAgentIds } : {};
    apiStream(`/api/v1/strategy-questions/${questionId}/debate/round/stream`, body, {
      onEvent: (ev) => {
        if (ev.type === "round") {
          setLiveRound(s => ({ ...(s || {}), round: ev.round, agents: ev.agents }));
        } else if (ev.type === "agent_start") {
          setLiveRound(s => ({ ...(s || {}), current: ev.agentId }));
        } else if (ev.type === "text") {
          setLiveRound(s => ({
            ...(s || {}),
            buffers: { ...(s?.buffers || {}), [ev.agentId]: ((s?.buffers || {})[ev.agentId] || "") + ev.text }
          }));
        } else if (ev.type === "agent_done") {
          // Persisted message; let the periodic refresh below pick it up.
          // Keep the buffered text visible until the round ends so the
          // user sees the same content settle in place.
        } else if (ev.type === "done") {
          setSynth(null);  // synthesis goes stale once new messages land
          setLiveRound(null);
          setRunning(false);
          refresh();
        } else if (ev.type === "error") {
          setError(ev.detail);
          setLiveRound(null);
          setRunning(false);
        }
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.detail : String(err));
        setLiveRound(null);
        setRunning(false);
      }
    });
  }

  function runSynthesis() {
    if (synthLoading) return;
    setSynthLoading(true);
    setError(null);
    setSynth({ text: "", pro: 0, con: 0, concern: 0, model: "claude-sonnet-4-6", streaming: true });
    let buffered = "";
    apiStream(`/api/v1/strategy-questions/${questionId}/debate/synthesis/stream`, {}, {
      onEvent: (ev) => {
        if (ev.type === "counts") {
          setSynth(s => ({ ...s, pro: ev.pro, con: ev.con, concern: ev.concern }));
        } else if (ev.type === "text") {
          buffered += ev.text;
          setSynth(s => ({ ...s, text: buffered }));
        } else if (ev.type === "done") {
          setSynth(s => ({ ...s, model: ev.model, streaming: false }));
          setSynthLoading(false);
        } else if (ev.type === "error") {
          setError(ev.detail);
          setSynth(null);
          setSynthLoading(false);
        }
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.detail : String(err));
        setSynth(null);
        setSynthLoading(false);
      }
    });
  }

  // Default synthesis when the live one hasn't been generated yet — keeps
  // the page populated for the canned demo data.
  const fallbackSynth = {
    text: '7 个 Agent 中 3 个赞成(产品/GTM/组织)、3 个保留(财务/运营/供应链)、1 个反对(风险)。\n核心张力在于"窗口期 vs 渠道冲突 vs 履约能力"。建议生成 3 个战略选项,分别对应 激进 / 稳健 / 渐进 投入节奏,并在 OKR 草案中明确县域服务网络作为前置条件。',
    pro: messages.filter(m => m.stance === "pro").length,
    con: messages.filter(m => m.stance === "con").length,
    concern: messages.filter(m => m.stance === "concern").length
  };
  const display = synth || fallbackSynth;

  return (
    <div style={{ height: "100%", overflow: "auto", background: "#0B1220", color: "#fff" }} className="scroll">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            <span>已运行 <strong style={{ color: "#fff" }}>{rounds.length}</strong> 轮 · 共 {messages.length} 条发言</span>
            {usingDefaultAgents && (
              <span style={{ marginLeft: 12, color: "#fcd34d" }}>· 使用全部 {effectiveAgentIds.length} 个默认 Agent</span>
            )}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn btn--sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)" }}
              onClick={runSynthesis}
              disabled={synthLoading || messages.length === 0}
            >
              <Icon.Sparkles size={12} /> {synthLoading ? "生成中…" : "重新生成摘要"}
            </button>
            <button
              className="btn btn--primary btn--sm"
              onClick={runRound}
              disabled={running}
            >
              <Icon.PlayCircle size={13} /> {running ? `运行第 ${nextRound} 轮…` : `运行第 ${nextRound} 轮`}
            </button>
          </div>
        </div>
        {!hasMessages && !liveRound && (
          <div style={{ padding: "32px 24px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 12, textAlign: "center", marginBottom: 18 }}>
            <Icon.Sparkles size={22} style={{ color: "#c4b5fd", marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>本问题尚未运行多智能体研讨</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              点击右上角「运行第 1 轮」启动 Sonnet 4.6 多 Agent 辩论。
              {usingDefaultAgents && "本问题未指定 Agent — 将使用全部 8 个默认角色。"}
            </div>
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, color: "#fca5a5", fontSize: 12 }}>
            {error === "anthropic_not_configured"
              ? "未配置 ANTHROPIC_API_KEY:演示模式下 War Council 仅展示种子数据。"
              : `请求失败:${error}`}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rounds.map(round => (
            <div key={round}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, padding: "16px 0 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
                第 {round} 轮 · {round === 1 ? "首轮陈述" : round === 2 ? "交叉质询" : round === 3 ? "立场收敛" : "继续辩论"}
              </div>
              {messages.filter(m => m.round === round).map((m, i) => {
                const ag = Agents.find(a => a.id === m.agentId);
                if (!ag) return null;
                return (
                  <div key={m.id || i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: ag.color, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {React.createElement(Icon[ag.icon] || Icon.User, { size: 17 })}
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
                      <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{ag.name}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{ag.role}</span>
                        </div>
                        <span className="pill" style={{
                          background: m.stance === "pro" ? "rgba(16,185,129,0.18)" : m.stance === "con" ? "rgba(239,68,68,0.18)" : "rgba(245,158,11,0.18)",
                          color: m.stance === "pro" ? "#6ee7b7" : m.stance === "con" ? "#fca5a5" : "#fcd34d"
                        }}>{m.stance === "pro" ? "赞成" : m.stance === "con" ? "反对" : "保留"}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.65, marginBottom: (m.sources || []).length ? 10 : 0, whiteSpace: "pre-wrap" }}>{m.text}</div>
                      {(m.sources || []).length > 0 && (
                        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                          {m.sources.map(sid => {
                            const src = KnowledgeSources.find(k => k.id === sid);
                            return (
                              <span key={sid} className="pill" style={{ background: "rgba(99,102,241,0.18)", color: "#c4b5fd" }}>
                                <Icon.FileText size={10} /> {src ? src.title.slice(0, 22) + "…" : sid}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {liveRound && liveRound.agents && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(196,181,253,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, padding: "16px 0 10px", borderBottom: "1px solid rgba(196,181,253,0.18)", marginBottom: 12 }}>
                第 {liveRound.round} 轮 · 进行中
              </div>
              {liveRound.agents.map(p => {
                const inFlight = liveRound.current === p.id;
                const buf = (liveRound.buffers || {})[p.id] || "";
                const arrived = buf.length > 0;
                return (
                  <div key={p.id} style={{ display: "flex", gap: 14, marginBottom: 16, opacity: arrived || inFlight ? 1 : 0.4 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: p.color || "#7c3aed", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: inFlight ? "0 0 0 4px rgba(196,181,253,0.35)" : "none" }}>
                      {React.createElement(Icon[p.icon] || Icon.User, { size: 17 })}
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
                      <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{p.role}</span>
                        </div>
                        {inFlight && <span style={{ fontSize: 11, color: "#c4b5fd" }}>思考中…</span>}
                        {!inFlight && !arrived && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>等待</span>}
                      </div>
                      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                        {buf}
                        {inFlight && (
                          <span style={{ display: "inline-block", width: 7, height: 13, background: "#c4b5fd", marginLeft: 4, verticalAlign: "-2px", animation: "blink 1s steps(2,start) infinite" }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{ marginTop: 24, padding: 18, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12 }}>
          <div className="row" style={{ gap: 10, marginBottom: 8 }}>
            <Icon.Sparkles size={16} style={{ color: "#c4b5fd" }} />
            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>研讨摘要 · {synth ? `由 ${synth.model || "Velocity"} 实时生成` : "由 Velocity 自动生成"}</div>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              <strong style={{ color: "#6ee7b7" }}>{display.pro} 赞成</strong> ·{" "}
              <strong style={{ color: "#fcd34d" }}>{display.concern} 保留</strong> ·{" "}
              <strong style={{ color: "#fca5a5" }}>{display.con} 反对</strong>
            </span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {display.text}
            {display.streaming && (
              <span style={{ display: "inline-block", width: 7, height: 13, background: "#c4b5fd", marginLeft: 4, verticalAlign: "-2px", animation: "blink 1s steps(2,start) infinite" }} />
            )}
            {display.streaming && !display.text && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>生成中…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyOptions({ question }) {
  const questionId = question.id;
  const { data: apiOptions, refresh } = useApi(`/api/v1/strategy-questions/${questionId}/options`);
  const options = apiOptions ?? [];
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      await apiPost(`/api/v1/strategy-questions/${questionId}/options/generate`, {});
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="scroll" style={{ height: "100%", overflow: "auto", padding: 32, background: "var(--bg-page)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: "var(--fg3)" }}>
            {options.length === 0
              ? "尚未生成战略选项"
              : `共 ${options.length} 个候选方案 · 由 ${options[0]?.model || "Sonnet 4.6"} 基于研讨综合生成`}
          </div>
          <button
            className="btn btn--primary btn--sm"
            onClick={generate}
            disabled={running}
          >
            <Icon.Sparkles size={13} /> {running ? "生成中…" : (options.length === 0 ? "生成战略选项" : "重新生成")}
          </button>
        </div>
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 8, color: "var(--danger-text)", fontSize: 12 }}>
            {error === "anthropic_not_configured"
              ? "未配置 ANTHROPIC_API_KEY:无法生成战略选项。"
              : error === "options_parse_failed"
                ? "模型返回的内容无法解析,请重试。"
                : `请求失败:${error}`}
          </div>
        )}
        {options.length === 0 ? (
          <div style={{ padding: "48px 24px", background: "var(--slate-50)", border: "1px dashed var(--border)", borderRadius: 12, textAlign: "center" }}>
            <Icon.Compass size={28} style={{ color: "var(--fg4)", marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)", marginBottom: 6 }}>本问题尚未生成战略选项</div>
            <div style={{ fontSize: 12, color: "var(--fg3)", lineHeight: 1.6 }}>
              点击右上角「生成战略选项」让 Sonnet 4.6 基于研讨记录综合 2-3 个候选方案。
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {options.map((o, i) => (
              <div key={o.id || i} className="card" style={{
                padding: 22,
                border: o.recommended ? "2px solid var(--vel-indigo)" : "1px solid var(--border-soft)",
                position: "relative"
              }}>
                {o.recommended && <span className="pill pill--indigo" style={{ position: "absolute", top: -10, left: 18 }}>⭐ 推荐方案</span>}
                <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 6 }}>战略选项</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--fg1)", marginBottom: 8 }}>{o.name}</div>
                <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.6, marginBottom: 16 }}>{o.description}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div style={{ padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "var(--fg3)", textTransform: "uppercase" }}>ROI</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{o.roi || "—"}</div>
                  </div>
                  <div style={{ padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "var(--fg3)", textTransform: "uppercase" }}>风险</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: o.risk === "高" ? "var(--danger-text)" : o.risk === "中" ? "var(--warning-text)" : "var(--success-text)" }}>{o.risk || "—"}</div>
                  </div>
                </div>
                {o.timeEstimate && <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 10 }}>{o.timeEstimate}</div>}
                <div className="row" style={{ gap: 12, marginBottom: 14 }}>
                  <span className="pill pill--ok">+{o.pros || 0} 赞成</span>
                  <span className="pill pill--danger">-{o.cons || 0} 反对</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StructuredOutput({ question }) {
  const questionId = question.id;
  // Ephemeral by design — frontend caches the draft locally, user
  // "applies" via the existing CRUD endpoints when ready.
  const [draft, setDraft] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await apiPost(`/api/v1/strategy-questions/${questionId}/structured-output/generate`, {});
      setDraft(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="scroll" style={{ height: "100%", overflow: "auto", padding: 32, background: "var(--bg-page)" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: "var(--fg3)" }}>
            {draft
              ? `由 ${draft.model || "Sonnet 4.6"} 基于研讨综合生成 · 草案 (尚未写入 OKR / 项目)`
              : "尚未生成结构化输出"}
          </div>
          <button
            className="btn btn--primary btn--sm"
            onClick={generate}
            disabled={running}
          >
            <Icon.Sparkles size={13} /> {running ? "生成中…" : (draft ? "重新生成" : "生成结构化输出")}
          </button>
        </div>
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 8, color: "var(--danger-text)", fontSize: 12 }}>
            {error === "anthropic_not_configured"
              ? "未配置 ANTHROPIC_API_KEY:无法生成结构化输出。"
              : error === "structured_output_parse_failed"
                ? "模型返回的内容无法解析,请重试。"
                : `请求失败:${error}`}
          </div>
        )}
        {!draft && (
          <div style={{ padding: "48px 24px", background: "var(--slate-50)", border: "1px dashed var(--border)", borderRadius: 12, textAlign: "center" }}>
            <Icon.FileText size={28} style={{ color: "var(--fg4)", marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)", marginBottom: 6 }}>本问题尚未生成结构化输出</div>
            <div style={{ fontSize: 12, color: "var(--fg3)", lineHeight: 1.6 }}>
              生成后会得到一份草案:Objective + KRs + 关键项目 + 决策日志条目。可手动修改后写入 OKR 注册表与项目库。
            </div>
          </div>
        )}
        {draft && (
          <>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <div className="row" style={{ gap: 10, marginBottom: 16 }}>
                <Icon.Target size={18} style={{ color: "var(--vel-indigo)" }} />
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>建议生成 Objective (草案)</div>
              </div>
              <div style={{ background: "var(--vel-indigo-50)", border: "1px solid var(--vel-indigo-100)", borderRadius: 10, padding: 18, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--vel-indigo-700)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{draft.objective.code}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg1)", marginBottom: 12 }}>{draft.objective.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(draft.objective.krs || []).map((kr, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                      <Icon.Hash size={13} style={{ color: "var(--fg4)", marginTop: 2 }} />
                      <div style={{ flex: 1, fontSize: 13, color: "var(--fg1)" }}>{kr.kr}</div>
                      <span className="pill pill--info num">{kr.target}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--fg4)" }}>提示:点击「编辑后发布」可在 OKR 注册表中调整后再正式写入。</div>
            </div>

            {(draft.projects || []).length > 0 && (
              <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div className="row" style={{ gap: 10, marginBottom: 16 }}>
                  <Icon.Layers size={18} style={{ color: "#10b981" }} />
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>建议生成关键项目 (草案)</div>
                </div>
                {draft.projects.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: 12, borderBottom: i < draft.projects.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#10b98118", color: "#10b981", display: "grid", placeItems: "center" }}>
                      <Icon.Package size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>
                        {p.owner || "—"}{p.milestone && <> · 里程碑 <strong style={{ color: "var(--fg2)" }}>{p.milestone}</strong></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card" style={{ padding: 24 }}>
              <div className="row" style={{ gap: 10, marginBottom: 14 }}>
                <Icon.Quote size={18} style={{ color: "#7c3aed" }} />
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>决策日志条目 (草案)</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.7 }}>
                <p><strong style={{ color: "var(--fg1)" }}>问题:</strong> {draft.decision.question}</p>
                <p><strong style={{ color: "var(--fg1)" }}>结论:</strong> {draft.decision.conclusion}</p>
                {(draft.decision.assumptions || []).length > 0 && (
                  <p><strong style={{ color: "var(--fg1)" }}>关键假设:</strong> {draft.decision.assumptions.join(";")}。</p>
                )}
                {(draft.decision.dissent || []).length > 0 && (
                  <p><strong style={{ color: "var(--fg1)" }}>反对意见:</strong> {draft.decision.dissent.join(";")}。</p>
                )}
                {draft.decision.evidence && (
                  <p><strong style={{ color: "var(--fg1)" }}>证据来源:</strong> {draft.decision.evidence}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
