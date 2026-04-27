import { test, expect } from "@playwright/test";

// Feature-level specs covering interactions added after the initial smoke
// suite. Same selectors-as-text approach to stay refactor-resistant.

test.describe("Velocity OS — features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Cmd-K command palette opens and routes to a picked entity", async ({ page }) => {
    await page.keyboard.press("Control+k");
    const input = page.getByPlaceholder(/搜索 OKR/);
    await expect(input).toBeVisible();
    await input.fill("CMF");
    // Wait for at least one matching row.
    const firstRow = page.locator("[data-cmd-row='0']");
    await expect(firstRow).toBeVisible();
    await firstRow.click();
    // Palette should close after picking.
    await expect(input).not.toBeVisible();
  });

  test("notifications dropdown opens and clears unread count", async ({ page }) => {
    await page.getByRole("button", { name: "通知" }).click();
    await expect(page.getByText("全部已读")).toBeVisible();
    // At least one unread notification visible
    await expect(page.getByText(/未读/)).toBeVisible();
    await page.getByText("全部已读").click();
    // Unread badge should disappear after clearing
    await expect(page.getByText(/未读/)).not.toBeVisible();
  });

  test("project detail modal surfaces milestones and risks", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("OKR 与关键项目").click();
    await page.getByText("关键项目组合").click();
    await page.getByText("全屋净水 2.0").first().click();
    await expect(page.getByText("里程碑", { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/参与人/)).toBeVisible();
  });

  test("decision detail modal renders assumptions and dissent", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("OKR 与关键项目").click();
    await page.getByText("决策日志").click();
    await page.getByText("县域服务网络由 BP 主导改为 SC 主导").click();
    await expect(page.getByText("关键假设", { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/反对/).first()).toBeVisible();
  });

  test("workflow template editor opens for new template", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("工作流中心").click();
    await page.getByRole("button", { name: /新建工作流/ }).click();
    await expect(page.getByText("新建工作流模板")).toBeVisible();
    // Has at least one step row in the editor seed
    await expect(page.getByText(/添加步骤/)).toBeVisible();
  });

  test("audit log CSV export button is enabled when entries match", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("权限与治理").click();
    const btn = page.getByRole("button", { name: /导出 CSV/ });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test("KR check-in dialog shows history sparkline", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("OKR 与关键项目").click();
    // First KR row's Check-in icon is the only RefreshCw button on the page
    await page.locator("button[title='Check-in']").first().click();
    await expect(page.getByText(/历史 Check-in/)).toBeVisible();
  });

  test("strategy question creation flow accepts a new draft", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("战略工作台").click();
    await page.getByText("战略问题").first().click();
    await page.getByRole("button", { name: /提出新问题/ }).first().click();
    await expect(page.getByText("提出战略问题")).toBeVisible();
  });

  test("War Council renders seeded debate rounds + run-next-round button", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("战略工作台").click();
    await page.getByText("War Council").click();
    // Seeded debate has rounds 1-3 on sq-1.
    await expect(page.getByText("第 1 轮")).toBeVisible();
    await expect(page.getByText("第 2 轮")).toBeVisible();
    await expect(page.getByText("第 3 轮")).toBeVisible();
    // Run-next-round button is the 4th-round CTA.
    await expect(page.getByRole("button", { name: /运行第 4 轮/ })).toBeVisible();
    // Synthesis pill carries the live stance counts.
    await expect(page.getByText(/赞成/).first()).toBeVisible();
  });

  test("routing tester panel exposes input + sample chips", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("助手中心").click();
    await expect(page.getByText("路由测试 · Haiku 4.5 实时分类")).toBeVisible();
    await expect(page.getByPlaceholder(/PVD 工艺/)).toBeVisible();
    // Clicking a sample fills the input.
    await page.getByRole("button", { name: "PVD 工艺与喷涂的成本对比?" }).click();
    await expect(page.getByPlaceholder(/PVD 工艺/)).toHaveValue("PVD 工艺与喷涂的成本对比?");
  });

  test("knowledge upload dialog has a real file picker dropzone", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("公司知识中心").click();
    await page.getByRole("button", { name: /上传材料/ }).click();
    await expect(page.getByText("上传材料 — 添加来源")).toBeVisible();

    // The dashed dropzone exists and the hidden <input type="file"> is in
    // the DOM (proving the picker is actually wired, not a static box).
    await expect(page.getByText("拖入或点击选择文件")).toBeVisible();
    const hiddenFileInput = page.locator('input[type="file"][accept*=".pdf"]');
    await expect(hiddenFileInput).toBeAttached();

    // "开始处理" button is disabled with no file + no typed name.
    const startBtn = page.getByRole("button", { name: /开始处理/ });
    await expect(startBtn).toBeDisabled();

    // Typing a fallback filename enables it (legacy demo path).
    await page.getByPlaceholder(/输入文件名/).fill("smoke-upload.pdf");
    await expect(startBtn).toBeEnabled();
  });

  test("strategy canvas 进入下一轮 button switches to War Council tab", async ({ page }) => {
    await page.locator(".sidebar__nav").getByText("战略工作台").click();
    // Default lands on canvas tab for the seeded primary question.
    await page.getByText("画布 (Spatial)").click();
    const advanceBtn = page.getByRole("button", { name: /进入下一轮/ });
    await expect(advanceBtn).toBeVisible();
    await expect(advanceBtn).toBeEnabled();
    await advanceBtn.click();
    // After the click we expect to be on the War Council tab — its
    // header pills appear.
    await expect(page.getByRole("button", { name: /运行第 \d+ 轮/ })).toBeVisible();
  });
});
