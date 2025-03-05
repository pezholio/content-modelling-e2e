import { expect } from "@playwright/test";
import { test } from "../lib/cachebust-test";
import { waitForUrlToBeAvailable } from "../lib/utils";

test.describe("Content Block Manager", { tag: ["@app-content-object-store", "@integration"] }, () => {
  test("Can create and embed an object", async ({ page, context }) => {
    await test.step("Logging in", async () => {
      await page.goto("/content-block-manager");
      await expect(page.getByRole("banner", { text: "Content Block Manager" })).toBeVisible();
    });

    const rate = '£122.33'

    const title = await test.step("Can create an object", async () => {
      const title = `E2E TEST PENSION - ${new Date().getTime()}`;

      await page.goto("/content-block-manager");
      await page.getByRole("button", { name: "Create content block" }).click();
      await page.getByLabel("Pension").click();
      await page.getByRole("button", { name: "Save and continue" }).click();

      await page.getByLabel("Title").fill(title);
      await page.getByLabel('Lead organisation').click();
      const option = page.locator('[role="option"]:first-child')
      await option.click()
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByRole('button', { name: 'Add a rate' }).click();
      await page.getByLabel('Title').click();
      await page.getByLabel('Title').fill('Some rate');
      await page.getByLabel('Amount').click();
      await page.getByLabel('Amount').fill(rate);
      await page.getByLabel('Frequency').selectOption('a day');
      await page.getByLabel('Description').click();
      await page.getByLabel('Description').fill('Some description');
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByLabel('I confirm that the details').check();
      await page.getByRole('button', { name: 'Publish' }).click();

      await expect(page.getByRole("heading", { name: "Pension created" })).toBeVisible();

      return title;
    });

    const url = await test.step("Can embed an object", async () => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto("/content-block-manager");

      await page.getByRole('link', { name: title }).click();

      await page.getByText('Copy code').click()

      await page.goto("/");

      await page.getByRole("link", { name: "New document" }).click();
      await page.getByLabel("News article").check();
      await page.getByRole("button", { name: "Next" }).click();

      await page.locator(".choices__item").first().click();
      await page.getByRole("option", { name: "News story", exact: true }).click();

      const documentTitle = `TEST DOCUMENT - ${new Date().getTime()}`;

      await page.getByLabel("Title (required)").fill(documentTitle);
      await page.getByLabel("Summary (required)").fill("Some summary");
      await page.getByLabel('Body (required)').click();
      await page.getByLabel('Body (required)').press('Meta+v')

      await page.getByRole("button", { name: "Save and go to document" }).click();
      await page.getByRole("link", { name: "Add tags" }).click();
      await page
        .locator('[id="taxonomy_tag_form\\[taxons\\]"]')
        .getByRole("list")
        .locator("div")
        .first()
        .click();
      await page.getByRole("button", { name: "Save" }).click();

      await page.getByRole("button", { name: "Force publish" }).click();
      await page.getByLabel("Reason for force publishing").fill("Some reason");
      await page.getByRole("button", { name: "Force publish" }).click();

      await page.getByRole("link", { name: documentTitle }).click();
      const url = await waitForUrlToBeAvailable(
        page,
        await page.getByRole("link", { name: "View on website" }).getAttribute("href")
      );

      await page.goto(url);
      await expect(page.getByText(rate)).toBeVisible();

      return url;
    });

    await test.step("Dependent content updates when block content changes", async () => {
      const updatedRate = '£122.99';

      await page.goto("/content-block-manager");

      await page.getByRole('link', { name: title }).click();

      await page.getByRole('button', { name: 'Edit pension' }).click();
      await page.getByRole('button', { name: 'Save and continue' }).click();
      await page.getByRole('link', { name: 'Edit   Rate details' }).click();

      await page.getByLabel('Amount').fill(updatedRate);
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByLabel('No').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByLabel('Publish the edit now').check();
      await page.getByRole('button', { name: 'Save and continue' }).click();

      await page.getByLabel('I confirm that the details').check();
      await page.getByRole('button', { name: 'Publish' }).click();

      await expect(async () => {
        await page.goto(`${url}?cacheBust=${new Date().getTime()}`)
        await expect(page.getByText(updatedRate)).toBeVisible();
      }).toPass();
    });
  });
});
