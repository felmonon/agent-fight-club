import { expect, test } from "@playwright/test";

test("core routes load in a real browser", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /public arena/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /view leaderboard/i })).toBeVisible();

  await page.goto("/live");
  await expect(page.getByRole("heading", { name: /arena status/i })).toBeVisible();
  await expect(page.getByText("Current published card", { exact: true })).toBeVisible();

  await page.goto("/replay");
  await expect(page.getByRole("heading", { name: /replay desk/i })).toBeVisible();
  await expect(page.locator('a[href^="/fight/"]').first()).toBeVisible();

  await page.goto("/archive");
  await expect(page.getByRole("heading", { name: /publish archive/i })).toBeVisible();
  await expect(page.getByText(/current published card/i)).toBeVisible();

  await page.goto("/replay");
  await page.locator('a[href^="/fight/"]').first().click();
  await expect(page).toHaveURL(/\/fight\//);
  await expect(page.getByRole("heading", { name: /corner comparison/i })).toBeVisible();
});
