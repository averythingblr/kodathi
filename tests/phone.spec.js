// @ts-check
// Phones first (P0), and mostly Android: checks at common Android widths.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection, horizontalOverflow } from './helpers.js';

const PAGES = ['/', '/gallery/', '/poojas/', '/festivals/', '/visit/'];

// these set their own phone size, so one project is enough
test.beforeEach(({}, info) => { test.skip(info.project.name !== 'mobile', 'runs once, in the mobile project'); });

// Android first: 360 px (smaller Samsung and other Androids) and 412 px (Pixel and larger Samsung)
for (const width of [360, 412]) {
  test.describe(`${width} px phone`, () => {
    test.use({ viewport: { width, height: 740 }, isMobile: true, hasTouch: true });

    test('header: the name, language switch, sound and Menu all fit on screen, with 44 px taps', async ({ page }) => {
      for (const path of PAGES) {
        await page.goto(path);
        if (path === '/') await enterQuietly(page);
        for (const sel of ['.head .brand', '[data-script-toggle]', '[data-sound-toggle]', '[data-menu-open]']) {
          const box = await page.locator(sel).boundingBox();
          expect(box, `${path} ${sel}`).not.toBeNull();
          expect(box.x, `${path} ${sel} left`).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width, `${path} ${sel} right`).toBeLessThanOrEqual(width);
          if (sel !== '.head .brand') {
            expect(box.height, `${path} ${sel} height`).toBeGreaterThanOrEqual(44);
            expect(box.width, `${path} ${sel} width`).toBeGreaterThanOrEqual(44);
          }
        }
        // the name and the buttons do not overlap
        const brand = await page.locator('.head .brand').boundingBox();
        const first = await page.locator('[data-script-toggle]').boundingBox();
        expect(brand.x + brand.width).toBeLessThanOrEqual(first.x);
        expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(1);
      }
    });

    test('the sound button shows a muted speaker until sound is on', async ({ page }) => {
      await page.goto('/visit/');
      await expect(page.locator('[data-sound-toggle] .spk')).toBeVisible();
      await expect(page.locator('[data-sound-toggle] .eq')).toBeHidden();
    });

    test('the menu opens and every link is a comfortable tap', async ({ page }) => {
      await page.goto('/visit/');
      await page.locator('[data-menu-open]').click();
      const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
      await expect(links).toHaveCount(7);
      for (const l of await links.all()) {
        const b = await l.boundingBox();
        expect(b.height).toBeGreaterThanOrEqual(44);
        expect(b.x + b.width).toBeLessThanOrEqual(width);
      }
    });

    test('guruswamy cards: photo beside the words, nothing overlapping', async ({ page }) => {
      await page.goto('/');
      await enterQuietly(page);
      await scrollToSection(page, 'swamis', 0);
      const cards = page.locator('.swami');
      for (const card of await cards.all()) {
        const parts = await card.locator(':scope > b, :scope > span:not(.swami__ph):not(:empty)').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.top, r.bottom]; }));
        for (let i = 1; i < parts.length; i++) expect(parts[i][0], 'text lines overlap').toBeGreaterThanOrEqual(parts[i - 1][1] - 1);
        const ph = await card.locator('.swami__ph').boundingBox();
        const name = await card.locator('b').boundingBox();
        expect(name.x).toBeGreaterThan(ph.x + ph.width - 1);
      }
    });

    test('seva, directions and timing links are 44 px buttons', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-11-16T10:00:00+05:30'));
      await page.goto('/poojas/');
      for (const l of await page.locator('.off__link').all()) expect((await l.boundingBox()).height).toBeGreaterThanOrEqual(44);
      await page.goto('/festivals/');
      const dir = page.locator('.cal__map').first();
      await expect(dir).toHaveText('Directions');
      expect((await dir.boundingBox()).height).toBeGreaterThanOrEqual(44);
      await page.goto('/visit/');
      expect((await page.getByRole('link', { name: 'Full pooja timings' }).boundingBox()).height).toBeGreaterThanOrEqual(44);
    });
  });
}
