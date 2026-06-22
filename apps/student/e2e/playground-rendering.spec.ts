import { test, expect } from "@playwright/test";

const ACTIVITY_TYPES = [
  "visual_counting",
  "matching",
  "drag_drop",
  "sequencing",
  "multiple_choice",
  "story_question",
  "real_world",
  "fraction_visual",
  "place_value_chart",
  "grid_area",
  "chart_reader",
  "clock_time",
  "measurement_scale",
  "fill_blank",
] as const;

const UNKNOWN_TYPE_FALLBACK = "Activity not available";

function cardLocator(page: import("@playwright/test").Page, type: string) {
  const typeLabel = type.replace(/_/g, " ");
  return page.locator("span.flex-1.font-medium.text-slate-text", { hasText: typeLabel });
}

test.describe("Playground — all 14 activity types render", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
  });

  for (const type of ACTIVITY_TYPES) {
    test(`${type}: renders without crashing`, async ({ page }) => {
      // Select the type from the filter dropdown
      await page.selectOption("#type-filter", type);

      // Should see at least one card for this type
      const cardLabel = cardLocator(page, type).first();
      await expect(cardLabel).toBeVisible({ timeout: 5000 });

      // Click the parent button to expand the card
      const cardButton = cardLabel.locator("..");
      await cardButton.click();
      await page.waitForTimeout(300);

      // Verify no unknown type fallback
      const fallback = page.locator("text=" + UNKNOWN_TYPE_FALLBACK);
      await expect(fallback).toHaveCount(0, { timeout: 3000 });

      // Verify the preview region contains the rendered component
      const activityRegion = page.locator('[role="region"][aria-label$="activity"]');
      await expect(activityRegion.first()).toBeAttached({ timeout: 3000 });
    });
  }
});

test.describe("Playground — filter interactions", () => {
  test("shows all examples by default", async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Showing 42 of 42 examples")).toBeVisible({ timeout: 5000 });
  });

  test("filter by step shows only matching examples", async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
    await page.selectOption("#step-filter", "observe");
    const text = await page.locator("text=Showing").textContent();
    expect(text).toMatch(/Showing \d+ of 42 examples/);
    const count = parseInt(text!.match(/Showing (\d+)/)![1], 10);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(42);
  });

  test("validation filter buttons work", async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
    const validBtn = page.getByRole("button", { name: "Valid", exact: true });
    await validBtn.click();
    const showing = page.locator("text=Showing").first();
    await expect(showing).toBeVisible({ timeout: 3000 });
    const text = await showing.textContent();
    expect(text).toMatch(/Showing \d+ of 42 examples/);
  });
});
