import React, { useState, useEffect, useRef } from "react";
import { Icon, Modal } from "./primitives.jsx";

// Shared run dialog used for Workflow templates and Skill packs.
// Renders the chosen item's step list (or default 3-step shape for skills),
// animates step state ⇒ pending → running → done, then displays a synthesized
// output panel with an "Add to project / save as knowledge / copy" action row.
export function RunDialog({ kind, item, onClose, defaultInput = "", outputBuilder }) {
  const [input, setInput] = useState(defaultInput);
  const [stage, setStage] = useState(-1); // -1 = not started, 0..N = in step i, N+1 = done
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const timer = useRef(null);

  const steps = (item.steps && item.steps.length)
    ? item.steps
    : defaultSkillSteps(item);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function start() {
    if (!input.trim()) return;
    setRunning(true);
    setStage(0);
    setOutput(null);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < steps.length) {
        setStage(i);
        timer.current = setTimeout(tick, 700);
      } else {
        setStage(steps.length);
        const out = outputBuilder ? outputBuilder({ item, input }) : defaultOutput({ item, input });
        setOutput(out);
        setRunning(false);
      }
    };
    timer.current = setTimeout(tick, 700);
  }

  const finished = stage >= steps.length;

  return (
    <Modal
      title={`${kind === "workflow" ? "运行工作流" : "运行技能"} · ${item.name}`}
      sub={item.description || `${item.input || "—"} → ${item.output || "—"}`}
      large
      onClose={onClose}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>{finished ? "完成" : "取消"}</button>
        {!finished && (
          <button
            className="btn btn--primary btn--sm"
            disabled={running || !input.trim()}
            style={(running || !input.trim()) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            onClick={start}
          >
            <Icon.PlayCircle size={13} /> {running ? "运行中…" : "开始运行"}
          </button>
        )}
        {finished && (
          <button className="btn btn--primary btn--sm" onClick={() => { setStage(-1); setRunning(false); setOutput(null); }}>
            <Icon.RefreshCw size={13} /> 再跑一次
          </button>
        )}
      </>}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="pill pill--neutral"><Icon.Activity size={10} /> {item.uses || 0} 次执行</span>
        {item.avgTime && <span className="pill pill--neutral"><Icon.Clock size={10} /> 平均 {item.avgTime}</span>}
        {item.version && <span className="pill pill--indigo num">{item.version}</span>}
        {item.owner && <span className="pill pill--neutral"><Icon.User size={10} /> {item.owner}</span>}
        {item.maintainer && !item.owner && <span className="pill pill--neutral"><Icon.User size={10} /> {item.maintainer}</span>}
      </div>

      <div className="field">
        <label className="field__label">输入 — {item.input || "请描述本次任务"}</label>
        <textarea className="textarea" value={input} onChange={e => setInput(e.target.value)} placeholder={`例如:${suggestionFor(item)}`} disabled={running} />
      </div>

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <Icon.Workflow size={14} style={{ color: "var(--vel-indigo)" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>步骤 ({steps.length})</div>
          {running && <span className="pill pill--info">运行中 · 第 {stage + 1} / {steps.length} 步</span>}
          {finished && <span className="pill pill--ok">已完成</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {steps.map((s, i) => {
            const done = stage > i;
            const active = stage === i && running;
            const role = STEP_ROLES[s.role] || STEP_ROLES.system;
            return (
              <div key={s.id || i} style={{
                display: "grid", gridTemplateColumns: "26px 1fr 90px 80px",
                gap: 10, alignItems: "center",
                padding: "10px 12px",
                background: done ? "#DCFCE7" : active ? "var(--vel-indigo-50)" : "var(--slate-50)",
                border: "1px solid " + (done ? "#86EFAC" : active ? "var(--vel-indigo-100)" : "var(--border-soft)"),
                borderLeft: `3px solid ${role.color}`,
                borderRadius: 8
              }}>
                {done
                  ? <Icon.Check size={14} style={{ color: "var(--success)" }} />
                  : active
                    ? <span style={{ width: 10, height: 10, borderRadius: 5, background: "var(--vel-indigo)", boxShadow: "0 0 0 4px rgba(99,102,241,0.18)" }} />
                    : <span className="num" style={{ fontSize: 11, color: "var(--fg4)", fontWeight: 800 }}>{String(i + 1).padStart(2, "0")}</span>}
                <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 600 }}>{s.name}</div>
                <span className="pill" style={{ background: role.bg, color: role.color, fontWeight: 600 }}>{role.label}</span>
                <span className="num" style={{ fontSize: 11, color: "var(--fg3)", textAlign: "right" }}>{s.time || "—"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {output && (
        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
          <div className="row" style={{ gap: 8, marginBottom: 12 }}>
            <Icon.Sparkles size={14} style={{ color: "var(--success)" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>输出</div>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg3)" }}>{output.meta || ""}</span>
          </div>
          <div style={{ padding: "14px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)", marginBottom: 8 }}>{output.title}</div>
            <div style={{ fontSize: 13, color: "var(--fg1)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{output.body}</div>
            {(output.sources || []).length > 0 && (
              <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {output.sources.map((s, i) => <span key={i} className="pill pill--indigo"><Icon.FileText size={10} /> {s}</span>)}
              </div>
            )}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button className="btn btn--ghost btn--sm"><Icon.Copy size={13} /> 复制</button>
            <button className="btn btn--ghost btn--sm"><Icon.Save size={13} /> 保存为知识条目</button>
            <button className="btn btn--ghost btn--sm"><Icon.Layers size={13} /> 写回项目</button>
            <button className="btn btn--ghost btn--sm"><Icon.MessageCircle size={13} /> 发送给助手</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

const STEP_ROLES = {
  human:    { label: "人工",   color: "#475569", bg: "#f1f5f9" },
  system:   { label: "系统",   color: "#0891b2", bg: "#cffafe" },
  skill:    { label: "技能",   color: "#7c3aed", bg: "#ede9fe" },
  ai:       { label: "AI 推理", color: "#4f46e5", bg: "#e0e7ff" },
  approval: { label: "审批",   color: "#b45309", bg: "#fef3c7" }
};

function defaultSkillSteps(skill) {
  return [
    { id: "s1", name: `准备输入 — ${skill.input || "上下文"}`, role: "human", time: "30s" },
    { id: "s2", name: `调用 ${skill.name}`, role: "skill", time: "45s" },
    { id: "s3", name: `生成 ${skill.output || "输出"}`, role: "ai", time: "20s" }
  ];
}

function suggestionFor(item) {
  const map = {
    "供应商/材料/工艺检索": "为零冷水热水器外壳寻找 PVD-Black 工艺的国内供应商,要求 500 件试产能交付。",
    "CMF 图片识别": "上传一张松下 K3 净水器照片,识别色彩、材质、表面工艺。",
    "奥维数据分析": "分析 2025Q4 厨电类目 3-4K 价格带的竞品分布与机会。",
    "趋势洞察结构化": "把广州春夏家电展的展会观察整理成结构化趋势条目。",
    "跨品类关联": "净水器 PVD-Black 工艺能否迁移到燃气热水器外壳?",
    "设计简报生成": "生成全屋净水 2.0 的设计简报,关联 O1 与局改用户画像。",
    "故障诊断助手": "工单 #SR-20260425-9821:用户反映出水压力不稳。",
    "价格异常检测": "上海地区,4 月,线上线下分渠道。",
    "公司文档全局检索": "FY26 战略中关于 DTC 渠道的核心假设是什么?",
    "会议纪要结构化": "粘贴战略会录音文本…",
    "创建设计简报": "全屋净水 2.0 — 局改方案产品化",
    "材料方案对比": "X 系列外壳:PVD-Black vs 阳极氧化 vs 喷涂,500 件试产规模。",
    "CMF 可行性检查": "上传 CMF 方案图,检查与中台已有材料/工艺的匹配度。",
    "供应商 / 工艺评审": "净水 2.0 膜组件供应商评审,优先杭州 / 江苏候选。",
    "工单故障归因": "工单 #SR-20260425-9821:用户反映出水压力不稳。",
    "渠道价格异常排查": "上海地区,4 月,线上线下分渠道。",
    "动销预测与补货建议": "全屋净水套系 SKU 池,4 周动销预测。"
  };
  return map[item.name] || "请描述本次任务的关键参数。";
}

function defaultOutput({ item, input }) {
  // Simulated output that echoes the input + item.output template, with
  // some fixed "context" pills so it looks plausible. Real backend would
  // replace this.
  const hint = (input || "").slice(0, 60);
  return {
    title: `${item.name} · 完成`,
    meta: `调用 Claude Sonnet 4.5 · 推理 1.4s · 引用 ${(item.linkedDomains || []).length || 3} 条知识`,
    body: `已基于公司 OKR 和 ${(item.linkedDomains || []).length || "若干"} 个知识域生成 ${item.output || "结构化输出"}。

输入: "${hint}${(input || "").length > 60 ? "…" : ""}"

要点:
• 自动注入了 FY26 公司级背景与相关项目
• 引用了 ${(item.linkedSkills || []).length || 2} 个上游技能的中间结果
• 标记了 1 个需要人工审核的关键假设

后续动作: 可保存为知识条目、写回项目进度,或发送给部门助手继续追问。`,
    sources: ["FY26 集团战略与年度 OKR", item.input ? `输入 · ${item.input}` : "公司知识中心 RAG 命中 12 段"]
  };
}
