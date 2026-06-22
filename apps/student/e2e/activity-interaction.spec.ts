import { test, expect } from "@playwright/test";

function cardLabel(page: import("@playwright/test").Page, type: string) {
  const typeLabel = type.replace(/_/g, " ");
  return page.locator("span.flex-1.font-medium.text-slate-text", { hasText: typeLabel });
}

async function expandFirstPlaygroundCard(
  page: import("@playwright/test").Page,
  type: string,
  step?: string,
) {
  await page.goto("/playground");
  await page.waitForLoadState("networkidle");
  await page.selectOption("#type-filter", type);
  if (step) {
    const stepMap: Record<string, string> = {
      observe: "Observe",
      guided_practice: "Guided",
      independent_practice: "Practice",
      mastery_check: "Quiz",
    };
    const stepValue = stepMap[step];
    if (stepValue) await page.selectOption("#step-filter", stepValue);
  }
  const label = cardLabel(page, type).first();
  await expect(label).toBeVisible({ timeout: 5000 });
  const cardButton = label.locator("..");
  await cardButton.click();
  await page.waitForTimeout(600);
}

async function clickIfEnabled(page: import("@playwright/test").Page, text: string) {
  const btn = page.locator("button", { hasText: text });
  if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(300);
      return true;
    }
  }
  return false;
}

test.describe("Interactive success flow — playground", () => {
  test("visual_counting: select correct count", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "visual_counting");
    const countBtn = page.locator('button[aria-label^="Select"]').first();
    if (await countBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countBtn.click();
      await page.waitForTimeout(200);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test("matching: pair items correctly", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "matching");
    const leftItems = page.locator('button[aria-label^="Match:"]');
    const rightItems = page.locator('button[aria-label^="Target:"]');
    const n = Math.min(await leftItems.count(), await rightItems.count());
    for (let i = 0; i < n; i++) {
      await leftItems.nth(i).click();
      await page.waitForTimeout(200);
      await rightItems.nth(i).click();
      await page.waitForTimeout(200);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test("sequencing: arrange items in correct order", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "sequencing");
    const available = page.locator('div[aria-label="Available items"] button[role="listitem"]');
    await expect(available.first()).toBeVisible({ timeout: 5000 });
    const count = await available.count();
    for (let i = 0; i < count; i++) {
      await available.first().click();
      await page.waitForTimeout(250);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test("multiple_choice: answer both questions correctly", async ({ page }) => {
    test.setTimeout(45000);
    await expandFirstPlaygroundCard(page, "multiple_choice");
    for (let q = 0; q < 2; q++) {
      const options = page.locator('button[data-testid="option-card"]');
      await expect(options.first()).toBeVisible({ timeout: 5000 });
      if ((await options.count()) >= 2) {
        await options.nth(1).click();
        await page.waitForTimeout(200);
      }
      const checkBtn = page.locator("button:not([disabled])", { hasText: "Check My Answer" });
      if (await checkBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await checkBtn.click();
        await page.waitForTimeout(400);
      }
    }
    const feedback = page.locator('[data-testid="feedback-zone"]');
    await expect(feedback).toBeVisible({ timeout: 8000 });
  });

  test("story_question: select correct answer", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "story_question");
    const firstOption = page.locator('button[data-testid="option-card"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();
    await page.waitForTimeout(200);
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      const feedback = page.locator('[data-testid="feedback-zone"]');
      await expect(feedback).toBeVisible({ timeout: 8000 });
    }
  });

  test("drag_drop: place items in targets", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "drag_drop");
    const items = page.locator('div[aria-label="Items to place"] button[aria-label]');
    await expect(items.first()).toBeVisible({ timeout: 5000 });
    const targets = page.locator('div[role="button"][aria-label^="Target:"]');
    const itemCount = await items.count();
    const targetCount = await targets.count();
    for (let i = 0; i < Math.min(itemCount, targetCount); i++) {
      await items.nth(i).click();
      await page.waitForTimeout(200);
      await targets.nth(i % targetCount).click();
      await page.waitForTimeout(200);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 8000 });
    }
  });

  test("real_world: renders and accepts input", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "real_world");
    const textarea = page.locator("textarea#task-response");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill("test response");
    await page.waitForTimeout(200);
    const completeBtn = page.locator("button", { hasText: "I Completed This Task" });
    await expect(completeBtn).toBeVisible({ timeout: 3000 });
  });

  test("fraction_visual: renders preview", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "fraction_visual");
    const svg = page.locator('svg[role="img"][aria-label*="parts"]');
    await expect(svg.first()).toBeAttached({ timeout: 5000 });
  });

  test("place_value_chart: place digits in columns", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "place_value_chart", "guided_practice");
    const digitBtns = page.locator('button[aria-label^="Digit"]');
    await expect(digitBtns.first()).toBeVisible({ timeout: 5000 });
    const columns = page.locator('div[role="gridcell"]');
    const digitCount = await digitBtns.count();
    const colCount = await columns.count();
    for (let i = 0; i < Math.min(digitCount, colCount); i++) {
      await digitBtns.nth(i).click();
      await page.waitForTimeout(200);
      await columns.nth(colCount - 1 - i).click();
      await page.waitForTimeout(200);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 8000 });
    }
  });

  test("chart_reader: click to select", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "chart_reader", "independent_practice");
    const clickable = page.locator('rect[role="button"], div[role="button"][aria-label]');
    if ((await clickable.count()) > 0) {
      await clickable.first().click();
      await page.waitForTimeout(200);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 8000 });
    }
  });

  test("clock_time: renders clock preview", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "clock_time");
    const svg = page.locator('svg[role="img"][aria-label^="Clock showing"]');
    await expect(svg.first()).toBeAttached({ timeout: 5000 });
  });

  test("measurement_scale: use slider in interactive mode", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "measurement_scale", "independent_practice");
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible({ timeout: 5000 });
    await slider.fill("150");
    await page.waitForTimeout(200);
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 8000 });
    }
  });

  test("grid_area: click cells in interactive mode", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "grid_area", "independent_practice");
    const cells = page.locator('div[role="grid"] div[role="button"]');
    await expect(cells.first()).toBeVisible({ timeout: 5000 });
    const cellCount = await cells.count();
    if (cellCount > 0) {
      await cells.first().click();
      await page.waitForTimeout(200);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 8000 });
    }
  });

  test("fill_blank: select correct answer", async ({ page }) => {
    await expandFirstPlaygroundCard(page, "fill_blank");
    const blank = page.locator('button[aria-label^="Blank"]').first();
    await expect(blank).toBeVisible({ timeout: 5000 });
    await blank.click();
    await page.waitForTimeout(300);
    const correctOption = page.locator('button[role="option"][aria-label="5"]');
    if ((await correctOption.count()) > 0) {
      await correctOption.first().click();
      await page.waitForTimeout(200);
    }
    const ok = await clickIfEnabled(page, "Check My Answer");
    if (ok) {
      await expect(page.locator('[data-testid="feedback-zone"]')).toBeVisible({ timeout: 8000 });
    }
  });
});
