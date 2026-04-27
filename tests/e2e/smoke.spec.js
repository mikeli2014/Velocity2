import { test, expect } from "@playwright/test";

// Smoke suite — runs against a deployed BASE_URL (CI) or local dev server.
// Each test uses semantic selectors (text / role) so a refactor that
// preserves user-visible behavior won't break the suite.

test.describe("Velocity OS — smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("home page renders the cognitive overview KPIs", async ({ page }) => {
    await expect(page.getByText("企业认知总览")).toBeVisible();
    await expect(page.getByText("战略对齐率")).toBeVisible();
    await expect(page.getByText("知识复用率")).toBeVisible();
    // "项目健康度" appears as the KPI label and inside "关键项目健康度"
    // card title; pin to the exact KPI label.
    await expect(page.getByText("项目健康度", { exact: true })).toBeVisible();
  });

  test("sidebar exposes every top-level nav item including Admin", async ({ page }) => {
    // Regression for the overflow bug that hid 管理后台 / 权限与治理
    // when the departments tree expanded.
    const sidebar = page.locator(".sidebar__nav");
    for (const label of [
      "首页",
      "公司知识中心",
      "战略工作台",
      "OKR 与关键项目",
      "部门工作空间",
      "技能中心",
      "工作流中心",
      "助手中心",
      "权限与治理",
      "管理后台"
    ]) {
      await expect(sidebar.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test("OKR page lists the seeded objectives", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("OKR 与关键项目").click();
    await expect(page.getByRole("heading", { name: "目标与关键项目" })).toBeVisible();
    await expect(page.getByText("用户为中心").first()).toBeVisible();
    await expect(page.getByText("AI Native").first()).toBeVisible();
  });

  test("strategy registry surfaces the seeded questions", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("战略工作台").click();
    await page.getByText("战略问题", { exact: false }).first().click();
    await expect(page.getByText("FY26 是否加大线上 DTC 渠道投入").first()).toBeVisible();
    await expect(page.getByText("县域服务网络由 BP 主导改为 SC 主导").first()).toBeVisible();
  });

  test("workflows center lists templates and run history", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("工作流中心").click();
    await expect(page.getByRole("heading", { name: "工作流模板与执行" })).toBeVisible();
    await expect(page.getByText("创建设计简报").first()).toBeVisible();
    // The tabs are <div class="tab"> elements, not buttons.
    await page.locator(".tab").getByText("运行记录").click();
    await expect(page.getByText("项目 — 全屋净水 2.0").first()).toBeVisible();
  });

  test("knowledge source detail modal opens", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("公司知识中心").click();
    await expect(page.getByText("FY26 集团战略与年度 OKR").first()).toBeVisible();
    await page.getByText("FY26 集团战略与年度 OKR").first().click();
    await expect(page.getByText("自动摘要").first()).toBeVisible();
  });

  test("admin page resolves the lazy chunk", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("管理后台").click();
    // Suspense fallback may show first; assert the actual page header arrives.
    await expect(page.getByText("管理后台 · Admin Console")).toBeVisible({ timeout: 10_000 });
  });

  test("governance page shows the audit log section", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("权限与治理").click();
    await expect(page.getByRole("heading", { name: "知识治理" })).toBeVisible();
    await expect(page.getByText(/审计日志/).first()).toBeVisible();
  });

  // The next three specs target the unified Cloud Run container's
  // production-only behavior (FastAPI healthz, SPA fallback for any
  // path, immutable hashed assets). They do NOT make sense against
  // `npm run dev` — Vite serves source modules instead of hashed
  // bundles and proxies only /api/*. Skip whenever BASE_URL isn't set
  // OR points at localhost.
  function needsDeployedBackend(baseURL) {
    return !process.env.BASE_URL
        || !baseURL
        || baseURL.includes("localhost")
        || baseURL.includes("127.0.0.1");
  }

  test("healthz endpoint returns ok", async ({ request, baseURL }) => {
    test.skip(needsDeployedBackend(baseURL), "needs a deployed prod build (set BASE_URL=https://...)");
    const res = await request.get("/healthz");
    expect(res.status()).toBe(200);
    expect((await res.text()).trim()).toBe("ok");
  });

  test("SPA fallback serves index.html for unknown deep links", async ({ request, baseURL }) => {
    test.skip(needsDeployedBackend(baseURL), "needs a deployed prod build (set BASE_URL=https://...)");
    const res = await request.get("/some/random/deep-link");
    expect(res.status()).toBe(200);
    expect((await res.text()).toLowerCase()).toContain("<div id=\"root\">");
  });

  test("fingerprinted assets carry an immutable cache header", async ({ request, baseURL }) => {
    test.skip(needsDeployedBackend(baseURL), "needs a deployed prod build (set BASE_URL=https://...)");
    const html = await (await request.get("/")).text();
    const m = html.match(/\/assets\/index-[^"\s]+\.js/);
    expect(m).not.toBeNull();
    const res = await request.get(m[0]);
    expect(res.status()).toBe(200);
    const cc = res.headers()["cache-control"] || "";
    expect(cc).toContain("immutable");
  });
});
