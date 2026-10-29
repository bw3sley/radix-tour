import { expect, type Page } from "@playwright/test";

// Opens the tour from the keyboard: WebKit does not focus a button on click, and the opener must
// hold focus for the focus-return specs. Retries until the page has hydrated.
export async function startTour(page: Page, query = "") {
  await page.goto(`/${query}`);

  const start = page.getByRole("button", { name: "Start tour" });
  const card = page.getByTestId("card");

  await expect(async () => {
    await start.focus({ timeout: 1000 });
    await page.keyboard.press("Enter");
    await expect(card).toBeVisible({ timeout: 1000 });
  }).toPass();
}
