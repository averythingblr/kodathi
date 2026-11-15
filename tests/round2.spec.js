// Kannada / Telugu scripts, the sharanam vili chorus, darshan and the lit finale.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection, watchErrors } from './helpers.js';

test('the header switch flips every label between Kannada and Telugu, and remembers it', async ({ page }) => {
  await page.goto('/poojas/');
  const kn = page.locator('.tl [data-sc="kn"]').first();
  const te = page.locator('.tl [data-sc="te"]').first();
  await expect(kn).toBeVisible();
  await expect(te).toBeHidden();
  await expect(kn).toHaveText('ಬಾಗಿಲು ತೆರೆಯುವುದು');
  await page.locator('[data-script-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-script', 'te');
  await expect(te).toBeVisible();
  await expect(kn).toBeHidden();
  await expect(te).toHaveText('తలుపులు తెరవడం');
  await page.goto('/festivals/');
  await expect(page.locator('html')).toHaveAttribute('data-script', 'te');
  await expect(page.locator('.cal [data-sc="te"]').first()).toBeVisible();
});

test('no Malayalam script remains on any page', async ({ page }) => {
  for (const path of ['/', '/poojas/', '/festivals/', '/visit/']) {
    await page.goto(path);
    const html = await page.content();
    expect(html, path).not.toMatch(/[ഀ-ൿ]/);
  }
});

test('the hero carries the chant in Kannada and Telugu', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  await expect(page.locator('#nada [lang="kn"]').first()).toHaveText('ಸ್ವಾಮಿಯೇ ಶರಣಂ ಅಯ್ಯಪ್ಪ');
  await expect(page.locator('#nada [lang="te"]').first()).toHaveText('స్వామియే శరణం అయ్యప్ప');
});

test.describe('sharanam vili', () => {
  test('calling turns sound on and the chorus answers', async ({ page }) => {
    const errors = watchErrors(page);
    const played = [];
    page.on('request', (r) => { const m = r.url().match(/vili-(\d)\.mp3/); if (m) played.push(+m[1]); });
    await page.goto('/');
    await enterQuietly(page);
    await scrollToSection(page, 'vili', 0);
    const call = page.locator('[data-call]');
    await call.scrollIntoViewIfNeeded();
    await expect(page.locator('[data-call-next]')).toHaveText('Swamiye');
    await call.click();
    await expect(page.locator('[data-sound-toggle]').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText('Swamiye');
    await expect(page.locator('[data-call-count]')).toHaveText(/The chorus answered/, { timeout: 6000 });
    await expect(page.locator('[data-call-next]')).toHaveText('Harihara sudhane');
    await page.waitForTimeout(1000);
    await call.click();
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText('Harihara sudhane');
    await expect(page.locator('[data-call-count]')).toHaveText(/called 2 times/, { timeout: 8000 });
    await expect(page.locator('[data-call-next]')).toHaveText('Kannimoola Ganapathi Bhagavane');
    // every line has its own recording, so each call sings a different name
    expect(new Set(played).size).toBeGreaterThanOrEqual(2);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test('the idol appears when the nada opens and at the top of the eighteen steps', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  await expect(page.locator('#darshan')).toHaveCount(0);
  await expect(page.locator('#doors video')).toHaveAttribute('data-src', /nada\.mp4$/);
  await expect(page.locator('#doors video')).toHaveAttribute('aria-label', /doors open onto Lord Ayyappa/);
  await expect(page.locator('#climb video')).toHaveAttribute('aria-label', /to the darshan of Lord Ayyappa/);
  await scrollToSection(page, 'doors', 0.7);
  await expect(page.locator('[data-nirmalyam]')).toHaveCSS('opacity', /^(0\.[3-9]\d*|1)$/);
  await scrollToSection(page, 'climb', 0.75);
  await expect(page.locator('[data-darshan-copy]')).toHaveCSS('opacity', /^(0\.[5-9]\d*|1)$/);
  await scrollToSection(page, 'climb', 0.98);
  await expect(page.locator('[data-darshan-chorus]')).toHaveCSS('opacity', /^(0\.[5-9]\d*|1)$/);
});

test('the finale shows every lamp lit', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  const order = await page.evaluate(() => ['climb', 'ours', 'hari'].map((id) => document.getElementById(id).getBoundingClientRect().top + scrollY));
  expect(order).toEqual([...order].sort((a, b) => a - b));
  await expect(page.locator('#hari video')).toHaveAttribute('data-src', /finale\.mp4$/);
  await expect(page.locator('#hari .lede')).toContainText('keeps burning');
});
