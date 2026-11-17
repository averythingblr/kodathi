// @ts-check
// The five design mockups at /mockups/1/ to /mockups/5/: real content only, phone first, one script at a time.
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

const names = ['Karuppu', 'Padi', 'Calendar', 'Notice board', 'Deepam'];

for (let n = 1; n <= 5; n++) {
  test(`mockup ${n} (${names[n - 1]}) opens with the temple's name, its guruswamys and the next padi pooja`, async ({ page }) => {
    await page.clock.setSystemTime(new Date('2026-11-17T16:00:00+05:30'));
    const errors = watchErrors(page);
    await page.goto(`/mockups/${n}/`);
    await expect(page).toHaveTitle(new RegExp(`Mockup ${n}: ${names[n - 1]}`));
    await expect(page.locator('main')).toContainText('Ayyappa Swamy Temple');
    await expect(page.locator('main')).toContainText('Lokesh Reddy Swamy');
    await expect(page.locator('main')).toContainText('Rambabu Swamy');
    await expect(page.locator('main [data-date="2026-11-17"]').first()).toContainText('Padi pooja at Kudlu');
    await expect(page.locator('main')).not.toContainText(/senior|priest|\bbook/i);
    // the bar steps between the five
    await expect(page.getByRole('navigation', { name: 'Mockups' }).getByRole('link')).toHaveCount(5);
    expect(errors).toEqual([]);
  });

  test(`mockup ${n} on a 360 px Android phone: nothing off screen, taps at least 44 px, one script at a time`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(`/mockups/${n}/`);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    const small = await page.locator('main a:visible, main button:visible, nav a:visible, nav button:visible').evaluateAll((els) =>
      els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => (e.textContent || '').trim()));
    expect(small).toEqual([]);
    await page.getByRole('button', { name: 'Show Kannada or Telugu script' }).click();
    await expect(page.locator('main [data-sc="kn"]:visible')).toHaveCount(0);
  });
}
