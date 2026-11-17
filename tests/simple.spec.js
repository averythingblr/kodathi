// @ts-check
// The simple site under /simple/: a calm, white website of eight pages for the same temple.
// No gate, no films, no sound until a tap. Same facts as the main site.
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

const PAGES = [
  ['/simple/', 'Ayyappa Swamy Temple, Kodathi', 'Home'],
  ['/simple/temple/', 'Our Temple', 'Our Temple'],
  ['/simple/poojas/', 'Poojas and Sevas', 'Poojas and Sevas'],
  ['/simple/events/', 'Events', 'Events'],
  ['/simple/maala-dharana/', 'Maala Dharana', 'Maala Dharana'],
  ['/simple/swamis/', 'Our Guruswamys and Swamys', 'Guruswamys'],
  ['/simple/gallery/', 'Gallery', 'Gallery'],
  ['/simple/visit/', 'Visit the temple', 'Visit'],
];

test.beforeEach(async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-11-17T09:00:00+05:30'));
});

test('it is a real website: eight pages, each with its own heading, and the menu marks where you are', async ({ page }) => {
  const errors = watchErrors(page);
  for (const [path, h1, label] of PAGES) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveText(h1);
    await expect(page.getByText('Enter with sound')).toHaveCount(0);
    const btn = page.getByRole('button', { name: 'Menu' });
    const menu = page.locator('[data-menu]');
    if (await btn.isVisible()) {
      await btn.click();
      await expect(menu.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
      await page.keyboard.press('Escape');
    } else {
      await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    }
  }
  expect(errors).toEqual([]);
});

test('the footer reaches every page and the full website', async ({ page }) => {
  await page.goto('/simple/');
  const foot = page.getByRole('navigation', { name: 'Footer' });
  await expect(foot.getByRole('link')).toHaveText(PAGES.map((p) => p[2]));
  await expect(page.getByRole('link', { name: 'See the full website with films and sound' })).toHaveAttribute('href', '/');
});

test('no sound plays by itself on any page', async ({ page }) => {
  await page.addInitScript(() => {
    window.__sounds = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { if (!this.muted) window.__sounds++; return play.call(this); };
    const A = window.AudioContext;
    window.AudioContext = class extends A { constructor(...a) { super(...a); window.__sounds++; } };
  });
  for (const [path] of PAGES) {
    await page.goto(path);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    expect(await page.evaluate(() => window.__sounds), path).toBe(0);
  }
});

test('home: the temple name, the road, both pooja times, and today’s padi pooja at Kudlu', async ({ page }) => {
  await page.goto('/simple/');
  await expect(page.locator('main')).toContainText('Kodati–Sulikunte Road, Bengaluru');
  await expect(page.locator('.s-times')).toContainText('5:00 am');
  await expect(page.locator('.s-times')).toContainText('7:00 pm');
  const next = page.locator('.s-ev:visible').first();
  await expect(next).toContainText('Padi pooja at Kudlu');
  await expect(next).toContainText('Today');
  await expect(page.locator('.s-ev:visible')).toHaveCount(3);
  await expect(page.locator('[data-note-text]')).toHaveText('Today: Padi pooja at Kudlu');
  await expect(page.locator('.s-circles h3')).toHaveText(['Padi pooja', 'Maala dharana', 'Our Guruswamys']);
});

test('the day after, Kudlu has gone and the strip is back to the chant', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-11-18T09:00:00+05:30'));
  await page.goto('/simple/');
  await expect(page.locator('.s-ev:visible').first()).toContainText('Mandala pooja');
  await expect(page.locator('[data-note-text]')).toHaveText('Swamiye Sharanam Ayyappa');
});

test('events: each one has its day, time and place, Directions and Add to calendar; the invite form is there', async ({ page }) => {
  await page.goto('/simple/events/');
  const rows = page.locator('.s-ev:visible');
  await expect(rows.first()).toContainText('6:00 pm');
  const mandala = page.locator('.s-ev', { hasText: 'Mandala pooja' });
  await expect(mandala).toContainText('At the temple');
  await expect(mandala.getByRole('link', { name: 'Add Mandala pooja to your calendar' })).toHaveAttribute('href', /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
  await expect(page.locator('.s-ev', { hasText: 'Ugadi' })).toContainText('All day');
  await expect(page.getByRole('heading', { name: 'Invite our swamys' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send the invitation on WhatsApp' })).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/\bbook/i);
});

test('on an iPhone, Add to calendar gives the calendar file', async ({ browser }) => {
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('/simple/events/');
  await expect(page.locator('.s-ev', { hasText: 'Mandala pooja' }).getByRole('link', { name: /to your calendar/ })).toHaveAttribute('href', '/cal/mandala-pooja.ics');
  await ctx.close();
});

test('poojas and sevas: the five sevas in order, each offered on WhatsApp; a tap plays one sharanu ghosha call', async ({ page }) => {
  await page.addInitScript(() => {
    window.__played = [];
    HTMLMediaElement.prototype.play = function () { if (!this.muted) window.__played.push(this.src); return Promise.resolve(); };
  });
  await page.goto('/simple/poojas/');
  await expect(page.locator('.s-sevas h3')).toContainText(['Maala dharana', 'Padi pooja', 'Neyyabhishekam', 'Pushpabhishekam', 'Annadanam']);
  await expect(page.getByRole('link', { name: 'Offer padi pooja on WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/919916714933\?text=/);
  await page.getByRole('button', { name: /Call 1/ }).click();
  await expect.poll(() => page.evaluate(() => window.__played)).toEqual([expect.stringMatching(/\/media\/audio\/vili-0\.mp3$/)]);
  await expect(page.getByRole('button', { name: /Call 2/ })).toBeVisible();
});

test('maala dharana: count your 41 days (remembered), what a kanne swamy brings, the four names, the steps', async ({ page }) => {
  await page.goto('/simple/maala-dharana/');
  const input = page.getByLabel('The day you took the mala');
  await input.fill('2026-11-09');
  await input.dispatchEvent('change');
  await expect(page.locator('[data-mala-txt]')).toContainText('Day 9 of 41');
  await expect(page.locator('[data-beads] rect.on')).toHaveCount(8);
  await page.reload();
  await expect(page.locator('[data-mala-txt]')).toContainText('Day 9 of 41');
  await expect(page.locator('.s-kanne b')).toHaveText(['Black clothes', 'Two malas and the mudra', 'Pooja samagri', 'On the day']);
  await expect(page.locator('.s-address b')).toHaveText(['Swamy', 'Matha', 'Manikanta', 'Malikapuram']);
  const steps = page.locator('[data-steps]');
  await expect(steps.locator('li[data-step]:visible')).toContainText('Eyes');
  await steps.getByRole('button', { name: 'Next step' }).click();
  await expect(steps.locator('li[data-step]:visible')).toContainText('Ears');
  // Telugu: its own list, and no Kannada left on screen
  await page.locator('[data-script-toggle]').click();
  await expect(steps.locator('li[data-step]:visible')).toContainText('Anger');
  await expect(page.locator('[data-sc="kn"]:visible')).toHaveCount(0);
});

test('guruswamys: Lokesh Reddy Swamy, then Anjineyulu Swamy; Rambabu and Mahesh Swamy are not shown; never "senior" or "priest"', async ({ page }) => {
  await page.goto('/simple/swamis/');
  await expect(page.locator('.s-people--lead b')).toHaveText(['Lokesh Reddy Swamy']);
  await expect(page.locator('.s-people--lead .s-role')).toHaveText(['Chief Guruswamy']);
  await expect(page.locator('.s-people--big b')).toHaveText(['Anjineyulu Swamy']);
  // his photo is about the size of the Chief Guruswamy's
  const a = await page.locator('.s-people--big img').first().boundingBox();
  const c = await page.locator('.s-people--lead img').first().boundingBox();
  expect(a.width / c.width).toBeGreaterThan(0.9);
  expect(a.width / c.width).toBeLessThan(1.1);
  await expect(page.locator('main')).not.toContainText(/Rambabu|Mahesh Swamy/);
  await expect(page.locator('body')).not.toContainText(/senior|priest/i);
});

test('gallery: every album, and a photo opens full screen; Android back closes it and stays on the page', async ({ page }) => {
  await page.goto('/simple/gallery/');
  await expect(page.locator('.s-album h2')).toHaveText(['Padi Pooja, Mahesh Swamy’s Home, Mullur', 'Kanne Pooja, Home', 'Padi Pooja at Temple']);
  await page.locator('[data-item][data-type="photo"]').first().click();
  const lb = page.locator('[data-lb]');
  await expect(lb).toBeVisible();
  await expect(lb.locator('img')).toHaveAttribute('src', /photo-2\.jpg$/);
  await lb.getByRole('button', { name: 'Next' }).click();
  await expect(lb.locator('img')).toHaveAttribute('src', /photo-4\.jpg$/);
  await page.goBack();
  await expect(lb).toBeHidden();
  await expect(page).toHaveURL(/\/simple\/gallery\/$/);
});

test('visit: the address, Google Maps and WhatsApp, the pooja times and what swamys have', async ({ page }) => {
  await page.goto('/simple/visit/');
  await expect(page.locator('address')).toContainText('Kodati–Sulikunte Road');
  await expect(page.getByRole('link', { name: 'Open in Google Maps' })).toHaveAttribute('href', /^https:\/\/maps\.app\.goo\.gl\//);
  await expect(page.locator('.s-facts li')).toHaveCount(4);
});

test('the full website is untouched: its home page still opens with the gate', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Enter quietly/i })).toBeVisible();
});

test.describe('on Android phones', () => {
  test('the menu opens full screen and the back button closes it without leaving the page', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 860 });
    await page.goto('/simple/poojas/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const menu = page.locator('[data-menu]');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link')).toHaveCount(11);
    await page.goBack();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/\/simple\/poojas\/$/);
    // a menu link goes to its page
    await page.getByRole('button', { name: 'Menu' }).click();
    await menu.getByRole('link', { name: 'Events', exact: true }).click();
    await expect(page).toHaveURL(/\/simple\/events\/$/);
  });

  for (const width of [360, 412]) {
    test(`${width} px: no page scrolls sideways and every tap is at least 44 px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const [path] of PAGES) {
        await page.goto(path);
        expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0);
        const small = await page.locator('main a:visible, main button:visible, header a:visible, header button:visible, footer a:visible').evaluateAll((els) =>
          els.filter((e) => e.getBoundingClientRect().height < 44).map((e) => (e.textContent || '').trim().slice(0, 30)));
        expect(small, path).toEqual([]);
      }
    });
  }
});

test('today’s event can be acted on: the strip links to it, and it has Directions, Add to calendar and Ask on WhatsApp', async ({ page }) => {
  await page.goto('/simple/');
  const strip = page.getByRole('link', { name: /Today: Padi pooja at Kudlu/ });
  await expect(strip).toHaveAttribute('href', '/simple/events/#padi-2026-11-17-kudlu');
  const today = page.locator('.s-ev.is-soon');
  await expect(today).toHaveCount(1);
  await expect(today.getByRole('link', { name: 'Directions to Kudlu' })).toHaveAttribute('href', 'https://maps.app.goo.gl/oinPCm499mcU5vAv5');
  await expect(today.getByRole('link', { name: /Add Padi pooja at Kudlu to your calendar/ })).toBeVisible();
  const ask = today.getByRole('link', { name: 'Ask about Padi pooja at Kudlu on WhatsApp' });
  expect(decodeURIComponent((await ask.getAttribute('href')).split('text=')[1])).toBe('Swamiye Sharanam. I would like to know more about: Padi pooja at Kudlu.');
  // its buttons are real buttons on a phone: 44 px and up
  for (const h of await today.locator('.s-ev__acts a').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) expect(h).toBeGreaterThanOrEqual(44);
  await strip.click();
  await expect(page).toHaveURL(/\/simple\/events\/#padi-2026-11-17-kudlu$/);
  await expect(page.locator('#padi-2026-11-17-kudlu')).toHaveClass(/is-open/);
  await expect(page.locator('#padi-2026-11-17-kudlu')).toBeInViewport();
});

test('the header and menu are the calm white ones, not dark', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 860 });
  await page.goto('/simple/');
  const bg = (sel) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await bg('.s-bar')).toMatch(/^rgba?\(255, 255, 255/);
  await page.getByRole('button', { name: 'Menu' }).click();
  expect(await bg('[data-menu]')).toBe('rgb(255, 255, 255)');
});

test('no page says photos or names are "to come"', async ({ page }) => {
  for (const path of ['/simple/swamis/', '/simple/temple/']) {
    await page.goto(path);
    await expect(page.locator('main'), path).not.toContainText('to come');
  }
});

test('home shows both pooja times right under the first buttons, each time kept on one line', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/simple/');
  const line = page.locator('.s-welcome__times');
  await expect(line).toHaveText('Morning pooja 5:00 am · Evening pooja 7:00 pm');
  // one line each: no taller than a line of this text
  for (const h of await line.locator('.s-nw').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e.parentElement).lineHeight)))) expect(h).toBeLessThan(1.5);
});

test('the guruswamy button says it opens WhatsApp', async ({ page }) => {
  for (const path of ['/simple/maala-dharana/', '/simple/swamis/']) {
    await page.goto(path);
    await expect(page.getByRole('link', { name: 'Message a guruswamy on WhatsApp' }).first(), path).toHaveAttribute('href', /^https:\/\/wa\.me\//);
    await expect(page.getByText('Speak to a guruswamy')).toHaveCount(0);
  }
});

test('visit: "Before you come" gives footwear, dress and photos', async ({ page }) => {
  await page.goto('/simple/visit/');
  const sec = page.locator('section', { has: page.getByRole('heading', { name: 'Before you come' }) });
  await expect(sec.locator('b')).toHaveText(['Footwear', 'Dress', 'Photos']);
  await expect(sec).toContainText('Leave footwear at the stand');
});

test('long text starts from the left; headings stay centred', async ({ page }) => {
  await page.goto('/simple/temple/');
  expect(await page.locator('.s-prose').evaluate((e) => getComputedStyle(e).textAlign)).toBe('start');
  expect(await page.getByRole('heading', { level: 1 }).evaluate((e) => getComputedStyle(e.parentElement).textAlign)).toBe('center');
});

test('gallery: photos are numbered within their own album', async ({ page }) => {
  await page.goto('/simple/gallery/');
  await page.locator('[id="2026-11-14-kanne-pooja-home"] [data-item]').first().click();
  await expect(page.locator('[data-lb-cap]')).toHaveText('Kanne Pooja, Home · 1 of 4');
});

test('on a 320 px phone the header keeps to one row: the name, the script switch and the menu icon', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/simple/');
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  await expect(page.locator('.s-brand small')).toBeHidden();
  const bar = await page.locator('.s-bar').boundingBox();
  expect(bar.height).toBeLessThan(80);
});

test('the mockups are gone', async ({ request }) => {
  for (let n = 1; n <= 5; n++) expect((await request.get(`/mockups/${n}/`)).status()).toBe(404);
});

test('call the temple: the same number as WhatsApp, with calling hours, on home, Visit and the menu', async ({ page }) => {
  await page.goto('/simple/');
  await expect(page.locator('main').getByRole('link', { name: 'Call the temple' })).toHaveAttribute('href', 'tel:+919916714933');
  await expect(page.locator('main')).toContainText('Calls 10:00 am to 4:00 pm');
  await page.goto('/simple/visit/');
  await expect(page.locator('main').getByRole('link', { name: 'Call the temple' })).toHaveAttribute('href', 'tel:+919916714933');
  await expect(page.locator('main')).toContainText('Calls 10:00 am to 4:00 pm');
  await page.setViewportSize({ width: 412, height: 860 });
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('[data-menu]').getByRole('link', { name: 'Call', exact: true })).toHaveAttribute('href', 'tel:+919916714933');
});
