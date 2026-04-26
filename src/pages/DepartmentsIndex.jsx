import React, { useState } from "react";
import { Icon, HealthPill } from "../components/primitives.jsx";
import { Departments } from "../data/seed.js";

function buildDeptTree(list) {
  const byParent = new Map();
  list.forEach(d => {
    const k = d.parentId || "__root__";
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k).push(d);
  });
  return byParent;
}
function deptDescendants(list, id) {
  const out = [list.find(d => d.id === id)].filter(Boolean);
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop();
    list.filter(d => d.parentId === cur).forEach(c => { out.push(c); stack.push(c.id); });
  }
  return out;
}
function deptPath(list, id) {
  const path = [];
  let cur = list.find(d => d.id === id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId ? list.find(d => d.id === cur.parentId) : null;
  }
  return path;
}

function DepartmentTreeNode({ dept, byParent, selectedId, expanded, toggleExpand, onSelect, depth = 0 }) {
  const children = byParent.get(dept.id) || [];
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(dept.id);
  const isSel = selectedId === dept.id;
  const Ico = Icon[dept.icon] || Icon.Building;
  return (
    <div>
      <div
        onClick={() => onSelect(dept.id)}
        style={{
          display: "grid",
          gridTemplateColumns: "16px 22px 1fr auto",
          gap: 6,
          alignItems: "center",
          padding: `6px 8px 6px ${8 + depth * 14}px`,
          marginBottom: 1,
          borderRadius: 6,
          cursor: "pointer",
          background: isSel ? "var(--vel-indigo-50)" : "transparent",
          color: isSel ? "var(--vel-indigo-700)" : "var(--fg2)"
        }}
      >
        <span
          onClick={e => { if (hasChildren) { e.stopPropagation(); toggleExpand(dept.id); } }}
          style={{ display: "inline-grid", placeItems: "center", color: "var(--fg4)", cursor: hasChildren ? "pointer" : "default" }}
        >
          {hasChildren ? (
            <Icon.Chevron size={11} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          ) : <span style={{ width: 11 }} />}
        </span>
        <span style={{ display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 5, background: dept.color + "20", color: dept.color }}>
          <Ico size={13} />
        </span>
        <span style={{ fontSize: 12.5, fontWeight: isSel ? 700 : 500, color: isSel ? "var(--vel-indigo-700)" : "var(--fg1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dept.name}</span>
        <span className="num" style={{ fontSize: 10, color: "var(--fg4)" }}>{hasChildren ? children.length : ""}</span>
      </div>
      {hasChildren && isOpen && children.map(c => (
        <DepartmentTreeNode
          key={c.id} dept={c} byParent={byParent} selectedId={selectedId}
          expanded={expanded} toggleExpand={toggleExpand} onSelect={onSelect} depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function DepartmentsIndex({ setRoute }) {
  const [selectedId, setSelectedId] = useState("__root__");
  const [expanded, setExpanded] = useState(() => new Set(["industrial-design", "service", "cop"]));

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const byParent = buildDeptTree(Departments);
  const isRoot = selectedId === "__root__";
  const selected = !isRoot ? Departments.find(d => d.id === selectedId) : null;
  const path = !isRoot ? deptPath(Departments, selectedId) : [];
  const directChildren = isRoot ? (byParent.get("__root__") || []) : (byParent.get(selectedId) || []);
  const subtree = !isRoot ? deptDescendants(Departments, selectedId) : Departments;
  const rollup = subtree.reduce((acc, d) => ({
    people: acc.people + (d.people || 0),
    knowledge: acc.knowledge + (d.knowledge || 0),
    skills: acc.skills + (d.skills || 0),
    workflows: acc.workflows + (d.workflows || 0),
    projects: acc.projects + (d.projects || 0)
  }), { people: 0, knowledge: 0, skills: 0, workflows: 0, projects: 0 });

  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__row">
          <div>
            <div className="page-head__eyebrow">部门工作空间</div>
            <h1 className="page-head__title">部门工作空间</h1>
            <p className="page-head__subtitle">支持多级组织结构。每个部门拥有自己的知识库、技能包、工作流和助手。新增子部门通过配置完成,无需重写产品。</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.GitBranch size={13} /> 组织视图</button>
            <button className="btn btn--primary btn--sm"><Icon.Plus size={14} /> 注册新部门</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, alignItems: "start" }}>
        <div className="card" style={{ padding: 12, position: "sticky", top: 70, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div
            onClick={() => setSelectedId("__root__")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", marginBottom: 8,
              borderRadius: 6,
              background: isRoot ? "var(--vel-indigo-50)" : "transparent",
              color: isRoot ? "var(--vel-indigo-700)" : "var(--fg1)",
              cursor: "pointer",
              fontWeight: 700, fontSize: 13
            }}
          >
            <Icon.Building size={14} /> 集团
            <span className="num" style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg4)" }}>{Departments.filter(d => !d.parentId).length}</span>
          </div>
          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 8 }}>
            {(byParent.get("__root__") || []).map(d => (
              <DepartmentTreeNode
                key={d.id} dept={d} byParent={byParent}
                selectedId={selectedId} expanded={expanded}
                toggleExpand={toggleExpand} onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="row" style={{ gap: 6, marginBottom: 14, fontSize: 12, color: "var(--fg3)", flexWrap: "wrap" }}>
            <span onClick={() => setSelectedId("__root__")} style={{ cursor: "pointer" }}><Icon.Building size={12} style={{ verticalAlign: "-2px" }} /> 集团</span>
            {path.map((p, i) => (
              <React.Fragment key={p.id}>
                <Icon.Chevron size={10} style={{ color: "var(--fg4)" }} />
                <span
                  onClick={() => setSelectedId(p.id)}
                  style={{ cursor: "pointer", fontWeight: i === path.length - 1 ? 700 : 500, color: i === path.length - 1 ? "var(--fg1)" : "var(--fg3)" }}
                >{p.name}</span>
              </React.Fragment>
            ))}
          </div>

          {!isRoot && selected && (
            <div className="card" style={{ padding: 22, marginBottom: 18, background: `linear-gradient(135deg, ${selected.color}08, transparent 60%)` }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: selected.color + "20", color: selected.color, display: "grid", placeItems: "center" }}>
                  {React.createElement(Icon[selected.icon] || Icon.Building, { size: 24 })}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--fg1)" }}>{selected.name}</div>
                    <HealthPill status={selected.status} />
                    {directChildren.length > 0 && <span className="pill pill--neutral"><Icon.GitBranch size={10} /> {directChildren.length} 子部门</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg3)" }}>{selected.en} · 负责人 {selected.lead} · {selected.people} 人 · {selected.assistant !== "—" ? `助手 ${selected.assistant}` : "暂未配置助手"}</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn--ghost btn--sm" onClick={() => setRoute({ page: "department", deptId: selected.id })}>
                    进入工作空间 <Icon.ArrowRight size={12} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
                {[
                  { label: "员工 (含子部门)", value: rollup.people.toLocaleString() },
                  { label: "知识条目", value: rollup.knowledge.toLocaleString() },
                  { label: "技能", value: rollup.skills },
                  { label: "工作流", value: rollup.workflows },
                  { label: "项目", value: rollup.projects }
                ].map(s => (
                  <div key={s.label}>
                    <div className="num" style={{ fontSize: 20, fontWeight: 800, color: "var(--fg1)" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "var(--fg3)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {isRoot ? "一级部门" : (directChildren.length > 0 ? "子部门" : "下属团队")}
              <span className="num" style={{ fontSize: 11, color: "var(--fg4)", marginLeft: 6 }}>{directChildren.length}</span>
            </div>
            {!isRoot && directChildren.length === 0 && (
              <button className="btn btn--text btn--sm" onClick={() => setRoute({ page: "department", deptId: selected.id })}>
                查看部门工作空间 <Icon.ArrowRight size={11} />
              </button>
            )}
          </div>

          {directChildren.length === 0 && !isRoot ? (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
              <div style={{ marginBottom: 8 }}>该部门暂无子部门</div>
              <button className="btn btn--ghost btn--sm"><Icon.Plus size={12} /> 添加子部门</button>
            </div>
          ) : (
            <div className="grid grid-cols-3" style={{ gap: 14 }}>
              {directChildren.map(d => (
                <DepartmentCard
                  key={d.id} d={d}
                  childCount={(byParent.get(d.id) || []).length}
                  onOpen={() => setRoute({ page: "department", deptId: d.id })}
                  onDrillIn={() => setSelectedId(d.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartmentCard({ d, childCount, onOpen, onDrillIn }) {
  const Ico = Icon[d.icon] || Icon.Building;
  const hasChildren = childCount > 0;
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        onClick={hasChildren ? onDrillIn : onOpen}
        style={{
          padding: "20px 22px",
          background: `linear-gradient(135deg, ${d.color}10, ${d.color}03)`,
          borderBottom: "1px solid var(--border-soft)",
          cursor: "pointer"
        }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: d.color + "20", color: d.color, display: "grid", placeItems: "center" }}>
            <Ico size={20} />
          </div>
          <div className="row" style={{ gap: 6 }}>
            {hasChildren && <span className="pill pill--neutral"><Icon.GitBranch size={10} /> {childCount}</span>}
            <HealthPill status={d.status} />
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg1)" }}>{d.name}</div>
        <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 2 }}>{d.en} · 负责人 {d.lead}</div>
      </div>
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "知识", value: d.knowledge.toLocaleString() },
          { label: "技能", value: d.skills },
          { label: "工作流", value: d.workflows },
          { label: "项目", value: d.projects }
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div className="num" style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--fg3)", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card__foot" style={{ marginTop: "auto" }}>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          {d.assistant !== "—" ? <><Icon.MessageCircle size={11} style={{ verticalAlign: "-2px" }} /> 助手 <strong style={{ color: "var(--fg2)" }}>{d.assistant}</strong></> : "暂未配置助手"}
        </div>
        <div className="row" style={{ gap: 6 }}>
          {hasChildren && (
            <button className="btn btn--text btn--sm" onClick={onDrillIn} style={{ color: d.color }}>
              下钻 <Icon.Chevron size={11} />
            </button>
          )}
          <button className="btn btn--text btn--sm" onClick={onOpen} style={{ color: d.color }}>
            进入 <Icon.ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
