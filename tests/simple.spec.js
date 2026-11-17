// @ts-check
// The simple site at /simple/: the same temple in a quieter look. No gate, no films, no sound until a tap.
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

const URL = '/simple/';

test.beforeEach(async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-11-17T09:00:00+05:30'));
});

test('opens straight onto the page: no gate, the temple name first, no errors', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(URL);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ayyappa Swamy Temple, Kodathi');
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  await expect(page.getByText('Enter with sound')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('Kodati–Sulikunte Road, Bengaluru');
  await expect(page.locator('main')).toContainText('Morning pooja 5:00 am');
  await expect(page.locator('main')).toContainText('Evening pooja 7:00 pm');
  expect(errors).toEqual([]);
});

test('no sound plays by itself: the opening clip is silent and nothing else starts', async ({ page }) => {
  await page.addInitScript(() => {
    // count every sound the page tries to start
    window.__sounds = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { if (!this.muted) window.__sounds++; return play.call(this); };
    const A = window.AudioContext;
    window.AudioContext = class extends A { constructor(...a) { super(...a); window.__sounds++; } };
  });
  await page.goto(URL);
  await expect(page.locator('[data-hero]')).toHaveJSProperty('muted', true);
  for (let y = 0; y < 12000; y += 800) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(60); }
  expect(await page.evaluate(() => window.__sounds)).toBe(0);
  await expect(page.locator('audio')).toHaveCount(0);
});

test('the nine sections come in the mockup’s order', async ({ page }) => {
  await page.goto(URL);
  const h2 = await page.locator('main h2').allTextContents();
  expect(h2).toEqual([
    'A place for prayer. And time to be still.',
    'Today at the temple',
    'Your 41 days begin here.',
    'From our poojas',
    'Guidance for the journey.',
    'Offer a pooja.',
    'Swamiye Sharanam Ayyappa',
    'Visit the temple.',
  ]);
});

test('today at the temple shows both poojas, and the padi pooja at Kudlu as today', async ({ page }) => {
  await page.goto(URL);
  const today = page.locator('#today');
  await expect(today.locator('.s-times li')).toHaveCount(2);
  const next = today.locator('[data-next-date]:visible');
  await expect(next).toHaveCount(1);
  await expect(next).toContainText('Padi pooja at Kudlu');
  await expect(next).toContainText('Today');
  await expect(next).toContainText('Tuesday, 6:00 pm');
  await expect(next.getByRole('link', { name: 'Directions to Kudlu' })).toHaveAttribute('href', 'https://maps.app.goo.gl/oinPCm499mcU5vAv5');
  // the bar at the top says so too
  await expect(page.locator('[data-note-text]')).toHaveText('Today: Padi pooja at Kudlu');
});

test('the day after, the next event is the Mandala pooja and the bar is back to maala dharana', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-11-18T09:00:00+05:30'));
  await page.goto(URL);
  const next = page.locator('#today [data-next-date]:visible');
  await expect(next).toContainText('Mandala pooja');
  await expect(next).toContainText('Coming up');
  await expect(page.locator('[data-note-text]')).toHaveText('Maala dharana is going on · since 9 November');
});

test('the 41-day tracker counts from the day you took the mala, and remembers it', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('[data-deeksha]');
  await card.getByLabel('The day you took the mala').fill('2026-11-09');
  await card.getByLabel('The day you took the mala').dispatchEvent('change');
  await expect(card.locator('[data-mala-txt]')).toContainText('Day 9 of 41');
  await expect(card.locator('rect.on')).toHaveCount(8);
  await expect(card.locator('rect.today')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-mala-txt]')).toContainText('Day 9 of 41');
});

test('first-time swamys can open what a kanne swamy brings, and ask on WhatsApp', async ({ page }) => {
  await page.goto(URL);
  const k = page.locator('.s-kanne');
  await k.locator('summary').click();
  await expect(k).toContainText('Black clothes');
  await expect(k).toContainText('Two malas and the mudra');
  await expect(k.getByRole('link', { name: /Ask the temple on WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/919916714933\?text=/);
});

test('the guruswamys with their photos, then Mahesh and Anjineyulu Swamy; never "senior" or "priest"', async ({ page }) => {
  await page.goto(URL);
  const g = page.locator('#guruswamys');
  await expect(g.locator('.s-guru__lead h3')).toHaveText(['Lokesh Reddy Swamy', 'Rambabu Swamy']);
  await expect(g.locator('.s-guru__role')).toHaveText(['Chief Guruswamy', 'Guruswamy']);
  await expect(g.locator('.s-guru__lead li').nth(0)).toContainText('Wearing the mala since 1998');
  await expect(g.locator('.s-guru__lead li').nth(1)).toContainText('Wearing the mala since 1996');
  await expect(g.locator('.s-guru__lead img').nth(1)).toHaveAttribute('src', /\/media\/swamis\/rambabu\.jpg$/);
  await expect(g.locator('.s-swamys b')).toHaveText(['Mahesh Swamy', 'Anjineyulu Swamy']);
  await expect(g.locator('.s-swamys li').nth(0)).toContainText('Wearing the mala for 23 years');
  await expect(page.locator('body')).not.toContainText(/senior|priest/i);
});

test('sevas in order, padi pooja open, one open at a time, offered on WhatsApp and never "booked"', async ({ page }) => {
  await page.goto(URL);
  const acc = page.locator('#sevas .s-acc');
  await expect(acc.locator('.s-acc__name')).toContainText(['Maala dharana', 'Padi pooja', 'Neyyabhishekam', 'Pushpabhishekam', 'Annadanam']);
  await expect(acc.locator('.s-acc__panel:visible')).toHaveCount(1);
  await expect(acc.getByRole('link', { name: /Offer padi pooja on WhatsApp/ })).toBeVisible();
  await acc.getByRole('button', { name: /Annadanam/ }).click();
  await expect(acc.locator('.s-acc__panel:visible')).toHaveCount(1);
  await expect(acc.getByRole('link', { name: /Offer annadanam on WhatsApp/ })).toBeVisible();
  await expect(page.locator('#sevas').getByRole('link', { name: /Invite our swamys/ })).toHaveAttribute('href', /\/festivals\/#invite$/);
  await expect(page.locator('main')).not.toContainText(/\bbook/i);
});

test('take a moment: the eighteen steps go one at a time, in the chosen script only', async ({ page }) => {
  await page.goto(URL);
  const steps = page.locator('[data-steps]');
  await expect(steps.locator('[data-step-n]')).toHaveText('01');
  await expect(steps.locator('li[data-step]:visible')).toHaveCount(1);
  await expect(steps.locator('li[data-step]:visible')).toContainText('Eyes');
  await steps.getByRole('button', { name: 'Next step' }).click();
  await expect(steps.locator('[data-step-n]')).toHaveText('02');
  await expect(steps.locator('li[data-step]:visible')).toContainText('Ears');
  // switch to Telugu: the Telugu list, in its own order, and never both
  await page.locator('[data-script-toggle]').first().click();
  await expect(steps.locator('li[data-step]:visible')).toHaveCount(1);
  await expect(steps.locator('li[data-step]:visible')).toContainText('Anger');
  await expect(page.locator('[data-sc="kn"]:visible')).toHaveCount(0);
});

test('sharanu ghosha: a tap plays one call; Harivarasanam shows its first verse', async ({ page }) => {
  await page.addInitScript(() => {
    window.__played = [];
    // only sound counts: the silent opening clip is left out
    HTMLMediaElement.prototype.play = function () { if (!this.muted) window.__played.push(this.src); return Promise.resolve(); };
  });
  await page.goto(URL);
  await page.getByRole('tab', { name: 'Sharanu ghosha' }).click();
  const pane = page.locator('#pane-ghosha');
  await expect(pane).toBeVisible();
  await pane.getByRole('button', { name: /Call 1 of 5/ }).click();
  await expect.poll(() => page.evaluate(() => window.__played)).toEqual([expect.stringMatching(/\/media\/audio\/vili-0\.mp3$/)]);
  await expect(pane.getByRole('button')).toHaveText(/Call 2 of 5/);
  await pane.getByRole('button').click();
  await expect(pane.locator('[data-call-en]')).toHaveText('Harihara sudhane');
  await page.getByRole('tab', { name: 'Harivarasanam' }).click();
  await expect(page.locator('#pane-hari')).toContainText('harivarāsanaṃ viśvamōhanam');
  await expect(page.locator('#pane-hari').getByRole('link', { name: /Read all of Harivarasanam/ })).toHaveAttribute('href', /\/resources\/#harivarasanam$/);
});

test('visit: address, maps, WhatsApp, both pooja times; the footer links to the full website', async ({ page }) => {
  await page.goto(URL);
  const v = page.locator('#visit');
  await expect(v.locator('address')).toContainText('Kodati–Sulikunte Road');
  await expect(v.getByRole('link', { name: /Open in Google Maps/ })).toHaveAttribute('href', /^https:\/\/maps\.app\.goo\.gl\//);
  await expect(v.locator('.s-tt li')).toHaveText([/Morning pooja\s*5:00 am/, /Evening pooja\s*7:00 pm/]);
  await expect(page.getByRole('link', { name: 'See the full website with films and sound' })).toHaveAttribute('href', '/');
});

test('the full website is untouched: its home page still opens with the gate', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Enter quietly/i })).toBeVisible();
});

test.describe('on Android phones', () => {
  for (const width of [360, 412]) {
    test(`${width} px: nothing off screen, taps at least 44 px, the header stays usable`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(URL);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
      const small = await page.locator('main a:visible, main button:visible, header a:visible, header button:visible').evaluateAll((els) =>
        els.map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 30), h: r.height }; }).filter((x) => x.h < 44));
      expect(small).toEqual([]);
      await expect(page.locator('[data-script-toggle]')).toBeVisible();
      await page.locator('#sevas').scrollIntoViewIfNeeded();
      await expect(page.locator('.s-head')).toBeInViewport();
    });
  }
});
