import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("tour", () => {
  test("shows the first step anchored to its target", async ({ page }) => {
    await startTour(page);

    await expect(page.getByTestId("title")).toHaveText("First");
    await expect(page.getByTestId("description")).toHaveText("First step.");
    await expect(page.getByTestId("progress")).toHaveText("1 / 2");
  });

  test("moves forward and back between steps", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("next").click();
    await expect(page.getByTestId("title")).toHaveText("Second");

    await page.getByTestId("back").click();
    await expect(page.getByTestId("title")).toHaveText("First");
  });

  test("closes after the last step", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await page.getByTestId("next").click();
    await page.getByTestId("next").click();

    await expect(card).toBeHidden();
  });

  test("closes on Escape and on the close button", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();

    await startTour(page);
    await page.getByTestId("close").click();
    await expect(card).toBeHidden();
  });

  test("renders nothing while closed", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("card")).toHaveCount(0);
  });

  test("waits for a target that is not in the DOM yet", async ({ page }) => {
    await page.goto("/?scenario=late");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("start").click();

    // The target mounts 600ms after the page, so the card has nothing to point at yet.
    await expect(page.getByTestId("late-target")).toHaveCount(0);
    await expect(page.getByTestId("card")).toBeHidden();

    await expect(page.getByTestId("title")).toHaveText("Late");
  });

  test("places the card on the side and alignment each step asks for", async ({ page }) => {
    await startTour(page, "?scenario=placement");

    const card = page.getByTestId("card");

    await expect(card).toHaveAttribute("data-side", "right");
    await expect(card).toHaveAttribute("data-align", "end");
  });

  test("exposes first and last step state through useTour", async ({ page }) => {
    await startTour(page);

    await expect(page.getByTestId("position")).toHaveText("first more");

    await page.getByTestId("next").click();
    await expect(page.getByTestId("position")).toHaveText("later last");
  });
});
