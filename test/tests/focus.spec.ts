import { expect, test } from "@playwright/test";
import { startTour } from "./start-tour";

test.describe("focus return", () => {
  test("returns focus to the opener after Escape", async ({ page }) => {
    await startTour(page);

    await page.keyboard.press("Escape");

    await expect(page.getByTestId("start")).toBeFocused();
  });

  test("returns focus to the opener after the close button", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("close").click();

    await expect(page.getByTestId("start")).toBeFocused();
  });

  test("returns focus to the opener after the last step", async ({ page }) => {
    await startTour(page);

    await page.getByTestId("next").click();
    await page.getByTestId("next").click();

    await expect(page.getByTestId("start")).toBeFocused();
  });

  test("does not move focus when the opener is gone", async ({ page }) => {
    await startTour(page, "?opener=remove-on-close");

    await page.keyboard.press("Escape");

    await expect(page.getByTestId("card")).toBeHidden();
    await expect(page.getByTestId("start")).toHaveCount(0);
  });

  test("does not throw or steal focus when the opener unmounts as the tour starts", async ({
    page,
  }) => {
    await startTour(page, "?opener=unmount-on-open");

    await expect(page.getByTestId("start")).toHaveCount(0);

    await page.keyboard.press("Escape");

    await expect(page.getByTestId("card")).toBeHidden();
    await expect(page.locator("body")).toBeFocused();
  });
});

test.describe("focus management", () => {
  test("moves focus into the card when the tour opens", async ({ page }) => {
    await startTour(page);

    await expect(page.getByTestId("card")).toBeFocused();
  });

  test("leaves focus alone when onOpenAutoFocus is prevented", async ({ page }) => {
    await startTour(page, "?autofocus=prevent");

    await expect(page.getByTestId("start")).toBeFocused();
  });

  test("leaves focus on the opener when auto focus is prevented, and arrows still change the step", async ({
    page,
  }) => {
    await startTour(page, "?autofocus=prevent");

    await page.keyboard.press("ArrowRight");

    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(page.getByTestId("start")).toBeFocused();
  });

  test("walks Tab through the card in reading order", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit does not Tab to buttons by default.");

    await startTour(page);
    await expect(page.getByTestId("card")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("back")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("next")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("close")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(page.getByTestId("next")).toBeFocused();
  });

  test("keeps focus on Next after activating it with Enter and Space", async ({ page }) => {
    await startTour(page);

    const next = page.getByTestId("next");

    await next.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(next).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("title")).toHaveText("First");

    await page.keyboard.press("Space");
    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(next).toBeFocused();
  });

  test("pulls focus back into the card when the focused element is replaced on a step change", async ({
    page,
  }) => {
    await startTour(page, "?keyed=1");

    await page.getByTestId("next").focus();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("title")).toHaveText("Second");
    await expect(page.getByTestId("card")).toBeFocused();
  });

  test("returns to the card with F6 after moving focus out of it", async ({ page }) => {
    await startTour(page);
    await expect(page.getByTestId("card")).toBeFocused();

    await page.getByTestId("elsewhere").focus();

    await page.keyboard.press("F6");
    await expect(page.getByTestId("card")).toBeFocused();
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
