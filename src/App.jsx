import React, { useState } from "react";
import { Sidebar, Topbar } from "./components/Shell.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { KnowledgePage } from "./pages/KnowledgePage.jsx";
import { OkrPage } from "./pages/OkrPage.jsx";
import { StrategyPage } from "./pages/StrategyPage.jsx";
import { DepartmentsIndex } from "./pages/DepartmentsIndex.jsx";
import { DepartmentPage } from "./pages/DepartmentPage.jsx";
import { SkillsPage } from "./pages/SkillsPage.jsx";
import { WorkflowsPage } from "./pages/WorkflowsPage.jsx";
import { AssistantsPage, GovernancePage } from "./pages/AssistantsAndGovernance.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";

export default function App() {
  const [route, setRoute] = useState({ page: "home" });

  const Page = () => {
    switch (route.page) {
      case "home": return <HomePage setRoute={setRoute} />;
      case "knowledge": return <KnowledgePage />;
      case "strategy": return <StrategyPage />;
      case "okr": return <OkrPage />;
      case "departments": return <DepartmentsIndex setRoute={setRoute} />;
      case "department": return <DepartmentPage deptId={route.deptId || "industrial-design"} setRoute={setRoute} />;
      case "skills": return <SkillsPage />;
      case "workflows": return <WorkflowsPage />;
      case "assistants": return <AssistantsPage setRoute={setRoute} />;
      case "governance": return <GovernancePage />;
      case "admin": return <AdminPage />;
      default: return <HomePage setRoute={setRoute} />;
    }
  };

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} />
      <div className="main">
        <Topbar route={route} setRoute={setRoute} />
        <Page />
      </div>
    </div>
  );
}
