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

test('the lamp film stays behind the temple’s name; the padi pooja video lives in the gallery', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  const film = page.locator('#nada video');
  await expect(film).toHaveAttribute('data-src', /film\/lamps\.mp4$/);
  await expect(film).toHaveAttribute('poster', /film\/lamps-poster\.jpg$/);
  await expect(page.locator('[data-hero-film]')).toHaveCount(0);
  // the temple is named in the words, not by a picture
  await expect(page.locator('.hero__sub')).toContainText('Ayyappa Swamy and a Shiva linga, away from the city among trees by the lake.');
  await expect(page.locator('#nada')).not.toContainText(/Padi Pooja at Temple \| 12-11-2026/);
  // the video is still on the site: it opens the gallery
  await page.goto('/gallery/');
  await expect(page.locator('[data-gx-video]')).toHaveAttribute('poster', /2026-11-16-padi-pooja-mullur\/loop-1\.jpg$/);
});

test('with motion turned off the first screen still names the temple', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 412, height: 915 }, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('/');
  await enterQuietly(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Ayyappa\s+Swamy Temple\s+Kodathi/);
  await expect(page.locator('.hero__road')).toBeVisible();
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
      // the line about the temple stays on screen too
      const sub = await page.locator('.hero__sub').boundingBox();
      expect(sub.x + sub.width).toBeLessThanOrEqual(width);
      expect(sub.y + sub.height).toBeLessThanOrEqual(740);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    });
  }
});
