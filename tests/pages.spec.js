// Every page loads cleanly at desktop and phone sizes.
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow, enterQuietly } from './helpers.js';

const pages = [
  { path: '/', h1: /Swamiye\s+Sharanam\s+Ayyappa/ },
  { path: '/poojas/', h1: 'Poojas and timings' },
  { path: '/festivals/', h1: 'Events and festivals' },
  { path: '/visit/', h1: 'Visit the temple' },
];

for (const p of pages) {
  test(`${p.path} loads without errors or sideways scroll`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(p.path);
    if (p.path === '/') await enterQuietly(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.h1);
    await expect(page).toHaveTitle(/Ayyappa Swamy Temple, Kodathi/);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    // walk the page so lazy media and scroll scenes run
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(500);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

test('menu opens, links to every page, and closes with Escape', async ({ page }) => {
  await page.goto('/poojas/');
  const open = page.getByRole('button', { name: 'Menu' });
  await open.click();
  const dialog = page.getByRole('dialog', { name: 'Site menu' });
  await expect(dialog).toBeVisible();
  await expect(open).toHaveAttribute('aria-expanded', 'true');
  for (const name of ['Home', 'Poojas and timings', 'Events and festivals', 'Visit']) {
    await expect(dialog.getByRole('link', { name: new RegExp(`^${name}`) })).toBeVisible();
  }
  await expect(dialog.getByRole('link', { name: /^Poojas and timings/ })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(open).toHaveAttribute('aria-expanded', 'false');
});

test('every page links the map and WhatsApp', async ({ page }) => {
  for (const path of ['/poojas/', '/festivals/', '/visit/']) {
    await page.goto(path);
    const footer = page.locator('footer.foot');
    await expect(footer.getByRole('link', { name: 'Open in Maps' })).toHaveAttribute('href', /maps\.app\.goo\.gl/);
    await expect(footer.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+/);
  }
});

test('festival dates show how far away they are', async ({ page }) => {
  await page.goto('/festivals/');
  const rows = page.locator('.cal__row');
  await expect(rows).toHaveCount(6);
  await expect(rows.first().locator('[data-in]')).toHaveText('Going on');
  await expect(rows.nth(1).locator('[data-in]')).toHaveText(/In \d+ days|Tomorrow|Today|Past/);
});
