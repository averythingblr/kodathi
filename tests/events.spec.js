// @ts-check
// Events page: padi pooja block, start times, Add to calendar, Directions.
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

const MULLUR = 'Padi pooja at Mahesh Swamy’s home, Mullur';
const row = (page, text) => page.locator('.cal__row', { hasText: text });
const gcal = async (link) => new URL(await link.getAttribute('href'));

test.beforeEach(async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-11-16T10:00:00+05:30'));
});

test('padi pooja is explained once: Thursday evenings at the temple and at homes, when someone offers it', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/festivals/');
  const box = page.locator('.thu');
  await expect(box.getByRole('heading', { name: 'Padi pooja' })).toBeVisible();
  await expect(box).toContainText('On Thursday evenings at the temple, and at homes on request.');
  await expect(box).toContainText('when someone offers it');
  // never "book", never "usually" or "not every week"
  await expect(box).not.toContainText(/book|usually|every week/i);
  const offer = box.getByRole('link', { name: 'Offer padi pooja on WhatsApp' });
  await expect(offer).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
  expect(decodeURIComponent((await offer.getAttribute('href')).split('text=')[1])).toBe('Swamiye Sharanam. I would like to offer padi pooja.');
  // the second button goes to the invitation form further down
  await box.getByRole('link', { name: 'Invite our swamys to your home' }).click();
  await expect(page.locator('#invite')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('the home padi pooja and the festivals show their day and the 6:00 pm start the temple gave', async ({ page }) => {
  await page.goto('/festivals/');
  await expect(row(page, 'Mahesh Swamy').locator('.cal__w')).toHaveText('Monday, 6:00 pm');
  await expect(row(page, 'Mandala pooja').locator('.cal__w')).toHaveText('Sunday, 6:00 pm');
  await expect(row(page, 'Makara Jyothi').locator('.cal__w')).toHaveText('Thursday, 6:00 pm');
  // Ugadi has no time from the temple yet, so none is shown
  await expect(row(page, 'Ugadi').locator('.cal__w')).toHaveText('Wednesday');
  // the dates are confirmed: the "being confirmed" note is gone
  await expect(page.locator('main')).not.toContainText('Dates are being confirmed');
});

test('Add to calendar opens Google Calendar with the name, 6:00 pm IST, the place and the map link', async ({ page }) => {
  await page.goto('/festivals/');
  const link = row(page, 'Mahesh Swamy').getByRole('link', { name: `Add ${MULLUR} to your calendar` });
  await expect(link).toHaveText('Add to calendar');
  await expect(link).toHaveAttribute('target', '_blank');
  const u = await gcal(link);
  expect(u.origin + u.pathname).toBe('https://calendar.google.com/calendar/render');
  expect(u.searchParams.get('action')).toBe('TEMPLATE');
  expect(u.searchParams.get('text')).toBe(MULLUR);
  // 6:00 pm in India is 12:30 UTC; a padi pooja lasts three hours
  expect(u.searchParams.get('dates')).toBe('20261116T123000Z/20261116T153000Z');
  expect(u.searchParams.get('ctz')).toBe('Asia/Kolkata');
  expect(u.searchParams.get('location')).toBe('Mahesh Swamy’s home, Mullur');
  expect(u.searchParams.get('details')).toContain('https://maps.app.goo.gl/ojYMhbLgjpkRx9qNA');
});

test('festivals go into the calendar at the temple; one without a time is an all-day entry', async ({ page }) => {
  await page.goto('/festivals/');
  const mandala = await gcal(row(page, 'Mandala pooja').locator('.cal__add'));
  expect(mandala.searchParams.get('text')).toBe('Mandala pooja');
  expect(mandala.searchParams.get('dates')).toBe('20261227T123000Z/20261227T143000Z');
  expect(mandala.searchParams.get('location')).toContain('Kodati–Sulikunte Road');
  const ugadi = await gcal(row(page, 'Ugadi').locator('.cal__add'));
  expect(ugadi.searchParams.get('dates')).toBe('20270407/20270408');
  expect(ugadi.searchParams.get('ctz')).toBeNull();
});

test('every dated event has Add to calendar and Directions; maala dharana, which is going on, has neither', async ({ page }) => {
  await page.goto('/festivals/');
  for (const name of ['Mahesh Swamy', 'Mandala pooja', 'Makara Jyothi', 'Ugadi']) {
    await expect(row(page, name).locator('.cal__add'), name).toHaveCount(1);
    await expect(row(page, name).locator('.cal__map'), name).toHaveCount(1);
  }
  await expect(row(page, 'Mandala pooja').getByRole('link', { name: 'Directions to the temple' })).toHaveAttribute('href', /^https:\/\/maps\.app\.goo\.gl\//);
  const mala = row(page, 'Maala dharana');
  await expect(mala.locator('[data-in]')).toHaveText('Going on');
  await expect(mala.locator('.cal__add, .cal__map')).toHaveCount(0);
});

test('a calendar file exists for each event, for iPhones and other calendars', async ({ page, request }) => {
  const res = await request.get('/cal/padi-2026-11-16-mullur.ics');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain('BEGIN:VEVENT');
  expect(text).toContain('DTSTART:20261116T123000Z');
  expect(text).toContain('DTEND:20261116T153000Z');
  expect(text).toContain('SUMMARY:Padi pooja at Mahesh Swamy’s home\\, Mullur');
  expect(text).toContain('LOCATION:Mahesh Swamy’s home\\, Mullur');
  const ugadi = await (await request.get('/cal/ugadi.ics')).text();
  expect(ugadi).toContain('DTSTART;VALUE=DATE:20270407');
  await page.goto('/festivals/');
  await expect(row(page, 'Mahesh Swamy').locator('.cal__add')).toHaveAttribute('data-ics', '/cal/padi-2026-11-16-mullur.ics');
});

test('on an iPhone, Add to calendar gives the calendar file instead', async ({ browser }) => {
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('/festivals/');
  await expect(page.locator('.cal__row', { hasText: 'Mandala pooja' }).locator('.cal__add')).toHaveAttribute('href', '/cal/mandala-pooja.ics');
  await ctx.close();
});

test('the day after, the home padi pooja has dropped off the list; festivals remain', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-17T09:00:00+05:30'));
  await page.goto('/festivals/');
  await expect(row(page, 'Mahesh Swamy')).toBeHidden();
  await expect(row(page, 'Mandala pooja')).toBeVisible();
  await expect(row(page, 'Mandala pooja').locator('[data-in]')).toHaveText('In 40 days');
});

test('the regional name of each event follows the chosen script only', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {} });
  await page.goto('/festivals/');
  const sc = row(page, 'Mandala pooja').locator('.cal__sc');
  await expect(sc.locator('[data-sc="te"]')).toHaveText('మండలపూజ');
  await expect(sc.locator('[data-sc="kn"]')).toBeHidden();
  await expect(page.locator('.thu [data-sc="te"]')).toHaveText('పడిపూజ');
  await expect(page.locator('.thu [data-sc="kn"]')).toBeHidden();
});

test.describe('on Android phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'phones only');
  for (const width of [360, 412]) {
    test(`${width} px: the buttons are full 44 px taps, side by side or stacked, nothing off screen`, async ({ page }) => {
      await page.setViewportSize({ width, height: 740 });
      await page.goto('/festivals/');
      for (const b of await page.locator('.cal__add, .cal__map, .thu__cta .btn').all()) {
        const box = await b.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      // the two buttons of an event do not overlap
      const add = await row(page, 'Mahesh Swamy').locator('.cal__add').boundingBox();
      const dir = await row(page, 'Mahesh Swamy').locator('.cal__map').boundingBox();
      expect(add.x + add.width <= dir.x || add.y + add.height <= dir.y).toBe(true);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    });
  }
});

test('a home padi pooja without a host name shows only the place: Kudlu, today at 6:00 pm, with Directions', async ({ page, request }) => {
  await page.clock.setSystemTime(new Date('2026-11-17T09:00:00+05:30'));
  await page.goto('/festivals/');
  const r = row(page, 'Padi pooja at Kudlu');
  await expect(r).toBeVisible();
  await expect(r.locator('.cal__w')).toHaveText('Tuesday, 6:00 pm');
  await expect(r).not.toContainText(/undefined|’s home/);
  await expect(r.locator('.cal__map')).toHaveAttribute('href', 'https://maps.app.goo.gl/oinPCm499mcU5vAv5');
  const ics = await (await request.get('/cal/padi-2026-11-17-kudlu.ics')).text();
  expect(ics).toContain('SUMMARY:Padi pooja at Kudlu');
  expect(ics).toContain('LOCATION:Kudlu');
  expect(ics).toContain('DTSTART:20261117T123000Z');
  // the home page shows it too
  await page.goto('/');
  await expect(page.locator('body')).toContainText('Padi pooja at Kudlu');
  await expect(page.locator('body')).not.toContainText('undefined');
});
