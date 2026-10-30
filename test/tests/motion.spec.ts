import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("motion", () => {
  test("marks the card, spotlight, title and description for the stylesheet", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await expect(card).toHaveAttribute("data-tour-content", "");
    await expect(card).toHaveAttribute("data-motion", "from-start");
    await expect(card).toHaveAttribute("data-state", "open");
    await expect(page.getByTestId("spotlight")).toHaveAttribute("data-motion", "");
    await expect(page.getByTestId("title")).toHaveAttribute("data-tour-title", "");
    await expect(page.getByTestId("description")).toHaveAttribute("data-tour-description", "");
  });

  test("sets data-placed after the first placement, which switches the glide on", async ({
    page,
  }) => {
    await startTour(page);

    await expect(page.getByTestId("card")).toHaveAttribute("data-placed", "");
  });

  test("sets data-motion from the direction of the last step change", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await page.getByTestId("next").click();

    await expect(card).toHaveAttribute("data-motion", "from-start");
    await expect(card).toHaveAttribute("data-step", "1");

    await page.getByTestId("back").click();

    await expect(card).toHaveAttribute("data-motion", "from-end");
    await expect(card).toHaveAttribute("data-step", "0");
  });

  test("keeps the same card mounted across steps", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await card.evaluate((element) => element.setAttribute("data-marker", "same"));
    await page.getByTestId("next").click();

    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(card).toHaveAttribute("data-marker", "same");
  });

  test("replaces the title and description on each step so the CSS fade plays again", async ({
    page,
  }) => {
    await startTour(page);

    const title = page.getByTestId("title");

    await title.evaluate((element) => element.setAttribute("data-marker", "old"));
    await page.getByTestId("next").click();

    const next = page.getByTestId("title");

    await expect(next).toBeVisible();
    await expect(next).not.toHaveAttribute("data-marker", "old");
    await expect(page.locator('[data-marker="old"]')).toHaveCount(0);
  });

  test("keeps the card mounted while the next target is briefly missing", async ({ page }) => {
    await startTour(page, "?hideSecond=1");

    const card = page.getByTestId("card");

    await card.evaluate((element) => element.setAttribute("data-marker", "same"));
    await page.getByTestId("next").click();

    await expect(card).toHaveAttribute("data-marker", "same");

    await page.getByTestId("show-target").click();

    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(card).toHaveAttribute("data-marker", "same");
  });

  test("removes the card when the tour closes", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("close").click();

    await expect(page.getByTestId("card")).toHaveCount(0);
  });

  test("starts from the first step when the tour opens again", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("next").click();
    await expect(page.getByTestId("title")).toHaveText("Second");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("card")).toHaveCount(0);

    await page.getByTestId("start").click();

    await expect(page.getByTestId("title")).toHaveText("First");
    await expect(page.getByTestId("card")).toHaveAttribute("data-step", "0");
  });

  test("leaves data-motion off every part when motion is false", async ({ page }) => {
    await startTour(page, "?motion=off");

    await expect(page.getByTestId("card")).not.toHaveAttribute("data-motion");
    await expect(page.getByTestId("spotlight")).not.toHaveAttribute("data-motion");
    await expect(page.getByTestId("title")).not.toHaveAttribute("data-motion");
    await expect(page.getByTestId("description")).not.toHaveAttribute("data-motion");
  });
});
