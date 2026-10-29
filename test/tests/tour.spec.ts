import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("tour", () => {
  test("shows the first step anchored to its target", async ({ page }) => {
    await startTour(page);

    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
    await expect(page.getByText("First step.")).toBeVisible();
    await expect(page.getByText("1 / 2")).toBeVisible();
  });

  test("moves forward and back between steps", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await card.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();

    await card.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();
  });

  test("closes after the last step", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await card.getByRole("button", { name: "Next" }).click();
    await card.getByRole("button", { name: "Next" }).click();

    await expect(card).toBeHidden();
  });

  test("closes on Escape and on the close button", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();

    await startTour(page);
    await card.getByRole("button", { name: "Close tour" }).click();
    await expect(card).toBeHidden();
  });

  test("renders nothing while closed", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("card")).toHaveCount(0);
  });

  test("waits for a target that is not in the DOM yet", async ({ page }) => {
    await page.goto("/?scenario=late");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Start tour" }).click();

    // The target mounts 600ms after the page, so the card has nothing to point at yet.
    await expect(page.locator("#late")).toHaveCount(0);
    await expect(page.getByTestId("card")).toBeHidden();

    await expect(page.getByRole("heading", { name: "Late" })).toBeVisible();
  });

  test("places the card on the side and alignment each step asks for", async ({ page }) => {
    await startTour(page, "?scenario=placement");

    const card = page.getByTestId("card");

    await expect(card).toHaveAttribute("data-side", "right");
    await expect(card).toHaveAttribute("data-align", "end");
  });

  test("exposes first and last step state through useTour", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await expect(page.getByTestId("position")).toHaveText("first more");

    await card.getByRole("button", { name: "Next" }).click();
    await expect(page.getByTestId("position")).toHaveText("later last");
  });
});
