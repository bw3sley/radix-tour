import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("focus return", () => {
  test("returns focus to the opener after Escape", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("Escape");

    await expect(page.getByRole("button", { name: "Start tour" })).toBeFocused();
  });

  test("returns focus to the opener after the close button", async ({ page }) => {
    await startTour(page);

    await page.getByRole("button", { name: "Close tour" }).click();

    await expect(page.getByRole("button", { name: "Start tour" })).toBeFocused();
  });

  test("returns focus to the opener after the last step", async ({ page }) => {
    await startTour(page);

    const card = page.getByTestId("card");

    await card.getByRole("button", { name: "Next" }).click();
    await card.getByRole("button", { name: "Next" }).click();

    await expect(page.getByRole("button", { name: "Start tour" })).toBeFocused();
  });

  test("does not move focus when the opener is gone", async ({ page }) => {
    await startTour(page, "?opener=remove-on-close");

    await page.keyboard.press("Escape");

    await expect(page.getByTestId("card")).toBeHidden();
    await expect(page.getByRole("button", { name: "Start tour" })).toHaveCount(0);
  });

  test("does not throw or steal focus when the opener unmounts as the tour starts", async ({
    page,
  }) => {
    await startTour(page, "?opener=unmount-on-open");

    await expect(page.getByRole("button", { name: "Start tour" })).toHaveCount(0);

    await page.keyboard.press("Escape");

    await expect(page.getByTestId("card")).toBeHidden();
    await expect(page.locator("body")).toBeFocused();
  });
});

test.describe("focus management", () => {
  test("moves focus into the card when the tour opens", async ({ page }) => {
    await startTour(page);

    await expect(page.getByRole("dialog")).toBeFocused();
  });

  test("leaves focus alone when onOpenAutoFocus is prevented", async ({ page }) => {
    await startTour(page, "?autofocus=prevent");

    await expect(page.getByRole("button", { name: "Start tour" })).toBeFocused();
  });

  test("leaves focus on the opener when auto focus is prevented, and arrows still change the step", async ({
    page,
  }) => {
    await startTour(page, "?autofocus=prevent");

    await page.keyboard.press("ArrowRight");

    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start tour" })).toBeFocused();
  });

  test("walks Tab through the card in reading order", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit does not Tab to buttons by default.");

    await startTour(page);
    await expect(page.getByRole("dialog")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Back" })).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("card").getByRole("button", { name: "Next" })).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Close tour" })).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(page.getByTestId("card").getByRole("button", { name: "Next" })).toBeFocused();
  });

  test("keeps focus on Next after activating it with Enter and Space", async ({ page }) => {
    await startTour(page);

    const next = page.getByTestId("card").getByRole("button", { name: "Next" });

    await next.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(next).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("heading", { name: "First" })).toBeVisible();

    await page.keyboard.press("Space");
    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(next).toBeFocused();
  });

  test("pulls focus back into the card when the focused element is replaced on a step change", async ({
    page,
  }) => {
    await startTour(page, "?keyed=1");

    await page.getByTestId("card").getByRole("button", { name: "Next" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("heading", { name: "Second" })).toBeVisible();
    await expect(page.getByRole("dialog")).toBeFocused();
  });

  test("returns to the card with F6 after moving focus out of it", async ({ page }) => {
    await startTour(page);
    await expect(page.getByRole("dialog")).toBeFocused();

    await page.getByRole("button", { name: "Elsewhere" }).focus();

    await page.keyboard.press("F6");
    await expect(page.getByRole("dialog")).toBeFocused();
  });

  test("stops listening for F6 once the tour closes", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("card")).toBeHidden();

    const prevented = await page.evaluate(() => {
      const press = new KeyboardEvent("keydown", { key: "F6", cancelable: true, bubbles: true });

      document.dispatchEvent(press);

      return press.defaultPrevented;
    });

    expect(prevented).toBe(false);
  });
});
