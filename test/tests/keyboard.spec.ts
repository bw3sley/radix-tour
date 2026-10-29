import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("keyboard navigation", () => {
  test("moves between steps with the arrow keys", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("does nothing past the first or last step", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(page.getByTestId("card")).toBeVisible();
  });

  test("leaves arrows to inputs inside the card", async ({ page }) => {
    await startTour(page);

    await page.getByRole("textbox", { name: "Note" }).focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("moves between steps with the arrow keys when focus is outside the card", async ({
    page,
  }) => {
    await startTour(page);

    await page.getByRole("button", { name: "Elsewhere" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("leaves arrows to inputs and widgets on the page", async ({ page }) => {
    await startTour(page);

    await page.getByRole("textbox", { name: "Page field" }).focus();
    await page.keyboard.press("ArrowRight");

    await page.getByRole("tab", { name: "One" }).focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("ignores arrows with a modifier key", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("Alt+ArrowRight");

    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("lets a consumer cancel navigation with preventDefault", async ({ page }) => {
    await startTour(page, "?keydown=prevent");

    await page.keyboard.press("ArrowRight");

    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });
});

test.describe("key map", () => {
  test("jumps to the last and first step with End and Home", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("End");
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(page.getByTestId("card")).toBeVisible();

    await page.keyboard.press("Home");
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("keeps Home and End inside the card so the page can still scroll", async ({ page }) => {
    await startTour(page);

    await page.getByRole("button", { name: "Elsewhere" }).focus();
    await page.keyboard.press("End");

    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("leaves Home and End to inputs and modifier combinations", async ({ page }) => {
    await startTour(page);

    await page.getByRole("textbox", { name: "Note" }).focus();
    await page.keyboard.press("End");
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();

    await page.getByTestId("card").getByRole("button", { name: "Next" }).focus();
    await page.keyboard.press("Control+End");
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("activates Close with Enter", async ({ page }) => {
    await startTour(page);

    await page.getByRole("button", { name: "Close tour" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("card")).toBeHidden();
  });
});
