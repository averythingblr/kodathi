// @ts-check
// Round 7: the scrolling notice and highlight for today's events, the "what to call" names,
// the kanne swamy help button, and the Telugu pooja names the temple gave.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection } from './helpers.js';

const MULLUR = 'Padi pooja at Mahesh Swamy’s home, Mullur';
const PAGES = ['/', '/gallery/', '/poojas/', '/festivals/', '/visit/'];

test.describe('on the day of the Mullur padi pooja', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-16T10:00:00+05:30'));
  });

  test('a scrolling notice in the header on every page says so, and links to events', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      if (path === '/') await enterQuietly(page);
      const bar = page.locator('.head [data-ticker]');
      await expect(bar, path).toBeVisible();
      await expect(bar.locator('[data-tk-tag]')).toHaveText('Today');
      await expect(bar.locator('.tk__track')).toContainText(`This evening: ${MULLUR}`);
      // the words move
      const anim = await bar.locator('.tk__track').evaluate((el) => getComputedStyle(el).animationName);
      expect(anim).toContain('tk-run');
      // read once by screen readers, not four times
      await expect(bar.locator('.tk__track')).toHaveAttribute('aria-hidden', 'true');
      // the next day's padi pooja at Kudlu follows it
      await expect(bar.locator('[data-tk-sr]')).toHaveText(`This evening: ${MULLUR}   ✦   Tomorrow evening: Padi pooja at Kudlu. See events.`);
      await expect(bar).toHaveAttribute('href', /\/festivals\/$/);
    }
  });

  test('a large band on the home page and on Events', async ({ page }) => {
    await page.goto('/');
    await enterQuietly(page);
    const band = page.locator('main [data-ticker].tk--band');
    await expect(band).toHaveCount(1);
    await scrollToSection(page, 'now', 1);
    await expect(band).toBeVisible();
    await expect(band).toContainText(MULLUR);
    await page.goto('/festivals/');
    await expect(page.locator('main [data-ticker].tk--band')).toBeVisible();
    await expect(page.locator('main [data-ticker].tk--band')).toContainText(MULLUR);
  });

  test('the padi pooja is highlighted and first in Coming up, and highlighted on Events', async ({ page }) => {
    await page.goto('/');
    await enterQuietly(page);
    const first = page.locator('#coming .up__row:visible').first();
    await expect(first).toContainText(MULLUR);
    await expect(first).toHaveClass(/is-soon/);
    await expect(first.locator('[data-up-in]')).toHaveText('Today');
    expect(await first.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
    await page.goto('/festivals/');
    const row = page.locator('.cal__row', { hasText: 'Mahesh Swamy' });
    await expect(row).toHaveClass(/is-soon/);
    await expect(row.locator('[data-in]')).toHaveText('Today');
  });

  test('Directions to Mahesh Swamy’s home open its map, on the home page and on Events', async ({ page }) => {
    await page.goto('/');
    await enterQuietly(page);
    const link = page.locator('#coming').getByRole('link', { name: 'Directions to Mahesh Swamy’s home, Mullur' });
    await expect(link).toHaveAttribute('href', 'https://maps.app.goo.gl/ojYMhbLgjpkRx9qNA');
    await expect(link).toHaveAttribute('target', '_blank');
    await page.goto('/festivals/');
    await expect(page.locator('.cal').getByRole('link', { name: 'Directions to Mahesh Swamy’s home, Mullur' })).toHaveAttribute('href', 'https://maps.app.goo.gl/ojYMhbLgjpkRx9qNA');
  });

  test('Events still counts the days to later festivals', async ({ page }) => {
    await page.goto('/festivals/');
    const mandala = page.locator('.cal__row', { hasText: 'Mandala pooja' });
    await expect(mandala.locator('[data-in]')).toHaveText('In 41 days');
    await expect(mandala).not.toHaveClass(/is-past|is-soon/);
    await expect(page.locator('.cal__row', { hasText: 'Ugadi' }).locator('[data-in]')).toHaveText(/^In \d+ days$/);
    await expect(page.locator('.cal__row.is-past')).toHaveCount(0);
  });
});

test('the evening before, the notice says Tomorrow evening', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-15T18:00:00+05:30'));
  await page.goto('/visit/');
  const bar = page.locator('.head [data-ticker]');
  await expect(bar.locator('[data-tk-tag]')).toHaveText('Tomorrow');
  await expect(bar.locator('[data-tk-sr]')).toHaveText(`Tomorrow evening: ${MULLUR}. See events.`);
});

test('with nothing today or tomorrow, there is no notice', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-20T10:00:00+05:30'));
  for (const path of ['/', '/festivals/']) {
    await page.goto(path);
    if (path === '/') await enterQuietly(page);
    await expect(page.locator('[data-ticker]').first()).toBeHidden();
    await expect(page.locator('[data-ticker]:visible')).toHaveCount(0);
  }
});

test('with reduced motion the notice stands still', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date('2026-11-16T10:00:00+05:30'));
  await page.goto('/visit/');
  const track = page.locator('.head [data-ticker] .tk__track');
  await expect(track).toBeVisible();
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await ctx.close();
});

test('what to call someone wearing the mala: four plain cards, in the chosen script', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  await scrollToSection(page, 'mala', 0);
  const cards = page.locator('.mala__address .addr li');
  await expect(cards).toHaveCount(4);
  await expect(page.locator('.mala__address')).toContainText('While someone wears the mala, call them by Ayyappa’s names.');
  const expectCard = async (i, who, en, sc) => {
    await expect(cards.nth(i).locator('.addr__who')).toHaveText(who);
    await expect(cards.nth(i).locator('b')).toHaveText(en);
    await expect(cards.nth(i).locator('.mala__term [data-sc]:visible')).toHaveText(sc);
  };
  await expectCard(0, 'Men', 'Swamy', 'ಸ್ವಾಮಿ');
  await expectCard(1, 'Women', 'Matha', 'ಮಾತಾ');
  await expectCard(2, 'Boys', 'Manikanta', 'ಮಣಿಕಂಠ');
  await expectCard(3, 'Girls', 'Malikapuram', 'ಮಾಲಿಕಾಪುರತ್ತಮ್ಮ');
  // the header slides away while scrolling down, so press the switch directly
  await page.locator('[data-script-toggle]').evaluate((b) => b.click());
  await expectCard(3, 'Girls', 'Malikapuram', 'మాలికాపురం');
  await page.goto('/festivals/');
  await expect(page.locator('.addr-terms li')).toHaveCount(4);
  await expect(page.locator('.kn-box')).not.toContainText(/Khammam|banana|coconut/i);
  await expect(page.locator('.kn-box').getByRole('link', { name: 'Ask the temple on WhatsApp' })).toHaveAttribute('href', /wa\.me/);
});

test('the Telugu names of the daily poojas and annadanam, shown only with Telugu chosen', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {} });
  await page.goto('/poojas/');
  await expect(page.locator('.tl__row').first().locator('[data-sc="te"]')).toHaveText('ప్రాతఃకాల పూజ');
  await expect(page.locator('.tl__row').last().locator('[data-sc="te"]')).toHaveText('సాయంకాల పూజ');
  await expect(page.locator('main [data-sc="te"]:visible', { hasText: 'అన్నదానం' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Show Kannada or Telugu script' }).click();
  await expect(page.locator('.tl__row').first().locator('[data-sc]:visible')).toHaveCount(0);
  await expect(page.locator('main [data-sc="kn"]:visible', { hasText: 'ಅನ್ನದಾನ' })).toHaveCount(1);
});
