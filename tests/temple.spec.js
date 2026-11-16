// @ts-check
// The home page is about OUR temple: its name on the first screen, its own video, and what the temple told us about itself.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection, horizontalOverflow } from './helpers.js';

test('the first screen names the temple and its road, with the chant above', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveText(/Ayyappa\s+Swamy Temple\s+Kodathi/);
  await expect(h1).toBeInViewport();
  await expect(page.locator('.hero__road')).toHaveText('Kodati–Sulikunte Road, Bengaluru');
  await expect(page.locator('#nada .kicker__en')).toHaveText('Swamiye Sharanam Ayyappa');
  // the chant in the chosen script only
  await expect(page.locator('#nada .kicker [data-sc="kn"]')).toBeVisible();
  await expect(page.locator('#nada .kicker [data-sc="te"]')).toBeHidden();
});

test('the opening film is the temple’s own padi pooja video, silent and looping, and says so', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  const film = page.locator('[data-hero-film]');
  await expect.poll(() => film.evaluate((v) => v.currentSrc)).toMatch(/gallery\/2026-11-12-padi-pooja-temple\/loop-[12]\.mp4$/);
  expect(await film.evaluate((v) => v.muted && v.loop)).toBe(true);
  await expect.poll(() => film.evaluate((v) => v.readyState >= 2 && !v.paused), { timeout: 10_000 }).toBe(true);
  // not one of the generated films
  expect(await film.evaluate((v) => v.currentSrc)).not.toMatch(/\/film\//);
  await expect(page.locator('[data-hero-cap]')).toHaveText('Our temple · Padi Pooja at Temple | 12-11-2026');
});

test('phones get the upright cut of the video, large screens the wide one', async ({ page, isMobile }) => {
  await page.goto('/');
  await enterQuietly(page);
  await expect.poll(() => page.locator('[data-hero-film]').evaluate((v) => v.currentSrc)).toMatch(isMobile ? /loop-1\.mp4$/ : /loop-2\.mp4$/);
});

test('with motion turned off the first screen shows a still of the same video', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 412, height: 915 }, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('/');
  await enterQuietly(page);
  const film = page.locator('[data-hero-film]');
  expect(await film.evaluate((v) => getComputedStyle(v).backgroundImage)).toMatch(/loop-1\.jpg/);
  expect(await film.evaluate((v) => v.paused)).toBe(true);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Ayyappa\s+Swamy Temple\s+Kodathi/);
  await ctx.close();
});

test('"Our temple in Kodathi" says what the temple told us, and nothing else', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  await scrollToSection(page, 'temple', 0);
  const sec = page.locator('#temple .day__intro');
  await expect(sec.getByRole('heading', { name: 'Our temple in Kodathi' })).toBeVisible();
  for (const t of [
    'away from the noise and rush of the city',
    'trees all around and the lake close by',
    'A Shiva linga is worshipped here along with Ayyappa Swamy',
    'a quiet place to sit and meditate',
    'Kodathi, Mullur, Sarjapura Road, Kannali Road',
    'washrooms open day and night',
    'places to bathe and change',
    'plenty of room to sleep',
    'a kitchen that cooks for the devotees',
  ]) await expect(sec).toContainText(t);
  // the old lines nobody at the temple gave us are gone
  await expect(sec).not.toContainText(/Varthur|annadanam at noon|morning abhishekam/);
  // no founding year or founder until the temple sends them
  await expect(sec).not.toContainText(/founded|established|since \d{4}|\b(19|20)\d\d\b/);
  // plain words, not brochure words
  await expect(sec).not.toContainText(/nestled|serene|tranquil|haven|sanctuary|oasis|vibrant|testament|sacred space/i);
});

test('a quick list of what you find at the temple: seven things, two to a row on a phone', async ({ page, isMobile }) => {
  await page.goto('/');
  await enterQuietly(page);
  const items = page.locator('.have li');
  await expect(items).toHaveCount(7);
  for (const t of ['Ayyappa Swamy and a Shiva linga', 'Trees and the lake', 'A place to meditate', 'Washrooms day and night', 'Bathing and changing', 'Room to sleep', 'A kitchen']) {
    await expect(page.locator('.have')).toContainText(t);
  }
  if (isMobile) {
    const a = await items.nth(0).boundingBox(), b = await items.nth(1).boundingBox(), c = await items.nth(2).boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(c.y).toBeGreaterThan(a.y + 10);
    expect(b.x + b.width).toBeLessThanOrEqual(page.viewportSize().width);
  }
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
});

test.describe('on Android phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'phones only');
  for (const width of [360, 412]) {
    test(`${width} px: the temple’s name fits the first screen without being cut`, async ({ page }) => {
      await page.setViewportSize({ width, height: 740 });
      await page.goto('/');
      await enterQuietly(page);
      for (const line of await page.locator('#h-nada .line').all()) {
        const box = await line.evaluate((el) => { const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); return { x: b.left, r: b.right }; });
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.r).toBeLessThanOrEqual(width);
      }
      // the caption and the scroll cue do not sit on top of each other
      const cap = await page.locator('[data-hero-cap]').boundingBox();
      const cue = await page.locator('[data-cue]').boundingBox();
      expect(cap.x + cap.width).toBeLessThanOrEqual(cue.x);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    });
  }
});
