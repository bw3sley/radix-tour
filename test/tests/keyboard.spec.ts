import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("keyboard navigation", () => {
  test("moves between steps with the arrow keys", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("title")).toHaveText("Second");

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("does nothing past the first or last step", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("title")).toHaveText("First");

    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("title")).toHaveText("Second");

    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(page.getByTestId("card")).toBeVisible();
  });

  test("leaves arrows to inputs inside the card", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("note").focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("moves between steps with the arrow keys when focus is outside the card", async ({
    page,
  }) => {
    await startTour(page);

    await page.getByTestId("elsewhere").focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("title")).toHaveText("Second");

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("leaves arrows to inputs and widgets on the page", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("page-field").focus();
    await page.keyboard.press("ArrowRight");

    await page.getByTestId("page-tab").focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("ignores arrows with a modifier key", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("Alt+ArrowRight");

    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("lets a consumer cancel navigation with preventDefault", async ({ page }) => {
    await startTour(page, "?keydown=prevent");

    await page.keyboard.press("ArrowRight");

    await expect(page.getByTestId("title")).toHaveText("First");
  });
});

test.describe("key map", () => {
  test("jumps to the last and first step with End and Home", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("End");
    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(page.getByTestId("card")).toBeVisible();

    await page.keyboard.press("Home");
    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("keeps Home and End inside the card so the page can still scroll", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("elsewhere").focus();
    await page.keyboard.press("End");

    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("leaves Home and End to inputs and modifier combinations", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("note").focus();
    await page.keyboard.press("End");
    await expect(page.getByTestId("title")).toHaveText("First");

    await page.getByTestId("next").focus();
    await page.keyboard.press("Control+End");
    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("activates Close with Enter", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("close").focus();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("card")).toBeHidden();
  });
});
