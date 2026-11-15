// The home page: one temple day, scroll as time.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection, watchErrors } from './helpers.js';

test.describe('opening', () => {
  test('the lamp lights, then both entry choices appear', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-preloader]')).toBeVisible();
    await expect(page.locator('[data-pre-status]')).toHaveText('The lamp is lit', { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Enter with sound' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enter quietly' })).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/is-gated/);
  });

  test('entering quietly removes the gate and leaves sound off', async ({ page }) => {
    await page.goto('/');
    await enterQuietly(page);
    await expect(page.locator('body')).not.toHaveClass(/is-gated/);
    await expect(page.locator('[data-sound-toggle]').first()).toHaveAttribute('aria-pressed', 'false');
  });

  test('entering with sound turns the sound control on', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Enter with sound' }).click();
    await expect(page.locator('[data-sound-toggle]').first()).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-sound-toggle]').first().click();
    await expect(page.locator('[data-sound-toggle]').first()).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('the temple day', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await enterQuietly(page);
  });

  test('the clock and page tone follow the scroll', async ({ page }) => {
    const clock = page.locator('[data-clock-t]');
    await expect(clock).toHaveText(/^04:[3-5]\d$/);
    await scrollToSection(page, 'temple', 0);
    await page.mouse.wheel(0, 200);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'day');
    await expect(clock).toHaveText(/^0[7-9]:\d\d$/);
    await scrollToSection(page, 'offerings', 0);
    await page.mouse.wheel(0, 300);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'kumkum');
  });

  test('the climb counts the eighteen steps', async ({ page }) => {
    await scrollToSection(page, 'climb', 0.2);
    const n = page.locator('[data-step-n]');
    await expect(n).toHaveText(/^0[1-9]$/);
    await scrollToSection(page, 'climb', 0.4);
    await expect(n).toHaveText(/^1[0-3]$/);
    await expect(page.locator('[data-step-grp]')).toHaveText(/passions|gunas/);
    await scrollToSection(page, 'climb', 0.65);
    await expect(n).toHaveText('18');
    await expect(page.locator('[data-step-name]')).toHaveText('Ignorance');
    await expect(page.locator('[data-rail] li.on')).toHaveCount(18);
  });

  test('scroll films load and seek', async ({ page }) => {
    await scrollToSection(page, 'doors', 0.5);
    const t = await page.locator('#doors video').evaluate(async (v) => {
      for (let i = 0; i < 40 && (v.readyState < 2 || v.currentTime < 1); i++) await new Promise((r) => setTimeout(r, 100));
      return { ready: v.readyState, t: v.currentTime, d: v.duration };
    });
    expect(t.ready).toBeGreaterThanOrEqual(2);
    expect(t.t).toBeGreaterThan(0.5);
    expect(t.t).toBeLessThan(t.d);
  });

  test('offerings open one at a time with a prefilled WhatsApp booking', async ({ page }) => {
    await scrollToSection(page, 'offerings', 0);
    const first = page.getByRole('button', { name: /^Padi pooja/ });
    const second = page.getByRole('button', { name: /^Neyyabhishekam/ });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    const book = page.getByRole('link', { name: 'Book Neyyabhishekam on WhatsApp' });
    await expect(book).toBeVisible();
    const href = await book.getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decodeURIComponent(href.split('text=')[1])).toContain('Neyyabhishekam');
  });

  test('Mandala season shows 41 beads and a countdown to Mandala pooja darshan', async ({ page }) => {
    await scrollToSection(page, 'mandala', 0);
    await expect(page.locator('[data-beads] i')).toHaveCount(41);
    await expect(page.locator('[data-vratham-txt]')).toHaveText(/begins|Day \d+ of 41|Mandala pooja darshan/);
    await expect(page.locator('[data-makara]')).toContainText('Until Mandala pooja darshan, 27 December 2026');
    await expect(page.locator('[data-makara]')).not.toContainText(/Jyothi|Makaravilakku/);
    const days = Number(await page.locator('[data-mk="d"]').textContent());
    expect(days).toBeGreaterThanOrEqual(0);
  });

  test('our padi pooja video plays and can be unmuted', async ({ page }) => {
    await scrollToSection(page, 'ours', 0);
    const btn = page.getByRole('button', { name: 'Play with sound' });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(page.getByRole('button', { name: 'Mute' })).toBeVisible();
    expect(await page.locator('[data-real]').evaluate((v) => v.muted)).toBe(false);
  });
});

test.describe('today at the temple', () => {
  const cases = [
    { t: '19:40', status: 'Padi pooja is happening now', next: /Next: Athazha pooja in 50 min/ },
    { t: '14:00', status: 'The nada is closed', next: /Next: Nada opens in 3 h 00 min/ },
    { t: '22:15', status: 'The nada is closed', next: /Next: Nada opens tomorrow, in 6 h 15 min/ },
    { t: '06:10', status: 'The nada is open', next: /Next: Usha pooja in 1 h 20 min/ },
  ];
  for (const c of cases) {
    test(`at ${c.t} IST the status reads "${c.status}"`, async ({ page }) => {
      await page.goto(`/?t=${c.t}`);
      await enterQuietly(page);
      await scrollToSection(page, 'today', 0);
      await expect(page.locator('[data-status-text]')).toHaveText(c.status);
      await expect(page.locator('[data-next]')).toHaveText(c.next);
    });
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('scenes lay out as still frames and everything stays readable', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await enterQuietly(page);
    await expect(page.locator('html')).toHaveClass(/rm/);
    const h = await page.locator('#climb').evaluate((el) => el.getBoundingClientRect().height);
    const vh = await page.evaluate(() => window.innerHeight);
    expect(h).toBeLessThan(vh * 2);
    await expect(page.locator('[data-climb-step]')).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
