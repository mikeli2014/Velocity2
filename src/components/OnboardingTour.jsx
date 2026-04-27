import React, { useState } from "react";
import { Icon, Modal } from "./primitives.jsx";

// A lightweight modal-style walkthrough — NOT a spotlight overlay.
// Each step is a card with a title, body, and an optional "试试看 →"
// button that routes to the relevant page. The user clicks 下一步
// to advance or 跳过 to dismiss permanently (localStorage flag).

const STORAGE_KEY = "velocity:tour-dismissed";

const STEPS = [
  {
    title: "欢迎来到 Velocity OS",
    body: "这是一个为中国企业打造的「企业知识与战略操作系统」演示。所有功能都通过 Claude (Sonnet 4.6 + Haiku 4.5) 真实驱动,数据存于本地 SQLite + 远端 Cloud Run。",
    icon: "Sparkles"
  },
  {
    title: "公司知识中心",
    body: "8 个知识源 + 8 个知识域,可上传文件进入 Ingest Queue,审批后入库为 KnowledgeSource。",
    icon: "Database",
    route: { page: "knowledge" }
  },
  {
    title: "部门工作空间 · 助手聊天",
    body: "进入「工业设计部」,Tab 切到「助手」,与「小龙虾」对话。每个回复都是真实流式 Sonnet 4.6 调用,前缀通过 prompt caching 复用。",
    icon: "MessageCircle",
    route: { page: "department", deptId: "industrial-design" }
  },
  {
    title: "战略工作台 · War Council",
    body: "选一个战略问题(或新建一个),切到 War Council 标签运行多 Agent 辩论。每个 Agent 独立调用,事件级流式渲染。",
    icon: "Compass",
    route: { page: "strategy" }
  },
  {
    title: "结构化输出 → OKR / 项目 / 决策",
    body: "辩论结束后,在「战略选项」标签生成候选方案,「结构化输出」把推荐方案落地为 Objective + KR + 关键项目 + 决策日志草案。一键写入。",
    icon: "Target",
    route: { page: "strategy" }
  },
  {
    title: "助手中心 · 路由分类器",
    body: "Haiku 4.5 实时把用户提问分类到部门规则。前往「助手中心」点击「测试路由」面板试试。",
    icon: "GitBranch",
    route: { page: "assistants" }
  },
  {
    title: "管理后台 · AI 用量与缓存命中",
    body: "所有 Claude 调用都被记录,管理后台「Token 用量」标签下可看到模型 / 路由 / 缓存命中率的实时统计。",
    icon: "BarChart",
    route: { page: "admin" }
  }
];

function dismissTour() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch (e) { /* localStorage disabled */ void e; }
}

export function OnboardingTour({ onClose, setRoute }) {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const IconC = (step.icon && Icon[step.icon]) || Icon.Sparkles;

  function next() {
    if (isLast) {
      dismissTour();
      onClose();
      return;
    }
    setStepIdx(i => Math.min(STEPS.length - 1, i + 1));
  }
  function prev() { setStepIdx(i => Math.max(0, i - 1)); }
  function skip() {
    dismissTour();
    onClose();
  }
  function tryIt() {
    if (!step.route || !setRoute) return;
    dismissTour();
    setRoute(step.route);
    onClose();
  }

  return (
    <Modal
      title="5 分钟产品导览"
      sub={`第 ${stepIdx + 1} / ${STEPS.length} 步`}
      onClose={skip}
      foot={<>
        <button className="btn btn--ghost btn--sm" onClick={skip}>跳过</button>
        {stepIdx > 0 && <button className="btn btn--ghost btn--sm" onClick={prev}><Icon.ArrowRight size={12} style={{ transform: "rotate(180deg)" }} /> 上一步</button>}
        {step.route && <button className="btn btn--ghost btn--sm" onClick={tryIt}><Icon.PlayCircle size={12} /> 试试看 →</button>}
        <button className="btn btn--primary btn--sm" onClick={next}>
          {isLast ? "完成" : "下一步"} {!isLast && <Icon.ArrowRight size={12} />}
        </button>
      </>}
    >
      <div style={{ padding: "20px 6px 6px", display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--vel-indigo-50)", color: "var(--vel-indigo)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <IconC size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--fg1)", marginBottom: 8 }}>{step.title}</div>
          <div style={{ fontSize: 13.5, color: "var(--fg2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{step.body}</div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 4, marginTop: 24 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= stepIdx ? "var(--vel-indigo)" : "var(--slate-100)"
            }}
          />
        ))}
      </div>
    </Modal>
  );
}
