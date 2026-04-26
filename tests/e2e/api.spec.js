import { test, expect } from "@playwright/test";

// Mutation-aware specs that round-trip through the live FastAPI backend.
// These only run when BASE_URL points at a deployed instance — running
// `npm run test:e2e` against the local Vite dev server (no backend
// running) would block on API calls forever, so we skip there.

const NEEDS_BACKEND = !!process.env.BASE_URL && process.env.BASE_URL.startsWith("http");

test.describe("Velocity OS — API integration", () => {
  test.skip(!NEEDS_BACKEND, "needs a deployed backend; set BASE_URL to enable");

  test("topbar shows the API connection indicator as online", async ({ page }) => {
    await page.goto("/");
    // ApiConnectionIndicator renders "API · sqlite" or "API · postgres"
    // when /api/v1/health resolves successfully.
    await expect(page.getByText(/API · /)).toBeVisible({ timeout: 10_000 });
  });

  test("/api/v1/health returns ok", async ({ request }) => {
    const res = await request.get("/api/v1/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.database).toMatch(/sqlite|postgres/);
    expect(body.objectiveCount).toBeGreaterThanOrEqual(4);
  });

  test("create → list → delete an objective via the REST API", async ({ request }) => {
    const create = await request.post("/api/v1/objectives", {
      data: {
        code: "O-E2E",
        title: "Playwright e2e CRUD test",
        owner: "ci",
        quarter: "FY26",
        status: "on-track",
        krs: [
          { title: "KR alpha", target: "100", current: "0", progress: 25, status: "on-track" },
          { title: "KR beta",  target: "50",  current: "0", progress: 75, status: "on-track" }
        ]
      }
    });
    expect(create.status()).toBe(201);
    const obj = await create.json();
    expect(obj.id).toBeTruthy();
    // server-rolled-up: (25 + 75) / 2 = 50
    expect(obj.progress).toBe(50);

    const list = await request.get("/api/v1/objectives");
    expect(list.status()).toBe(200);
    const ids = (await list.json()).map(o => o.id);
    expect(ids).toContain(obj.id);

    const del = await request.delete(`/api/v1/objectives/${obj.id}`);
    expect(del.status()).toBe(204);

    const after = await (await request.get("/api/v1/objectives")).json();
    expect(after.map(o => o.id)).not.toContain(obj.id);
  });

  test("OkrPage UI lists objectives served by the backend", async ({ page }) => {
    await page.goto("/");
    await page.locator(".sidebar__nav").getByText("OKR 与关键项目").click();
    // The four seeded codes must appear regardless of whether the data
    // came from the API or the seed fallback.
    for (const code of ["O1", "O2", "O3", "O4"]) {
      await expect(page.getByText(code, { exact: false }).first()).toBeVisible();
    }
  });

  test("KnowledgePage sources tab shows 已连接 API pill", async ({ page }) => {
    await page.goto("/");
    await page.locator(".sidebar__nav").getByText("公司知识中心").click();
    // SourcesDataState shows 已连接 API when /api/v1/knowledge-sources resolves.
    await expect(page.getByText("已连接 API")).toBeVisible({ timeout: 10_000 });
  });

  test("/api/v1/strategy-questions/sq-1/debate returns the seeded transcript", async ({ request }) => {
    const res = await request.get("/api/v1/strategy-questions/sq-1/debate");
    expect(res.status()).toBe(200);
    const rows = await res.json();
    // Seed has 7 messages on sq-1 across rounds 1-3.
    expect(rows.length).toBe(7);
    const rounds = [...new Set(rows.map(r => r.round))].sort();
    expect(rounds).toEqual([1, 2, 3]);
    expect(rows[0]).toHaveProperty("agentId");
    expect(rows[0]).toHaveProperty("stance");
  });

  test("/api/v1/chat without a key surfaces 503 anthropic_not_configured", async ({ request }) => {
    // Cloud Run preview has no key set, so the endpoint must fail fast with
    // the stable slug the frontend localizes against — not a 500.
    const res = await request.post("/api/v1/chat", {
      data: { messages: [{ role: "user", content: "ping" }] }
    });
    // Allow either 503 (no key) or 200 (key configured) — both indicate the
    // route is wired correctly. Anything else is a regression.
    expect([200, 503]).toContain(res.status());
    if (res.status() === 503) {
      expect((await res.json()).detail).toBe("anthropic_not_configured");
    }
  });

  test("/api/v1/route accepts a payload and routes to a documented status", async ({ request }) => {
    const res = await request.post("/api/v1/route", {
      data: { text: "PVD 工艺与喷涂成本对比" }
    });
    // Same shape as chat: 503 when unconfigured, 200 when wired up.
    expect([200, 503]).toContain(res.status());
    if (res.status() === 503) {
      expect((await res.json()).detail).toBe("anthropic_not_configured");
    } else {
      const body = await res.json();
      expect(body).toHaveProperty("model");
      expect(body).toHaveProperty("confidence");
    }
  });
});
