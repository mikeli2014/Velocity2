import React, { useState, lazy, Suspense } from "react";
import { Sidebar, Topbar } from "./components/Shell.jsx";
import { Icon } from "./components/primitives.jsx";
import { CommandPalette } from "./components/CommandPalette.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { KnowledgePage } from "./pages/KnowledgePage.jsx";
import { OkrPage } from "./pages/OkrPage.jsx";
import { DepartmentsIndex } from "./pages/DepartmentsIndex.jsx";
import { DepartmentPage } from "./pages/DepartmentPage.jsx";
import { SkillsPage } from "./pages/SkillsPage.jsx";
import { AssistantsPage, GovernancePage } from "./pages/AssistantsAndGovernance.jsx";

// Heavier or less-frequented pages are loaded on demand to keep the
// initial bundle below ~400 KB. Each lazy import maps the named export
// onto the default shape that React.lazy expects.
const StrategyPage  = lazy(() => import("./pages/StrategyPage.jsx").then(m => ({ default: m.StrategyPage })));
const WorkflowsPage = lazy(() => import("./pages/WorkflowsPage.jsx").then(m => ({ default: m.WorkflowsPage })));
const AdminPage     = lazy(() => import("./pages/AdminPage.jsx").then(m => ({ default: m.AdminPage })));

function PageFallback() {
  return (
    <div className="content fade-in" style={{ paddingTop: 80 }}>
      <div className="card" style={{ padding: 36, textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
        <Icon.RefreshCw size={28} style={{ color: "var(--vel-indigo)", margin: "0 auto 10px", animation: "spin 1.2s linear infinite" }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)", marginBottom: 4 }}>正在加载页面…</div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>首次加载较大模块,稍后再次访问会从缓存读取。</div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function renderPage(route, setRoute) {
  switch (route.page) {
    case "home": return <HomePage setRoute={setRoute} />;
    case "knowledge": return <KnowledgePage />;
    case "strategy": return <StrategyPage setRoute={setRoute} />;
    case "okr": return <OkrPage />;
    case "departments": return <DepartmentsIndex setRoute={setRoute} />;
    case "department": return <DepartmentPage deptId={route.deptId || "industrial-design"} setRoute={setRoute} />;
    case "skills": return <SkillsPage />;
    case "workflows": return <WorkflowsPage />;
    case "assistants": return <AssistantsPage setRoute={setRoute} />;
    case "governance": return <GovernancePage setRoute={setRoute} />;
    case "admin": return <AdminPage setRoute={setRoute} />;
    default: return <HomePage setRoute={setRoute} />;
  }
}

export default function App() {
  const [route, setRoute] = useState({ page: "home" });
  // Mobile drawer state. Desktop ignores this entirely (CSS hides the
  // drawer affordances above 768px). Closing the drawer on every nav
  // is the right default — users tap an item, then expect content.
  const [drawerOpen, setDrawerOpen] = useState(false);
  const setRouteAndCloseDrawer = (next) => {
    setRoute(next);
    setDrawerOpen(false);
  };

  return (
    <div className={`app${drawerOpen ? " is-drawer-open" : ""}`}>
      <Sidebar route={route} setRoute={setRouteAndCloseDrawer} />
      <div className="main">
        <Topbar route={route} setRoute={setRouteAndCloseDrawer} onToggleDrawer={() => setDrawerOpen(o => !o)} />
        <Suspense fallback={<PageFallback />}>
          {renderPage(route, setRouteAndCloseDrawer)}
        </Suspense>
      </div>
      <button
        className="drawer-scrim"
        aria-label="关闭菜单"
        onClick={() => setDrawerOpen(false)}
      />
      <CommandPalette setRoute={setRouteAndCloseDrawer} />
    </div>
  );
}
