// Phone-first language checks. The language chooser intentionally names all three languages.
import { test, expect, devices } from '@playwright/test';
import { translate, textInLanguage, languagePath } from '../src/i18n/index.ts';
import { en } from '../src/i18n/en.ts';

const simple = ['', 'temple/', 'poojas/', 'events/', 'maala-dharana/', 'swamis/', 'gallery/', 'visit/'];
const grand = ['', 'poojas/', 'festivals/', 'swamis/', 'gallery/', 'resources/', 'visit/'];
const variants = [
  ...simple.flatMap((page) => ['en', 'kn', 'te'].map((lang) => ({ site: 'simple', page, lang, path: `/simple/${lang === 'en' ? '' : lang + '/'}${page}` }))),
  ...grand.flatMap((page) => ['en', 'kn', 'te'].map((lang) => ({ site: 'grand', page, lang, path: `/${lang === 'en' ? '' : lang + '/'}${page}` }))),
];
const words = {
  en: { menu: 'Menu', close: 'Close', date: 'Date', name: 'Your name', send: 'Send the invitation on WhatsApp' },
  kn: { menu: 'ಮೆನು', close: 'ಮುಚ್ಚಿ', date: 'ದಿನಾಂಕ', name: 'ನಿಮ್ಮ ಹೆಸರು', send: 'ಆಹ್ವಾನವನ್ನು ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಕಳಿಸಿ' },
  te: { menu: 'మెనూ', close: 'మూసివేయండి', date: 'తేదీ', name: 'మీ పేరు', send: 'ఆహ్వానాన్ని వాట్సాప్‌లో పంపండి' },
};
async function enterQuietly(page) {
  const gate = page.locator('[data-enter="quiet"]');
  if (await gate.count()) { await gate.click(); await expect(page.locator('[data-preloader]')).toHaveCount(0); }
}
async function wrongScript(page, lang) {
  return page.evaluate((lang) => {
    const wrong = lang === 'te' ? /[\u0C80-\u0CFF]/ : /[\u0C00-\u0C7F]/;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const found = [];
    while (walker.nextNode()) {
      const node = walker.currentNode, el = node.parentElement;
      if (!el || el.closest('[data-language-choice],[data-script-toggle],script,style')) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      if (el.checkVisibility() && range.getBoundingClientRect().height && wrong.test(node.textContent || '')) found.push(node.textContent);
    }
    return found;
  }, lang);
}

test('missing and empty lines fall back to English, with values kept', () => {
  const key = Object.keys(en).find((key) => en[key].text === 'Day {n} of {total}');
  expect(translate(key, 'kn', { n: 9, total: 41 }, {})).toBe('Day 9 of 41');
  expect(translate(key, 'te', { n: 9, total: 41 }, { [key]: { text: '' } })).toBe('Day 9 of 41');
  expect(textInLanguage('A new line awaiting translation', 'kn')).toBe('A new line awaiting translation');
  expect(languagePath('/simple/kn/events/#invite', 'te')).toBe('/simple/te/events/#invite');
});

test.describe('a devotee on an Android phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'The page matrix runs once on the Pixel 7 project.');
  test.beforeEach(async ({ page }) => {
    await page.clock.setSystemTime(new Date('2026-11-17T09:00:00+05:30'));
  });

  for (const variant of variants) {
    test(`${variant.path} opens in ${variant.lang}, keeps one script, and fits every phone width`, async ({ page }, testInfo) => {
      const errors = [];
      await page.addInitScript(() => {
        window.__automaticSounds = 0;
        const play = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () { if (!this.muted) window.__automaticSounds++; return play.call(this); };
      });
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
      await page.goto(variant.path);
      await enterQuietly(page);
      await expect(page.locator('html')).toHaveAttribute('lang', variant.lang);
      await expect(page.locator('h1').first()).not.toBeEmpty();
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(new URL(canonical).pathname).toBe(variant.path);
      if (variant.lang !== 'en') expect(await wrongScript(page, variant.lang)).toEqual([]);
      for (const width of [360, 412, devices['Pixel 7'].viewport.width]) {
        await page.setViewportSize({ width, height: 850 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), { message: `${variant.path} at ${width}` }).toBeLessThanOrEqual(width);
      }
      const smallTargets = await page.evaluate(() => [...document.querySelectorAll('a,button,input:not([type="radio"]),textarea,select,summary')].filter((el) => el.checkVisibility() && !el.closest('[data-preloader]')).map((el) => ({ text: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 50), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height })).filter((el) => el.w < 43.9 || el.h < 43.9));
      expect(smallTargets).toEqual([]);
      if (variant.lang !== 'en') {
        const englishButtons = await page.locator('button:visible').evaluateAll((buttons) => buttons.filter((b) => !b.closest('[data-script-toggle]')).map((b) => b.textContent || '').filter((s) => /[a-z]{2}/i.test(s)));
        expect(englishButtons).toEqual([]);
      }
      // Screenshots include every page in every language at 360 px, 412 px and the Pixel 7 width.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await enterQuietly(page);
      for (const width of [...new Set([360, 412, devices['Pixel 7'].viewport.width])]) {
        await page.setViewportSize({ width, height: 850 });
        await page.evaluate(async () => { await document.fonts.ready; for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 15)); } scrollTo(0, 0); });
        if (variant.site === 'grand' && !variant.page) {
          const header = await page.locator('.head').boundingBox();
          const openingWords = await page.locator('#nada .kicker').boundingBox();
          expect(openingWords.y, 'The opening words stay below the language header').toBeGreaterThanOrEqual(header.height);
        }
        await page.screenshot({ path: testInfo.outputPath(`${variant.site}-${variant.page.replaceAll('/', '') || 'home'}-${variant.lang}-${width}.png`), fullPage: true, scale: 'css' });
      }
      expect(errors).toEqual([]);
      expect(await page.evaluate(() => window.__automaticSounds)).toBe(0);
    });
  }

  for (const site of ['simple', 'grand']) for (const lang of ['en', 'kn', 'te']) {
    const root = site === 'simple' ? '/simple/' : '/';
    const prefix = root + (lang === 'en' ? '' : lang + '/');
    test(`${site} ${lang}: the menu uses the chosen language and Android back closes it`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(prefix + 'poojas/');
      await expect(page.locator('[data-menu-open]')).toHaveText(words[lang].menu);
      await page.locator('[data-menu-open]').click();
      const menu = page.locator('[data-menu]');
      await expect(menu).toBeVisible();
      await expect(menu.locator('[data-menu-close]')).toHaveText(words[lang].close);
      await expect(menu.locator('[data-language]')).toHaveCount(3);
      for (const link of await menu.locator('a[href^="/"]:not([data-language])').all()) expect(await link.getAttribute('href')).toMatch(new RegExp('^' + prefix));
      if (lang !== 'en') expect(await wrongScript(page, lang)).toEqual([]);
      await page.goBack();
      await expect(menu).toBeHidden();
      await expect(page).toHaveURL(new RegExp(prefix + 'poojas/$'));
    });
    test(`${site} ${lang}: the photo viewer is translated and Android back closes it`, async ({ page }) => {
      await page.goto(prefix + 'gallery/');
      const opener = site === 'simple' ? page.locator('[data-item][data-type="photo"]').first() : page.locator('[data-open]').filter({ has: page.locator('img') }).first();
      await opener.scrollIntoViewIfNeeded(); await opener.click();
      await expect(page.locator('[data-lb]')).toBeVisible();
      await expect(page.locator('[data-lb-close]')).toHaveText(words[lang].close);
      if (lang !== 'en') expect(await wrongScript(page, lang)).toEqual([]);
      await page.goBack(); await expect(page.locator('[data-lb]')).toBeHidden();
      await expect(page).toHaveURL(new RegExp(prefix + 'gallery/$'));
    });
    test(`${site} ${lang}: form labels, errors and the invitation use the page language`, async ({ page }) => {
      await page.goto(prefix + (site === 'simple' ? 'events/' : 'festivals/') + '#invite');
      const form = page.locator('[data-invite-form]');
      await expect(form.locator('input[name="date"]')).toHaveAccessibleName(words[lang].date);
      await expect(form.locator('input[name="name"]')).toHaveAccessibleName(words[lang].name);
      await form.locator('button[type="submit"]').click();
      const error = form.locator('[data-inv-err]');
      await expect(error).not.toBeEmpty();
      if (lang !== 'en') expect(await wrongScript(page, lang)).toEqual([]);
      await form.locator('input[name="date"]').fill('2026-12-10');
      await form.locator('input[name="place"]').fill('Mullur');
      await form.locator('input[name="name"]').fill('Test devotee');
      await form.locator('input[name="phone"]').fill('9999999999');
      await page.evaluate(() => { window.open = (url) => { window.__invitation = String(url); return null; }; });
      await form.locator('button[type="submit"]').click();
      const url = new URL(await page.evaluate(() => window.__invitation));
      expect(url.pathname).toBe('/919916714933');
      const message = url.searchParams.get('text');
      expect(message).toContain('Mullur'); expect(message).toContain('Test devotee'); expect(message).toContain('9999999999');
      if (lang !== 'en') { expect(message).not.toContain('I would like'); expect(message).toMatch(lang === 'kn' ? /[\u0C80-\u0CFF]/ : /[\u0C00-\u0C7F]/); }
    });
  }

  test('the explicit language changes the address, survives reload and keeps the page on navigation', async ({ page }) => {
    await page.goto('/simple/poojas/');
    await page.locator('.s-bar [data-language="kn"]').click();
    await expect(page).toHaveURL('/simple/kn/poojas/');
    expect(await page.evaluate(() => localStorage.getItem('kodathi-script'))).toBe('kn');
    await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'kn');
    await page.locator('.s-bar [data-language="te"]').click();
    await expect(page).toHaveURL('/simple/te/poojas/');
    expect(await page.evaluate(() => localStorage.getItem('kodathi-script'))).toBe('te');
    await page.locator('[data-menu-open]').click();
    await page.locator('[data-menu] a[href="/simple/te/visit/"]').click();
    await expect(page).toHaveURL('/simple/te/visit/');
    await page.locator('.s-bar [data-language="en"]').click();
    await expect(page).toHaveURL('/simple/visit/');
    expect(await page.evaluate(() => localStorage.getItem('kodathi-script'))).toBe('en');
    await page.goto('/simple/kn/visit/'); await expect(page.locator('html')).toHaveAttribute('lang', 'kn');
  });

  for (const site of ['simple', 'grand']) for (const lang of ['kn','te']) {
    test(`${site} ${lang}: the 41-day counter talks in the chosen language`, async ({ page }) => {
      await page.goto(site === 'simple' ? `/simple/${lang}/maala-dharana/` : `/${lang}/`);
      await enterQuietly(page);
      await page.locator('[data-mala-date]').fill('2026-11-09');
      await page.locator('[data-mala-date]').dispatchEvent('change');
      const text = page.locator(site === 'simple' ? '[data-mala-txt]' : '[data-vratham-txt]');
      await expect(text).toContainText('9'); await expect(text).not.toContainText('Day');
      expect(await wrongScript(page, lang)).toEqual([]);
    });
  }
});
