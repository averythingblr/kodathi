// @ts-check
// Android behaviour: the back button closes what is open instead of leaving the page.
import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => { test.skip(info.project.name !== 'mobile', 'Android phone (Pixel 7) project only'); });

test('back closes the photo viewer and stays on the gallery', async ({ page }) => {
  await page.goto('/visit/');
  await page.goto('/gallery/');
  await page.locator('[data-open="1"]').click();
  await expect(page.locator('[data-lb]')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.goBack();
  await expect(page.locator('[data-lb]')).toBeHidden();
  await expect(page).toHaveURL(/\/gallery\/$/);
  // a second back leaves for the previous page as usual
  await page.goBack();
  await expect(page).toHaveURL(/\/visit\/$/);
});

test('closing the viewer with its button does not leave a stray step in history', async ({ page }) => {
  await page.goto('/visit/');
  await page.goto('/gallery/');
  await page.locator('[data-open="0"]').click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('[data-lb]')).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/\/visit\/$/);
});

test('a shared photo link opens the viewer; Close keeps you on the gallery', async ({ page }) => {
  await page.goto('/gallery/#2026-11-12-padi-pooja-temple/1');
  await expect(page.locator('[data-lb]')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('[data-lb]')).toBeHidden();
  await expect(page).toHaveURL(/\/gallery\/$/);
});

test('back closes the menu', async ({ page }) => {
  await page.goto('/poojas/');
  await page.goto('/visit/');
  await page.locator('[data-menu-open]').click();
  await expect(page.locator('[data-menu]')).toHaveClass(/is-open/);
  await page.goBack();
  await expect(page.locator('[data-menu]')).not.toHaveClass(/is-open/);
  await expect(page).toHaveURL(/\/visit\/$/);
  await page.locator('[data-menu-open]').click();
  await page.locator('[data-menu-close]').click();
  await expect(page.locator('[data-menu]')).not.toHaveClass(/is-open/);
  await page.goBack();
  await expect(page).toHaveURL(/\/poojas\/$/);
});
