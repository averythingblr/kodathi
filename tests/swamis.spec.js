// @ts-check
// Swamis page: the Chief Guruswamy first, then the Guruswamy, then the swamys. Placeholders until the temple sends names and photos.
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

test('the page opens with its name and loads cleanly', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/swamis/');
  await expect(page.getByRole('heading', { level: 1, name: 'Our Guruswamys and Swamys' })).toBeVisible();
  await expect(page).toHaveTitle(/Our Guruswamys and Swamys \| Ayyappa Swamy Temple, Kodathi/);
  expect(errors).toEqual([]);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
});

test('the Chief Guruswamy comes first, wearing the mala since 1998, then the Guruswamy', async ({ page }) => {
  await page.goto('/swamis/');
  const cards = page.locator('.sw-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toHaveAttribute('data-role', 'chief');
  await expect(cards.nth(0).locator('.sw-card__role')).toHaveText('Chief Guruswamy');
  await expect(cards.nth(0)).toContainText('Wearing the mala since 1998');
  await expect(cards.nth(1).locator('.sw-card__role')).toHaveText('Guruswamy');
  // nothing is said about the Guruswamy that the temple has not told us
  await expect(cards.nth(1)).not.toContainText('since');
});

test('no name or photo is invented: each card says they are still to come', async ({ page }) => {
  await page.goto('/swamis/');
  for (const card of await page.locator('.sw-card').all()) {
    await expect(card.locator('.placeholder-note')).toHaveText('Name and photo to come from the temple');
    await expect(card.locator('img')).toHaveCount(0);
    await expect(card.locator('.sw-card__ph')).toHaveAttribute('data-empty', '');
    // the name line is empty, and says so to screen readers
    await expect(card.getByRole('heading', { level: 2 })).toHaveAccessibleName(/name to come$/);
  }
  const rest = page.locator('.sw-rest');
  await expect(rest.getByRole('heading', { name: 'Our swamys' })).toBeVisible();
  await expect(rest).toContainText('This season’s swamys.');
  await expect(rest).toContainText('Names and photos to come from the temple');
  // the two or three long-serving swamys: one large empty frame stands in, close to the guruswamys' in size
  const big = page.locator('.sw-big--wait');
  await expect(big).toHaveCount(1);
  const mine = await big.locator('.sw-big__ph').boundingBox();
  const guru = await page.locator('.sw-card__ph').first().boundingBox();
  expect(mine.width / guru.width).toBeGreaterThan(0.8);
  expect(Math.abs(mine.height / mine.width - guru.height / guru.width)).toBeLessThan(0.05);
  // the other swamys stay small and round: their stand-in circles are far smaller than that frame
  const dot = await page.locator('.sw-wait__dots i').first().boundingBox();
  expect(dot.width).toBeLessThan(mine.width / 2);
  expect(Math.abs(dot.width - dot.height)).toBeLessThan(1);
  await expect(page.locator('[data-role="swamy"]')).toHaveCount(0);
});

test('the word "priest" is not used, and nothing is "booked"', async ({ page }) => {
  await page.goto('/swamis/');
  await expect(page.locator('main')).not.toContainText(/priest|book/i);
});

test('the long-serving swamys are given no title: the page never says "senior"', async ({ page }) => {
  await page.goto('/swamis/');
  await expect(page.locator('body')).not.toContainText(/senior/i);
  // one heading covers every swamy after the two guruswamys
  await expect(page.locator('.sw-rest').getByRole('heading')).toHaveCount(1);
  await expect(page.locator('.sw-rest').getByRole('heading')).toHaveText('Our swamys');
});

test('go to a guruswamy for maala dharana, the irumudi, and to invite our swamys', async ({ page }) => {
  await page.goto('/swamis/');
  const go = page.locator('.sw-go');
  const mala = go.getByRole('link', { name: 'Ask about maala dharana on WhatsApp' });
  expect(decodeURIComponent((await mala.getAttribute('href')).split('text=')[1])).toBe('Swamiye Sharanam. I would like to take the mala.');
  const iru = go.getByRole('link', { name: 'Ask about the irumudi on WhatsApp' });
  await expect(iru).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
  expect(decodeURIComponent((await iru.getAttribute('href')).split('text=')[1])).toContain('irumudi');
  await expect(go).toContainText('The guruswamy confirms with you personally.');
  // the invitation goes to the form on Events
  await go.getByRole('link', { name: 'Invite our swamys' }).click();
  await expect(page).toHaveURL(/\/festivals\/#invite$/);
  await expect(page.getByRole('heading', { name: /Invite our swamys/i }).first()).toBeVisible();
});

test('what to call someone wearing the mala: the four names, in the chosen script only', async ({ page }) => {
  await page.goto('/swamis/');
  const list = page.locator('.sw-call__list li');
  await expect(list).toHaveCount(4);
  for (const w of ['Swamy', 'Matha', 'Manikanta', 'Malikapuram']) await expect(page.locator('.sw-call__list')).toContainText(w);
  await expect(list.nth(2).locator('[data-sc="kn"]')).toHaveText('ಮಣಿಕಂಠ');
  await expect(list.nth(2).locator('[data-sc="te"]')).toBeHidden();
  await page.getByRole('button', { name: 'Show Kannada or Telugu script' }).click();
  await expect(list.nth(2).locator('[data-sc="te"]')).toHaveText('మణికంఠ');
  await expect(list.nth(2).locator('[data-sc="kn"]')).toBeHidden();
  // the word above the title follows the switch too
  await expect(page.locator('.sw-hero__sc [data-sc="te"]')).toHaveText('గురుస్వామి');
  await expect(page.locator('.sw-hero__sc [data-sc="kn"]')).toBeHidden();
  // no Kannada letters anywhere on screen while Telugu is chosen
  const visible = await page.locator('main').innerText();
  expect(visible).not.toMatch(/[ಀ-೿]/);
});

test('the menu, the footer and the home page lead to the page', async ({ page }) => {
  await page.goto('/visit/');
  await expect(page.locator('footer.foot').getByRole('link', { name: 'Guruswamys and Swamys' })).toHaveAttribute('href', /\/swamis\/$/);
  await page.getByRole('button', { name: 'Menu' }).click();
  const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /Guruswamys and Swamys/ });
  await link.click();
  await expect(page).toHaveURL(/\/swamis\/$/);
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /Guruswamys and Swamys/ })).toHaveAttribute('aria-current', 'page');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Meet our guruswamys and swamys' })).toHaveAttribute('href', /\/swamis\/$/);
});

test.describe('on Android phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'phones only');
  for (const width of [360, 412]) {
    test(`${width} px: cards stack, buttons are 44 px taps, nothing off screen; back closes the menu`, async ({ page }) => {
      await page.setViewportSize({ width, height: 740 });
      await page.goto('/swamis/');
      // the photo frame sits above the words on a phone
      const card = page.locator('.sw-card').first();
      const ph = await card.locator('.sw-card__ph').boundingBox();
      const role = await card.locator('.sw-card__role').boundingBox();
      expect(role.y).toBeGreaterThanOrEqual(ph.y + ph.height - 1);
      for (const b of await page.locator('.sw-go .btn').all()) {
        const box = await b.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
      // seven links in the menu, each a comfortable tap, all on screen
      await page.locator('[data-menu-open]').click();
      const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
      await expect(links).toHaveCount(7);
      await expect(links.last()).toBeInViewport();
      await page.goBack();
      await expect(page.locator('[data-menu]')).not.toHaveClass(/is-open/);
      await expect(page).toHaveURL(/\/swamis\/$/);
    });
  }
});
