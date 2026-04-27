// Velocity OS — shared icons + small primitives.
import React from "react";

const I = (path, viewBox = "0 0 24 24") => ({ size = 16, className = "", style }) =>
  React.createElement("svg", {
    width: size, height: size, viewBox,
    fill: "none", stroke: "currentColor",
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
    className, style
  }, path);

export const Icon = {
  Home: I(<><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></>),
  Menu: I(<><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>),
  Database: I(<><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>),
  Compass: I(<><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>),
  Target: I(<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>),
  Layers: I(<><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></>),
  Sparkles: I(<><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2"/></>),
  Shield: I(<path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/>),
  Search: I(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>),
  Bell: I(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>),
  Chevron: I(<path d="m9 6 6 6-6 6"/>),
  ChevronDown: I(<path d="m6 9 6 6 6-6"/>),
  Plus: I(<><path d="M12 5v14M5 12h14"/></>),
  TrendUp: I(<><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></>),
  TrendDown: I(<><path d="m3 7 6 6 4-4 8 8"/><path d="M14 17h7v-7"/></>),
  Activity: I(<path d="M3 12h4l3-9 4 18 3-9h4"/>),
  AlertTriangle: I(<><path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.5"/></>),
  Check: I(<path d="m5 12 5 5 9-12"/>),
  X: I(<><path d="M6 6 18 18M18 6 6 18"/></>),
  Clock: I(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  Calendar: I(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>),
  File: I(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>),
  FileText: I(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>),
  Users: I(<><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M22 19c0-2.5-1.6-4.5-4.5-5"/></>),
  User: I(<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></>),
  Building: I(<><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></>),
  Network: I(<><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7v3M9.5 11h5l-2.5 5.5M12 11l-5 6.5M12 11l5 6.5"/></>),
  Boxes: I(<><path d="M3 8 12 4l9 4M3 8v8l9 4M3 8l9 4 9-4M21 8v8l-9 4M12 12v12"/></>),
  Wrench: I(<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4z"/>),
  Megaphone: I(<><path d="M3 11v3l11 5V6L3 11Z"/><path d="M14 8a4 4 0 0 1 0 8"/></>),
  Pencil: I(<><path d="M14 4 4 14v6h6L20 10z"/><path d="m13 5 6 6"/></>),
  Calculator: I(<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0M8 19h6"/></>),
  Cpu: I(<><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></>),
  GitBranch: I(<><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 8.5v7M8.5 9c4 0 7 0 7 4v.5"/></>),
  Eye: I(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>),
  Stethoscope: I(<><path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13c0 4 3 7 7 7s4-3 4-5"/><circle cx="18" cy="13" r="2"/></>),
  BarChart: I(<><path d="M5 21V10M12 21V4M19 21v-7"/></>),
  Settings: I(<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2.1-1.6-2-3.4-2.5.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.4 2.5a7 7 0 0 0-2.1 1.2L5 5.8l-2 3.4 2.1 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2L3 14.8l2 3.4 2.5-.9a7 7 0 0 0 2.1 1.2L10 21h4l.4-2.5a7 7 0 0 0 2.1-1.2l2.5.9 2-3.4-2.1-1.6c.1-.4.1-.8.1-1.2z"/></>),
  Globe: I(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>),
  Send: I(<><path d="m4 4 16 8-16 8 3-8z"/><path d="m7 12 13 0"/></>),
  Paperclip: I(<path d="m21 11-9 9a5 5 0 0 1-7-7L14 3a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/>),
  Mic: I(<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>),
  Folder: I(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>),
  Tag: I(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/></>),
  Lock: I(<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>),
  Cloud: I(<path d="M7 18a4 4 0 0 1-1-7.9 6 6 0 0 1 11.6 1.5A4 4 0 0 1 17 18z"/>),
  Filter: I(<path d="M3 5h18l-7 8v6l-4-2v-4z"/>),
  MoreH: I(<><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></>),
  Star: I(<path d="m12 3 2.6 6 6.4.5-4.9 4.3 1.5 6.2L12 17l-5.6 3 1.5-6.2L3 9.5l6.4-.5z"/>),
  Crown: I(<path d="m3 7 4 4 5-7 5 7 4-4-2 12H5z"/>),
  Coins: I(<><circle cx="9" cy="9" r="6"/><path d="M19 6a6 6 0 0 1 0 12 6 6 0 0 1-2.5-.6"/><path d="M9 6v6M11 8H7M11 11H7"/></>),
  Package: I(<><path d="M3 7 12 3l9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>),
  Truck: I(<><path d="M3 16V6h11v10M14 9h4l3 4v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>),
  Camera: I(<><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></>),
  Upload: I(<><path d="M4 17v3h16v-3"/><path d="M12 14V4M7 9l5-5 5 5"/></>),
  Workflow: I(<><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M6 9v3h12V9M12 12v3"/></>),
  MessageCircle: I(<path d="M21 12a8 8 0 1 1-3.6-6.7L21 4l-1.3 4A8 8 0 0 1 21 12z"/>),
  Beaker: I(<><path d="M9 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V3"/><path d="M8 3h8M7 14h10"/></>),
  Map: I(<><path d="M3 6 9 4l6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16M15 6v16"/></>),
  Brain: I(<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h6a3 3 0 0 0 3-3 3 3 0 0 0 2-5 3 3 0 0 0-2-5 3 3 0 0 0-3-3z"/>),
  PieChart: I(<><path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M21 12a9 9 0 0 0-9-9v9z"/></>),
  RefreshCw: I(<><path d="M21 4v6h-6M3 20v-6h6"/><path d="M20 9a8 8 0 0 0-14-3M4 15a8 8 0 0 0 14 3"/></>),
  PlayCircle: I(<><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z" fill="currentColor"/></>),
  Pause: I(<><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>),
  Link: I(<><path d="M9 15a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1.5 1.5"/><path d="M15 9a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l1.5-1.5"/></>),
  ArrowRight: I(<><path d="M5 12h14M13 6l6 6-6 6"/></>),
  Quote: I(<path d="M7 7h4v4l-2 6H5l2-6V7zm8 0h4v4l-2 6h-4l2-6V7z"/>),
  Save: I(<><path d="M5 5a2 2 0 0 1 2-2h10l4 4v10a2 2 0 0 1-2 2H5z"/><path d="M7 3v6h10V3M7 21v-7h10v7"/></>),
  Code: I(<><path d="m9 17-5-5 5-5M15 7l5 5-5 5"/></>),
  Hash: I(<><path d="M5 9h14M5 15h14M9 4l-2 16M17 4l-2 16"/></>),
  Image: I(<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m3 17 5-5 5 5 3-3 5 4"/></>),
  AtSign: I(<><circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3 6.7"/></>),
  Inbox: I(<><path d="M3 13h5l1 3h6l1-3h5"/><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></>),
  Hammer: I(<><path d="M14 2 9 7l3 3 5-5z"/><path d="m11 9-7 7 3 3 7-7"/></>),
  Trash: I(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v7M14 11v7"/></>),
  Edit: I(<><path d="M4 20h4l10-10-4-4L4 16z"/><path d="m13 6 4 4"/></>),
  Copy: I(<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></>)
};

// ===== Spark line ===========================================================
export function Spark({ data, color = "var(--vel-indigo)", w = 70, h = 28 }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length-1] - min) / span) * (h - 4) - 2} r="2" fill={color} />
    </svg>
  );
}

// ===== Progress bar =========================================================
export function Progress({ value, status = "ok", height = 6 }) {
  const colors = {
    ok: "linear-gradient(90deg, #10b981, #34d399)",
    warn: "linear-gradient(90deg, #f59e0b, #fbbf24)",
    danger: "linear-gradient(90deg, #ef4444, #f87171)",
    info: "linear-gradient(90deg, #4F46E5, #818cf8)"
  };
  return (
    <div style={{ height, background: "var(--slate-100)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        height: "100%",
        background: colors[status] || colors.ok,
        borderRadius: 999,
        transition: "width 0.4s ease"
      }} />
    </div>
  );
}

// ===== Avatar group =========================================================
export function Avatar({ name, size = 24, color, style }) {
  const initials = name?.slice(0, 1) || "?";
  const c = color || "linear-gradient(135deg, #6366f1, #a855f7)";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: c, color: "#fff",
      display: "grid", placeItems: "center",
      fontSize: size * 0.42, fontWeight: 700,
      letterSpacing: "-0.02em",
      flexShrink: 0,
      ...style
    }}>{initials}</div>
  );
}

// ===== Health pill ==========================================================
export function HealthPill({ status, label }) {
  const map = {
    ok: { cls: "pill--ok", txt: label || "正常" },
    warn: { cls: "pill--warn", txt: label || "关注" },
    danger: { cls: "pill--danger", txt: label || "风险" },
    info: { cls: "pill--info", txt: label || "进行中" },
    "on-track": { cls: "pill--ok", txt: label || "进展正常" },
    "at-risk": { cls: "pill--warn", txt: label || "存在风险" },
    "achieved": { cls: "pill--ok", txt: label || "已达成" },
    "in-debate": { cls: "pill--indigo", txt: label || "研讨中" },
    "approved": { cls: "pill--ok", txt: label || "已审核" },
    "review": { cls: "pill--warn", txt: label || "待审核" },
    "draft": { cls: "pill--neutral", txt: label || "草稿" },
    "live": { cls: "pill--ok", txt: label || "已上线" },
    "configuring": { cls: "pill--info", txt: label || "配置中" },
    "not-started": { cls: "pill--neutral", txt: label || "未启动" }
  };
  const m = map[status] || { cls: "pill--neutral", txt: label || status };
  return <span className={`pill ${m.cls}`}>{m.txt}</span>;
}

// ===== KPI card =============================================================
export function KpiCard({ label, value, delta, status, spark, color }) {
  return (
    <div className="kpi">
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      {delta && (
        <div className={`kpi__delta kpi__delta--${status}`}>
          {status === "up" ? <Icon.TrendUp size={11} /> : <Icon.TrendDown size={11} />}
          {delta} <span style={{ color: "var(--fg4)", fontWeight: 500 }}> 较上周</span>
        </div>
      )}
      {spark && <div className="kpi__spark"><Spark data={spark} color={color} w={70} h={28} /></div>}
    </div>
  );
}

// ===== Modal primitives =====================================================
export function Modal({ title, sub, onClose, large, children, foot }) {
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

export function ConfirmModal({ title, body, danger, onCancel, onConfirm, confirmLabel = "删除" }) {
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

export function EmptyState({ label, cta, onCta }) {
  return (
    <div className="card" style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 12 }}>{label}</div>
      {cta && <button className="btn btn--primary btn--sm" onClick={onCta}><Icon.Plus size={14} /> {cta}</button>}
    </div>
  );
}

export function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
}

export const STATUS_OPTS = [
  { v: "on-track", label: "进行中" },
  { v: "at-risk", label: "有风险" },
  { v: "achieved", label: "已达成" }
];
export const HEALTH_OPTS = [
  { v: "ok", label: "健康" },
  { v: "warn", label: "关注" },
  { v: "danger", label: "告警" }
];
