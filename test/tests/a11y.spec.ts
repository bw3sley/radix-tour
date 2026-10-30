import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("screen reader semantics", () => {
  test("announces each step in a polite live region", async ({ page }) => {
    await startTour(page);

    const status = page.getByRole("status");

    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveText("Step 1 of 2: First");

    await page.getByTestId("next").click();

    await expect(status).toHaveText("Step 2 of 2: Second");
  });

  test("labels the card with the title and describes it with the description", async ({ page }) => {
    await startTour(page);

    const card = page.getByRole("dialog");

    await expect(card).toHaveAccessibleName("First");
    await expect(card).toHaveAccessibleDescription("First step.");
  });

  test("omits the aria references when the card has no title or description", async ({ page }) => {
    await startTour(page, "?bare=1");

    const card = page.getByRole("dialog");

    await expect(card).not.toHaveAttribute("aria-labelledby");
    await expect(card).not.toHaveAttribute("aria-describedby");
  });

  test("keeps Previous focusable but inert on the first step", async ({ page }) => {
    await startTour(page);

    const back = page.getByTestId("back");

    // Not natively disabled, so it stays focusable; Playwright's toBeEnabled would read aria-disabled.
    await expect(back).not.toHaveAttribute("disabled");
    await expect(back).toHaveAttribute("aria-disabled", "true");
    await expect(back).toHaveAttribute("data-disabled", "");

    await back.focus();
    await expect(back).toBeFocused();

    // Playwright treats aria-disabled as not actionable, so force the click to prove it is inert.
    await back.click({ force: true });
    await expect(page.getByTestId("title")).toHaveText("First");

    await page.getByTestId("next").click();
    await expect(page.getByTestId("title")).toHaveText("Second");

    await expect(back).not.toHaveAttribute("aria-disabled");
    await expect(back).not.toHaveAttribute("data-disabled");
  });

  test("points the active target at the card and restores it afterwards", async ({ page }) => {
    await startTour(page);

    const first = page.getByTestId("first-target");
    const second = page.getByTestId("second-target");
    const cardId = await page.getByRole("dialog").getAttribute("id");

    expect(cardId).toBeTruthy();
    await expect(first).toHaveAttribute("aria-describedby", `existing-hint ${cardId}`);
    await expect(second).not.toHaveAttribute("aria-describedby");

    await page.getByTestId("next").click();
    await expect(page.getByTestId("title")).toHaveText("Second");

    await expect(first).toHaveAttribute("aria-describedby", "existing-hint");
    await expect(second).toHaveAttribute("aria-describedby", cardId as string);

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("card")).toBeHidden();

    await expect(second).not.toHaveAttribute("aria-describedby");
  });
});
