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

  test('the page tone follows the scroll, with no clock or section times', async ({ page }) => {
    await expect(page.locator('[data-clock], .clock, .time')).toHaveCount(0);
    await expect(page.locator('[data-time]')).toHaveCount(0);
    await scrollToSection(page, 'temple', 0);
    await page.mouse.wheel(0, 200);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'day');
    await scrollToSection(page, 'offerings', 0);
    await page.mouse.wheel(0, 300);
    await expect(page.locator('body')).toHaveAttribute('data-tone', 'kumkum');
  });

  test('the climb counts the eighteen steps', async ({ page }) => {
    await scrollToSection(page, 'climb', 0.2);
    const n = page.locator('[data-step-n]');
    await expect(n).toHaveText(/^0[1-9]$/);
    await scrollToSection(page, 'climb', 0.33);
    await expect(n).toHaveText(/^1[0-3]$/);
    await expect(page.locator('[data-step-grp]')).toHaveText(/passions|gunas/);
    await scrollToSection(page, 'climb', 0.49);
    await expect(n).toHaveText('18');
    await expect(page.locator('[data-step-name] [data-sc="kn"]')).toHaveText('ಅವಿದ್ಯೆ');
    await expect(page.locator('[data-step-name] [data-sc="kn"]')).toBeVisible();
    await expect(page.locator('[data-step-name] [data-sc="te"]')).toBeHidden();
    await expect(page.locator('[data-step-en] [data-sc="kn"]')).toHaveText('Ignorance');
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

  test('maala dharana shows 41 beads and a countdown to Mandala pooja darshan', async ({ page }) => {
    await scrollToSection(page, 'mala', 0);
    await expect(page.locator('#mala')).toContainText('going on since Monday 9 November 2026');
    await expect(page.locator('[data-beads] i')).toHaveCount(41);
    await expect(page.locator('[data-vratham-txt]')).toHaveText('Enter the day you took the mala to see your day of 41.');
    await expect(page.locator('[data-makara]')).toContainText('Until Mandala pooja darshan, 27 December 2026');
    await expect(page.locator('[data-makara]')).not.toContainText(/Jyothi|Makaravilakku/);
    const days = Number(await page.locator('[data-mk="d"]').textContent());
    expect(days).toBeGreaterThanOrEqual(0);
  });

  test('a gallery video plays with sound, one at a time', async ({ page }) => {
    const btns = page.locator('[data-gal-sound]');
    await btns.first().scrollIntoViewIfNeeded();
    await btns.first().click();
    await expect(btns.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(btns.first()).toHaveText('Mute');
    expect(await page.locator('[data-gal-video]').first().evaluate((v) => v.muted)).toBe(false);
    await btns.nth(1).scrollIntoViewIfNeeded();
    await btns.nth(1).click();
    await expect(btns.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(btns.first()).toHaveAttribute('aria-pressed', 'false');
    expect(await page.locator('[data-gal-video]').first().evaluate((v) => v.muted)).toBe(true);
  });
});

test.describe('today at the temple', () => {
  const cases = [
    { t: '19:40', status: 'The temple is open', next: /Next: Athazha pooja in 50 min/ },
    { t: '18:40', status: 'Deeparadhana is happening now', next: /Next: Athazha pooja in 1 h 50 min/ },
    { t: '14:00', status: 'The temple is closed', next: /Next: Sanctum opens in 3 h 00 min/ },
    { t: '22:15', status: 'The temple is closed', next: /Next: Nirmalyam darshan tomorrow, in 6 h 15 min/ },
    { t: '06:10', status: 'The temple is open', next: /Next: Usha pooja in 1 h 20 min/ },
  ];
  for (const c of cases) {
    test(`at ${c.t} IST the status reads "${c.status}"`, async ({ page }) => {
      await page.goto(`/?t=${c.t}`);
      await enterQuietly(page);
      await scrollToSection(page, 'today', 0);
      await expect(page.locator('[data-status-text]')).toHaveText(c.status);
      await expect(page.locator('[data-next]')).toHaveText(c.next);
      await expect(page.locator('[data-now-status-text]')).toHaveText(c.status);
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
