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
    await expect(page.getByRole("heading", { name: "First" })).toHaveAttribute(
      "data-tour-title",
      "",
    );
    await expect(page.getByText("First step.")).toHaveAttribute("data-tour-description", "");
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

    await card.getByRole("button", { name: "Next" }).click();

    await expect(card).toHaveAttribute("data-motion", "from-start");
    await expect(card).toHaveAttribute("data-step", "1");

    await card.getByRole("button", { name: "Back" }).click();

    await expect(card).toHaveAttribute("data-motion", "from-end");
    await expect(card).toHaveAttribute("data-step", "0");
  });

  test("keeps the same card mounted across steps", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await card.evaluate((element) => element.setAttribute("data-marker", "same"));
    await card.getByRole("button", { name: "Next" }).click();

    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(card).toHaveAttribute("data-marker", "same");
  });

  test("replaces the title and description on each step so the CSS fade plays again", async ({
    page,
  }) => {
    await startTour(page);

    const title = page.getByRole("heading", { name: "First" });

    await title.evaluate((element) => element.setAttribute("data-marker", "old"));
    await page.getByTestId("card").getByRole("button", { name: "Next" }).click();

    const next = page.getByRole("heading", { name: "Second" });

    await expect(next).toBeVisible();
    await expect(next).not.toHaveAttribute("data-marker", "old");
    await expect(page.locator('[data-marker="old"]')).toHaveCount(0);
  });

  test("keeps the card mounted while the next target is briefly missing", async ({ page }) => {
    await startTour(page, "?hideSecond=1");

    const card = page.getByTestId("card");

    await card.evaluate((element) => element.setAttribute("data-marker", "same"));
    await card.getByRole("button", { name: "Next" }).click();

    await expect(card).toHaveAttribute("data-marker", "same");

    await page.getByRole("button", { name: "Show target" }).click();

    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(card).toHaveAttribute("data-marker", "same");
  });

  test("removes the card when the tour closes", async ({ page }) => {
    await startTour(page);

    await page.getByRole("button", { name: "Close tour" }).click();

    await expect(page.getByTestId("card")).toHaveCount(0);
  });

  test("starts from the first step when the tour opens again", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("card").getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("card")).toHaveCount(0);

    await page.getByRole("button", { name: "Start tour" }).click();

    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
    await expect(page.getByTestId("card")).toHaveAttribute("data-step", "0");
  });

  test("leaves data-motion off every part when motion is false", async ({ page }) => {
    await startTour(page, "?motion=off");

    await expect(page.getByTestId("card")).not.toHaveAttribute("data-motion");
    await expect(page.getByTestId("spotlight")).not.toHaveAttribute("data-motion");
    await expect(page.getByRole("heading", { name: "First" })).not.toHaveAttribute("data-motion");
    await expect(page.getByText("First step.")).not.toHaveAttribute("data-motion");
  });
});
