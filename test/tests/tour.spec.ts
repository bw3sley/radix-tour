import { expect, test } from "@playwright/test";

test.describe("tour", () => {
  test("walks through the steps with the buttons", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("start").click();

    const card = page.getByTestId("card");

    await expect(card).toContainText("First");

    await card.getByRole("button", { name: "Next" }).click();
    await expect(card).toContainText("Second");

    await card.getByRole("button", { name: "Back" }).click();
    await expect(card).toContainText("First");

    await card.getByRole("button", { name: "Close tour" }).click();
    await expect(card).toBeHidden();
  });

  test("navigates with the arrow keys and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("start").click();

    const card = page.getByTestId("card");

    await expect(card).toContainText("First");

    await page.keyboard.press("ArrowRight");
    await expect(card).toContainText("Second");

    await page.keyboard.press("ArrowLeft");
    await expect(card).toContainText("First");

    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();
  });

  test("restores focus to the opener when it closes", async ({ page }) => {
    await page.goto("/");

    const start = page.getByTestId("start");

    // WebKit does not focus a button on click, so open the tour from the keyboard.
    await start.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("card")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(start).toBeFocused();
  });

  test("moves between steps without animation when motion is off", async ({ page }) => {
    await page.goto("/no-motion");
    await page.getByTestId("start").click();

    const card = page.getByTestId("card");

    await card.getByRole("button", { name: "Next" }).click();
    await expect(card).toContainText("Second");
    await expect(card).not.toHaveAttribute("data-motion", /.+/);
  });
});
