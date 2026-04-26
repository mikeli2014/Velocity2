import React, { useState, useMemo, useEffect, useRef } from "react";
import { Icon } from "./primitives.jsx";
import { Company, Departments, Notifications as SeedNotifications, NOTIFICATION_CATEGORIES } from "../data/seed.js";
import { useApi, apiFetch } from "../lib/api.js";

const NAV = [
  { id: "home", label: "首页", en: "Home", icon: "Home" },
  { id: "knowledge", label: "公司知识中心", en: "Knowledge", icon: "Database", badge: "1.2k" },
  { id: "strategy", label: "战略工作台", en: "Strategy", icon: "Compass", badge: "3" },
  { id: "okr", label: "OKR 与关键项目", en: "OKR & Projects", icon: "Target" },
  { id: "departments", label: "部门工作空间", en: "Departments", icon: "Layers", expandable: true },
  { id: "skills", label: "技能中心", en: "Skill Packs", icon: "Sparkles" },
  { id: "workflows", label: "工作流中心", en: "Workflows", icon: "Workflow" },
  { id: "assistants", label: "助手中心", en: "Assistants", icon: "MessageCircle" },
  { id: "governance", label: "权限与治理", en: "Governance", icon: "Shield" },
  { id: "admin", label: "管理后台", en: "Admin Console", icon: "Settings" }
];

export function Sidebar({ route, setRoute }) {
  const [deptOpen, setDeptOpen] = useState(true);
  const isActive = (id) => route.page === id || (id === "departments" && route.page === "department");

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">V</div>
        <div className="sidebar__brand-text">
          <div className="sidebar__brand-name">Velocity</div>
          <div className="sidebar__brand-sub">Enterprise OS</div>
        </div>
      </div>

      <div className="sidebar__company">
        <div className="sidebar__company-logo">{Company.initials}</div>
        <div className="sidebar__company-info">
          <div className="sidebar__company-name">{Company.name}</div>
          <div className="sidebar__company-meta">{Company.fiscalYear} · {Company.employees} 人</div>
        </div>
        <Icon.ChevronDown size={14} style={{ opacity: 0.5 }} />
      </div>

      <div className="sidebar__section">工作台</div>
      <nav className="sidebar__nav">
        {NAV.map(item => {
          const IconComp = Icon[item.icon];
          const active = isActive(item.id);
          return (
            <React.Fragment key={item.id}>
              <div
                className={`sidebar__item ${active ? "is-active" : ""}`}
                onClick={() => {
                  if (item.expandable) { setDeptOpen(o => !o); setRoute({ page: item.id }); }
                  else setRoute({ page: item.id });
                }}
              >
                <IconComp size={16} className="sidebar__item-icon" />
                <span>{item.label}</span>
                {item.badge && <span className={`sidebar__item-badge ${item.id === "strategy" ? "is-alert" : ""}`}>{item.badge}</span>}
                {item.expandable && (
                  <Icon.ChevronDown size={13} style={{ marginLeft: "auto", opacity: 0.5, transform: deptOpen ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
                )}
              </div>
              {item.id === "departments" && deptOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1, marginLeft: 4 }}>
                  {Departments.filter(d => !d.parentId).map(d => {
                    const sActive = route.page === "department" && route.deptId === d.id;
                    return (
                      <div
                        key={d.id}
                        className={`sidebar__sub ${sActive ? "is-active" : ""}`}
                        onClick={(e) => { e.stopPropagation(); setRoute({ page: "department", deptId: d.id }); }}
                      >
                        <span className="sidebar__sub-dot" style={{ background: sActive ? d.color : undefined }} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                        {d.status === "live" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__avatar">陈</div>
        <div className="sidebar__user">
          <div className="sidebar__user-name">陈志远</div>
          <div className="sidebar__user-role">CEO · 战略办</div>
        </div>
        <button className="topbar__icon-btn" style={{ color: "rgba(255,255,255,0.5)" }}>
          <Icon.Settings size={15} />
        </button>
      </div>
    </aside>
  );
}

export function Topbar({ route, setRoute }) {
  // Notifications come from /api/v1/notifications with seed fallback.
  // Mark-read uses POST /api/v1/notifications/{id}/read (or /mark-all-read).
  const { data: apiNotifs, refresh: refreshNotifs } = useApi("/api/v1/notifications");
  const baseNotifs = apiNotifs ?? SeedNotifications.map(n => ({ ...n }));
  const [notifs, setNotifs] = useState(baseNotifs);
  const lastApiRef = useRef(apiNotifs);
  if (apiNotifs && apiNotifs !== lastApiRef.current) {
    lastApiRef.current = apiNotifs;
    setNotifs(apiNotifs);
  }
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!notifOpen) return undefined;
    function onDoc(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [notifOpen]);

  function openNotif(n) {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    setNotifOpen(false);
    if (n.link && setRoute) setRoute(n.link);
    apiFetch(`/api/v1/notifications/${n.id}/read`, { method: "POST" })
      .then(() => refreshNotifs())
      .catch(() => { /* keep optimistic local state */ });
  }
  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    apiFetch("/api/v1/notifications/mark-all-read", { method: "POST" })
      .then(() => refreshNotifs())
      .catch(() => { /* keep optimistic local state */ });
  }

  const crumbs = useMemo(() => {
    const map = {
      home: ["首页"],
      knowledge: ["公司知识中心"],
      strategy: ["战略工作台"],
      okr: ["OKR 与关键项目"],
      departments: ["部门工作空间"],
      department: ["部门工作空间", Departments.find(d => d.id === route.deptId)?.name],
      skills: ["技能中心"],
      workflows: ["工作流中心"],
      assistants: ["助手中心"],
      governance: ["权限与治理"],
      admin: ["管理后台"]
    };
    return map[route.page] || ["首页"];
  }, [route]);

  return (
    <header className="topbar">
      <div className="topbar__crumbs">
        <Icon.Home size={14} />
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <Icon.Chevron size={12} />
            <strong>{c}</strong>
          </React.Fragment>
        ))}
      </div>
      <div
        className="topbar__search"
        onClick={() => window.dispatchEvent(new Event("velocity:open-palette"))}
        style={{ cursor: "text" }}
      >
        <Icon.Search size={14} />
        <input
          placeholder="搜索知识、项目、OKR、部门、决策…"
          readOnly
          onFocus={(e) => {
            e.target.blur();
            window.dispatchEvent(new Event("velocity:open-palette"));
          }}
          style={{ cursor: "text" }}
        />
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar__actions">
        <ApiConnectionIndicator />
        <button className="topbar__icon-btn" title="新建" onClick={() => window.dispatchEvent(new Event("velocity:open-palette"))}>
          <Icon.Plus size={16} />
        </button>
        <button className="topbar__icon-btn" title="助手" onClick={() => setRoute && setRoute({ page: "assistants" })}>
          <Icon.MessageCircle size={16} />
        </button>
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            className="topbar__icon-btn"
            title="通知"
            onClick={() => setNotifOpen(o => !o)}
            aria-expanded={notifOpen}
          >
            <Icon.Bell size={16} />
            {unread > 0 && <span className="dot" />}
          </button>
          {notifOpen && (
            <NotificationDropdown
              notifs={notifs}
              unread={unread}
              onPick={openNotif}
              onMarkAllRead={markAllRead}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}

function NotificationDropdown({ notifs, unread, onPick, onMarkAllRead, onClose }) {
  return (
    <div
      role="dialog"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        width: 380,
        maxHeight: "70vh",
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 12,
        boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        overflow: "hidden"
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="row" style={{ justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border-soft)" }}>
        <div className="row" style={{ gap: 8 }}>
          <Icon.Bell size={14} style={{ color: "var(--vel-indigo)" }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>通知</div>
          {unread > 0 && <span className="pill pill--danger num">{unread} 未读</span>}
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn--text btn--sm" disabled={unread === 0} onClick={onMarkAllRead} style={unread === 0 ? { opacity: 0.4 } : {}}>全部已读</button>
          <button className="icon-btn" onClick={onClose} title="关闭"><Icon.X size={13} /></button>
        </div>
      </div>
      <div className="scroll" style={{ flex: 1, overflow: "auto" }}>
        {notifs.length === 0 && (
          <div style={{ padding: 28, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>暂无通知</div>
        )}
        {notifs.map((n, i) => {
          const cat = NOTIFICATION_CATEGORIES[n.category] || NOTIFICATION_CATEGORIES.project;
          const IconC = Icon[cat.icon] || Icon.Bell;
          return (
            <div
              key={n.id}
              onClick={() => onPick(n)}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr",
                gap: 12,
                padding: "12px 16px",
                borderTop: i ? "1px solid var(--border-soft)" : "none",
                cursor: "pointer",
                background: n.read ? "transparent" : "rgba(99,102,241,0.04)"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--slate-50)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = n.read ? "transparent" : "rgba(99,102,241,0.04)"; }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: cat.color + "18", color: cat.color,
                display: "grid", placeItems: "center"
              }}>
                <IconC size={14} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 2, gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: "var(--fg1)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</div>
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--vel-indigo)", flexShrink: 0, marginTop: 6 }} />}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.5 }}>{n.body}</div>
                <div className="row" style={{ gap: 8, marginTop: 6, fontSize: 11, color: "var(--fg4)" }}>
                  <span className="pill" style={{ background: cat.color + "20", color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                  <span>{n.at}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApiConnectionIndicator() {
  // Cheap liveness probe — hits /api/v1/health on mount and stays passive.
  // Showing a small green/grey dot in the topbar so the connection state
  // is visible without needing to open dev tools or look at per-page pills.
  const { data, error, loading } = useApi("/api/v1/health");
  const status = loading ? "loading" : error ? "offline" : "online";
  const meta = {
    online:  { color: "#10b981", label: `API · ${data?.database || "online"}`, title: data ? `Velocity API v${data.version} · ${data.database} · ${data.objectiveCount} 个 Objective` : "API connected" },
    offline: { color: "#94a3b8", label: "离线 (seed)",                          title: error?.message || "API unreachable — using bundled seed data" },
    loading: { color: "#fbbf24", label: "连接中…",                              title: "Probing /api/v1/health" }
  };
  const m = meta[status];
  return (
    <span
      className="pill pill--neutral"
      title={m.title}
      style={{
        gap: 6, marginRight: 6,
        background: status === "online" ? "rgba(16,185,129,0.10)" : status === "loading" ? "rgba(251,191,36,0.10)" : undefined,
        color: status === "online" ? "var(--success-text)" : status === "loading" ? "var(--warning-text)" : "var(--fg3)"
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: 3,
        background: m.color,
        boxShadow: status === "online" ? "0 0 0 3px rgba(16,185,129,0.18)" : undefined,
        animation: status === "loading" ? "spin 1s linear infinite" : undefined
      }} />
      {m.label}
    </span>
  );
}
