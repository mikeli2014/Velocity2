// Velocity OS — App shell, sidebar, topbar, Home page

const { useState, useEffect, useMemo, useRef } = React;

// ============== Sidebar ===========================================
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

function Sidebar({ route, setRoute }) {
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
                {item.badge && <span className={`sidebar__item-badge ${item.id==="strategy" ? "is-alert" : ""}`}>{item.badge}</span>}
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

// ============== Topbar / breadcrumbs =====================================
function Topbar({ route, setRoute }) {
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

// ============== Home page =================================================
function HomePage({ setRoute }) {
  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">{Company.fiscalYear} · 企业认知总览</div>
            <h1 className="page-head__title">早上好，志远</h1>
            <p className="page-head__subtitle">
              本周公司有 <strong style={{ color: "var(--fg1)" }}>3 个</strong> 战略议题在研讨中,
              <strong style={{ color: "var(--fg1)" }}>27 个</strong> 关键项目在执行,
              其中 <strong style={{ color: "var(--danger-text)" }}>4 个</strong> 出现风险信号。
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.Calendar size={14} /> 本季度</button>
            <button className="btn btn--primary btn--sm" onClick={() => setRoute({ page: "strategy" })}>
              <Icon.Plus size={14} /> 提出战略问题
            </button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        <KpiCard label="战略对齐率" value="74%" delta="+6.2pt" status="up" spark={[40, 48, 52, 50, 58, 64, 68, 74]} color="var(--vel-indigo)" />
        <KpiCard label="知识复用率" value="44%" delta="+3.1pt" status="up" spark={[28, 32, 30, 36, 38, 40, 42, 44]} color="#10b981" />
        <KpiCard label="项目健康度" value="81%" delta="-2.4pt" status="down" spark={[88, 90, 86, 84, 85, 83, 82, 81]} color="#f59e0b" />
        <KpiCard label="助手日活员工" value="1,128" delta="+182" status="up" spark={[640, 720, 810, 870, 920, 990, 1040, 1128]} color="#7c3aed" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* OKR snapshot */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Target size={14} style={{ color: "var(--vel-indigo)" }} />
                公司级 OKR · {Company.fiscalYear}
              </div>
              <button className="btn btn--text btn--sm" onClick={() => setRoute({ page: "okr" })}>
                查看全部 <Icon.Chevron size={12} />
              </button>
            </div>
            <div style={{ padding: "4px 0" }}>
              {Objectives.map((o, i) => (
                <div key={o.id} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                  alignItems: "center", gap: 14,
                  padding: "12px 18px",
                  borderTop: i ? "1px solid var(--border-soft)" : "none"
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "var(--vel-indigo-50)", color: "var(--vel-indigo-700)",
                    display: "grid", placeItems: "center",
                    fontWeight: 800, fontSize: 13, fontFamily: "var(--font-mono)"
                  }}>{o.code}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--fg3)" }}>{o.owner}</span>
                      <span style={{ width: 3, height: 3, borderRadius: 99, background: "var(--fg4)" }} />
                      <span style={{ fontSize: 11, color: "var(--fg3)" }}>{o.krs.length} KR · {o.linkedProjects.length} 项目</span>
                    </div>
                  </div>
                  <div style={{ width: 140 }}>
                    <Progress value={o.progress} status={o.status === "on-track" ? "info" : "warn"} />
                  </div>
                  <div style={{ width: 48, textAlign: "right" }} className="num"
                       title={o.progress + "%"}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{o.progress}</span>
                    <span style={{ fontSize: 11, color: "var(--fg3)", marginLeft: 1 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key projects */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Layers size={14} style={{ color: "#10b981" }} />
                关键项目健康度
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span className="pill pill--ok">正常 {Projects.filter(p=>p.health==='ok').length}</span>
                <span className="pill pill--warn">关注 {Projects.filter(p=>p.health==='warn').length}</span>
                <span className="pill pill--danger">风险 {Projects.filter(p=>p.health==='danger').length}</span>
              </div>
            </div>
            <div>
              {Projects.slice(0, 5).map((p, i) => (
                <div key={p.id} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                  gap: 12, alignItems: "center",
                  padding: "11px 18px",
                  borderTop: i ? "1px solid var(--border-soft)" : "none"
                }}>
                  <div className={`dot dot--${p.health}`} style={{ position: "relative" }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>
                      {p.dept} · {p.owner} · 里程碑 <strong style={{ color: "var(--fg2)", fontWeight: 600 }}>{p.milestone}</strong> · {p.due}
                    </div>
                  </div>
                  <span className="pill pill--indigo num">{p.okr}</span>
                  <div style={{ width: 130, display: "flex", alignItems: "center", gap: 8 }}>
                    <Progress value={p.progress} status={p.health} />
                    <span className="num" style={{ fontSize: 12, color: "var(--fg2)", width: 28, textAlign: "right" }}>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy debate teaser */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4C1D95 100%)",
            color: "#fff",
            border: "none"
          }}>
            <div style={{ padding: 22, display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(255,255,255,0.1)",
                display: "grid", placeItems: "center",
                border: "1px solid rgba(255,255,255,0.15)"
              }}>
                <Icon.Compass size={26} style={{ color: "#c4b5fd" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>战略画布 · 第 3 轮研讨进行中</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{StrategyQuestion.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", marginRight: 6 }}>
                    {StrategyQuestion.agents.slice(0, 5).map((aid, i) => {
                      const ag = Agents.find(a => a.id === aid);
                      return <div key={aid} style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: ag.color, color: "#fff",
                        fontSize: 10, fontWeight: 700,
                        display: "grid", placeItems: "center",
                        marginLeft: i ? -6 : 0,
                        border: "2px solid #312E81"
                      }}>{ag.name[0]}</div>;
                    })}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>7 个 Agent · 3 个赞成 · 1 个反对 · 3 个保留</span>
                </div>
              </div>
              <button className="btn btn--lg" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }} onClick={() => setRoute({ page: "strategy" })}>
                进入研讨 <Icon.ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Activity */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Activity size={14} style={{ color: "var(--vel-indigo)" }} />
                动态
              </div>
              <span className="pill pill--ghost">实时</span>
            </div>
            <div style={{ padding: "6px 0" }}>
              {Activity.map((a, i) => (
                <div key={a.id} style={{
                  display: "flex", gap: 10,
                  padding: "10px 18px",
                  borderTop: i ? "1px solid var(--border-soft)" : "none"
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: a.type === "risk" ? "var(--danger)" : a.type === "strategy" ? "var(--vel-indigo)" : a.type === "knowledge" ? "var(--success)" : "var(--fg4)",
                    marginTop: 6, flexShrink: 0
                  }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--fg2)" }}>
                      <strong style={{ color: "var(--fg1)", fontWeight: 600 }}>{a.who}</strong> {a.what} <span style={{ color: "var(--fg1)", fontWeight: 500 }}>{a.target}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 2 }}>{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department status */}
          <div className="card">
            <div className="card__head">
              <div className="card__title">
                <Icon.Layers size={14} style={{ color: "#7c3aed" }} />
                部门工作空间
              </div>
              <button className="btn btn--text btn--sm" onClick={() => setRoute({ page: "departments" })}>
                全部 <Icon.Chevron size={12} />
              </button>
            </div>
            <div style={{ padding: "4px 0" }}>
              {Departments.filter(d => !d.parentId).slice(0, 5).map((d, i) => (
                <div key={d.id} onClick={() => setRoute({ page: "department", deptId: d.id })}
                  style={{
                    display: "flex", gap: 11, alignItems: "center",
                    padding: "10px 18px", cursor: "pointer",
                    borderTop: i ? "1px solid var(--border-soft)" : "none"
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: d.color + "18", color: d.color,
                    display: "grid", placeItems: "center", flexShrink: 0
                  }}>
                    {React.createElement(Icon[d.icon], { size: 15 })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg1)" }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg3)" }}>{d.knowledge ? `${d.knowledge} 条知识 · ${d.skills} 技能` : "未启动"}</div>
                  </div>
                  <HealthPill status={d.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, status, spark, color }) {
  return (
    <div className="kpi">
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      <div className={`kpi__delta kpi__delta--${status}`}>
        {status === "up" ? <Icon.TrendUp size={11} /> : <Icon.TrendDown size={11} />}
        {delta} <span style={{ color: "var(--fg4)", fontWeight: 500 }}> 较上周</span>
      </div>
      {spark && <div className="kpi__spark"><Spark data={spark} color={color} w={70} h={28} /></div>}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, HomePage });
