import React, { useState, useMemo } from "react";
import { Icon } from "./primitives.jsx";
import { Company, Departments } from "../data/seed.js";

const NAV = [
  { id: "home", label: "首页", en: "Home", icon: "Home" },
  { id: "knowledge", label: "公司知识中心", en: "Knowledge", icon: "Database", badge: "1.2k" },
  { id: "strategy", label: "战略工作台", en: "Strategy", icon: "Compass", badge: "3" },
  { id: "okr", label: "OKR 与关键项目", en: "OKR & Projects", icon: "Target" },
  { id: "departments", label: "部门工作空间", en: "Departments", icon: "Layers", expandable: true },
  { id: "skills", label: "技能中心", en: "Skill Packs", icon: "Sparkles" },
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

export function Topbar({ route }) {
  const crumbs = useMemo(() => {
    const map = {
      home: ["首页"],
      knowledge: ["公司知识中心"],
      strategy: ["战略工作台"],
      okr: ["OKR 与关键项目"],
      departments: ["部门工作空间"],
      department: ["部门工作空间", Departments.find(d => d.id === route.deptId)?.name],
      skills: ["技能中心"],
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
      <div className="topbar__search">
        <Icon.Search size={14} />
        <input placeholder="搜索知识、项目、OKR、部门、决策…" />
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar__actions">
        <button className="topbar__icon-btn" title="新建">
          <Icon.Plus size={16} />
        </button>
        <button className="topbar__icon-btn" title="助手">
          <Icon.MessageCircle size={16} />
        </button>
        <button className="topbar__icon-btn" title="通知">
          <Icon.Bell size={16} />
          <span className="dot" />
        </button>
      </div>
    </header>
  );
}
