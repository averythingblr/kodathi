// @ts-check
// Swamis page: the Chief Guruswamy first, then the Guruswamy, then the swamys. The other swamys' names and photos are still to come.
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
  await expect(cards.nth(1)).toContainText('Wearing the mala since 1996');
});

test('the Chief Guruswamy is Lokesh Reddy Swamy and the Guruswamy is Rambabu Swamy, each with his photo', async ({ page }) => {
  await page.goto('/swamis/');
  const [chief, guru] = [page.locator('.sw-card').nth(0), page.locator('.sw-card').nth(1)];
  await expect(chief.locator('.sw-card__role')).toHaveText('Chief Guruswamy');
  await expect(chief.getByRole('heading', { level: 2 })).toHaveText('Lokesh Reddy Swamy');
  await expect(chief).toContainText('Wearing the mala since 1998');
  await expect(chief.locator('.sw-card__note')).toContainText('Swamys come to him to take the mala and to tie the irumudi');
  const img = chief.locator('.sw-card__ph img');
  await expect(img).toHaveAttribute('src', /\/media\/swamis\/chief\.jpg$/);
  await expect(img).toHaveAttribute('alt', 'Lokesh Reddy Swamy');
  await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth >= 800)).toBe(true);
  // nothing is left to come for him
  await expect(chief.locator('.placeholder-note')).toHaveCount(0);
  // the temple said Rambabu Swamy is the Guruswamy (17-11-2026)
  await expect(guru.locator('.sw-card__role')).toHaveText('Guruswamy');
  await expect(guru.getByRole('heading', { level: 2 })).toHaveText('Rambabu Swamy');
  await expect(guru).toContainText('Wearing the mala since 1996');
  const gimg = guru.locator('.sw-card__ph img');
  await expect(gimg).toHaveAttribute('src', /\/media\/swamis\/rambabu\.jpg$/);
  await expect(gimg).toHaveAttribute('alt', 'Rambabu Swamy');
  await gimg.scrollIntoViewIfNeeded();
  await expect.poll(() => gimg.evaluate((i) => i.complete && i.naturalWidth >= 800)).toBe(true);
  await expect(guru.locator('.placeholder-note')).toHaveCount(0);
  await expect(guru).not.toContainText('to come');
  const rest = page.locator('.sw-rest');
  await expect(rest.getByRole('heading', { name: 'Our swamys' })).toBeVisible();
  await expect(rest).toContainText('This season’s swamys.');
  await expect(rest).toContainText('Names and photos to come from the temple');
  // the long-serving swamys, as the temple named them: large frames close to the guruswamys' in size, no title
  const big = page.locator('.sw-big[data-first]');
  await expect(big.locator('b')).toHaveText(['Mahesh Swamy', 'Anjineyulu Swamy']);
  await expect(big.nth(0)).toContainText('Wearing the mala for 23 years');
  await expect(big.nth(1)).toContainText('Wearing the mala since 2010');
  // each with his own photo, in the order the temple sent them
  for (const [n, file, name] of [[0, 'mahesh', 'Mahesh Swamy'], [1, 'anjineyulu', 'Anjineyulu Swamy']]) {
    const img = big.nth(n).locator('.sw-big__ph img');
    await expect(img).toHaveAttribute('src', new RegExp(`/media/swamis/${file}\\.jpg$`));
    await expect(img).toHaveAttribute('alt', name);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth >= 800)).toBe(true);
  }
  await expect(page.locator('.sw-big--wait')).toHaveCount(0);
  const mine = await big.first().locator('.sw-big__ph').boundingBox();
  const guruBox = await page.locator('.sw-card__ph').first().boundingBox();
  expect(mine.width / guruBox.width).toBeGreaterThan(0.8);
  expect(Math.abs(mine.height / mine.width - guruBox.height / guruBox.width)).toBeLessThan(0.05);
  // the other swamys stay small and round: their stand-in circles are far smaller than those frames
  const dot = await page.locator('.sw-wait__dots i').first().boundingBox();
  expect(dot.width).toBeLessThan(mine.width / 2);
  expect(Math.abs(dot.width - dot.height)).toBeLessThan(1);
  await expect(page.locator('.sw-rest')).not.toContainText(/senior/i);
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

test('the home page card shows Lokesh Reddy Swamy with his photo, round', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#swamis .swami').first();
  await expect(card.locator('b')).toHaveText('Lokesh Reddy Swamy');
  await expect(card).toContainText('Chief Guruswamy · Wearing the mala since 1998');
  await expect(card).not.toContainText('to come from the temple');
  const img = card.locator('img');
  await expect(img).toHaveAttribute('src', /\/media\/swamis\/chief-sm\.jpg$/);
  await expect(img).toHaveAttribute('alt', 'Lokesh Reddy Swamy, Chief Guruswamy');
  await card.scrollIntoViewIfNeeded();
  const b = await img.boundingBox();
  expect(Math.abs(b.width - b.height)).toBeLessThan(2);
});

test('the home page Guruswamy row shows Rambabu Swamy, since 1996, with his round photo', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#swamis .swami').nth(1);
  await expect(card.locator('b')).toHaveText('Rambabu Swamy');
  await expect(card).toContainText('Guruswamy · Wearing the mala since 1996');
  await expect(card).not.toContainText('to come from the temple');
  const img = card.locator('img');
  await expect(img).toHaveAttribute('src', /\/media\/swamis\/rambabu-sm\.jpg$/);
  await expect(img).toHaveAttribute('alt', 'Rambabu Swamy, Guruswamy');
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth === 320)).toBe(true);
  const b = await img.boundingBox();
  expect(Math.abs(b.width - b.height)).toBeLessThan(2);
});

test('no page says any picture is AI-generated', async ({ page }) => {
  for (const path of ['/', '/gallery/', '/poojas/', '/festivals/', '/swamis/', '/resources/', '/visit/']) {
    await page.goto(path);
    expect(await page.content(), path).not.toMatch(/AI-generated|art-directed/i);
  }
});
