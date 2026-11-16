// @ts-check
// Resources page: sharanu ghosha (108), ninaadalu, shlokas, Harivarasanam, the 18 steps, the deeksha.
// Every Kannada and Telugu line is a published text; only the chosen script is shown.
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

const KANNADA = /[ಀ-೿]/, TELUGU = /[ఀ-౿]/;
const useTelugu = (page) => page.addInitScript(() => { try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {} });

test('the page opens cleanly and lists its six parts', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/resources/');
  await expect(page.getByRole('heading', { level: 1, name: 'Resources' })).toBeVisible();
  const toc = page.locator('.rx-toc a');
  await expect(toc).toHaveText([/Sharanu ghosha/, /Ninaadalu/, /Shlokas/, /Harivarasanam/, /18 steps/, /Deeksha/]);
  for (const id of ['sharanu-ghosha', 'ninaadalu', 'shlokas', 'harivarasanam', 'steps', 'deeksha']) await expect(page.locator(`#${id}`)).toBeAttached();
  expect(errors).toEqual([]);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
});

test('sharanu ghosha: all 108 sharanams, numbered, as the source prints them', async ({ page }) => {
  await page.goto('/resources/');
  const names = page.locator('[data-names] li');
  await expect(names).toHaveCount(108);
  await expect(names.nth(0).locator('[data-sc="kn"]')).toHaveText('ಓಂ ಶ್ರೀ ಸ್ವಾಮಿನೇ ಶರಣಮಯ್ಯಪ್ಪ');
  await expect(names.nth(0).locator('.rx-en')).toHaveText('ōṃ śrī svāminē śaraṇamayyappa');
  await expect(names.nth(1).locator('[data-sc="kn"]')).toHaveText('ಹರಿ ಹರ ಸುತನೇ ಶರಣಮಯ್ಯಪ್ಪ');
  await expect(names.nth(107).locator('.rx-n')).toHaveText('108');
  await expect(names.nth(107).locator('[data-sc="kn"]')).toHaveText('ಓಂ ಹರಿಹರ ಸುತನೇ ಆನಂದಚಿತ್ತನ್ ಅಯ್ಯಪ್ಪ ಸ್ವಾಮಿನೇ ಶರಣಮಯ್ಯಪ್ಪ');
  // the source's own counting marks ("॥ 10 ॥") are not repeated: the numbers down the side do that
  await expect(page.locator('[data-names]')).not.toContainText('॥');
  // every tenth one is marked
  await expect(page.locator('[data-names] li[data-ten]')).toHaveCount(10);
});

test('with Telugu chosen the same 108 are in Telugu, and no Kannada letter is on screen', async ({ page }) => {
  await useTelugu(page);
  await page.goto('/resources/');
  const names = page.locator('[data-names] li');
  await expect(names.nth(0).locator('[data-sc="te"]')).toHaveText('ఓం శ్రీ స్వామినే శరణమయ్యప్ప');
  await expect(names.nth(0).locator('[data-sc="te"]')).toBeVisible();
  await expect(names.nth(0).locator('[data-sc="kn"]')).toBeHidden();
  const text = await page.locator('main').innerText();
  expect(text).toMatch(TELUGU);
  expect(text).not.toMatch(KANNADA);
});

test('with Kannada chosen no Telugu letter is on screen; the header switch changes it', async ({ page }) => {
  await page.goto('/resources/');
  expect(await page.locator('main').innerText()).not.toMatch(TELUGU);
  await page.getByRole('button', { name: 'Show Kannada or Telugu script' }).click();
  const text = await page.locator('main').innerText();
  expect(text).toMatch(TELUGU);
  expect(text).not.toMatch(KANNADA);
});

test('ninaadalu: each call has its answer beside it', async ({ page }) => {
  await page.goto('/resources/');
  const rows = page.locator('.rx-calls li');
  await expect(rows).toHaveCount(43);
  await expect(rows.nth(0).locator('.rx-call [data-sc="kn"]')).toHaveText('ಸ್ವಾಮಿ ಶರಣಂ');
  await expect(rows.nth(0).locator('.rx-answer [data-sc="kn"]')).toHaveText('ಅಯ್ಯಪ್ಪ ಶರಣಂ');
  await expect(rows.nth(10).locator('.rx-call .rx-en')).toHaveText('pallikaṭṭu');
  await expect(rows.nth(10).locator('.rx-answer .rx-en')).toHaveText('śabarimalakku');
  // call on the left, answer on the right, on the same line
  const c = await rows.nth(0).locator('.rx-call').boundingBox(), a = await rows.nth(0).locator('.rx-answer').boundingBox();
  expect(a.x).toBeGreaterThan(c.x + c.width - 1);
  expect(Math.abs(a.y - c.y)).toBeLessThan(2);
});

test('shlokas: Loka Veeram, the namaskara shlokas and the Ayyappa stotram, verse by verse', async ({ page }) => {
  await page.goto('/resources/');
  const loka = page.locator('#loka-veeram');
  await expect(loka.getByRole('heading', { name: 'Loka Veeram' })).toBeVisible();
  await expect(loka.locator('.rx-verses li').first()).toContainText('ಲೋಕವೀರಂ ಮಹಾಪೂಜ್ಯಂ ಸರ್ವರಕ್ಷಾಕರಂ ವಿಭುಮ್');
  await expect(loka.locator('.rx-verses li').first()).toContainText('lōkavīraṃ mahāpūjyaṃ');
  await expect(loka.locator('.rx-verses li .rx-n')).toHaveText(['1', '2', '3', '4', '5']);
  await expect(page.locator('#namaskara-shlokas .rx-verses li')).toHaveCount(4);
  await expect(page.locator('#namaskara-shlokas')).toContainText('ಭೂತನಾಥ ಸದಾನಂದ');
  await expect(page.locator('#ayyappa-stotram .rx-verses li').first()).toContainText('ಅರುಣೋದಯಸಂಕಾಶಂ');
});

test('Harivarasanam: eight verses and the closing sharanam', async ({ page }) => {
  await useTelugu(page);
  await page.goto('/resources/');
  const hari = page.locator('#harivarasanam');
  await expect(hari).toContainText('Sung at the end of the evening pooja.');
  await expect(hari.locator('.rx-verses li .rx-n')).toHaveText(['1', '2', '3', '4', '5', '6', '7', '8']);
  await expect(hari.locator('.rx-verses li').first()).toContainText('హరివరాసనం విశ్వమోహనం');
  await expect(hari.locator('.rx-verse--close')).toContainText('శరణం అయ్యప్పా స్వామి శరణం అయ్యప్పా');
});

test('the eighteen steps follow each language’s own list', async ({ page }) => {
  await page.goto('/resources/');
  const kn = page.locator('.rx-steps[data-sc="kn"]');
  await expect(kn.locator('.rx-steps__s')).toHaveCount(18);
  await expect(kn.locator('.rx-steps__s').first()).toContainText('ಕಣ್ಣು');
  await expect(kn.locator('.rx-steps__s').first()).toContainText('Eyes');
  await expect(page.locator('.rx-steps[data-sc="te"]')).toBeHidden();
  await page.getByRole('button', { name: 'Show Kannada or Telugu script' }).click();
  const te = page.locator('.rx-steps[data-sc="te"]');
  await expect(te.locator('.rx-steps__s').first()).toContainText('కామం');
  await expect(te.locator('.rx-steps__s').first()).toContainText('Desire');
  await expect(kn).toBeHidden();
});

test('every text names where it was published, with a link in the chosen language', async ({ page }) => {
  await page.goto('/resources/');
  const links = page.locator('.rx-src a:visible');
  await expect(links).toHaveCount(6);
  for (const l of await links.all()) await expect(l).toHaveAttribute('href', /^https:\/\/vignanam\.org\/kannada\//);
  await expect(page.locator('#sharanu-ghosha .rx-src a:visible')).toHaveAttribute('href', 'https://vignanam.org/kannada/ayyappa-saranu-ghosha.html');
  await expect(page.locator('.rx-note')).toContainText('A guruswamy will check the words before the site goes live.');
});

test('the deeksha link goes to the deeksha on the Events page', async ({ page }) => {
  await page.goto('/resources/');
  await page.getByRole('link', { name: 'Read about the deeksha' }).click();
  await expect(page).toHaveURL(/\/festivals\/#deeksha$/);
  await expect(page.getByRole('heading', { name: 'The 41-day deeksha' })).toBeVisible();
});

test('chant along: one sharanam at a time, counted to 108, with keys and Finish', async ({ page }) => {
  await page.goto('/resources/');
  const openBtn = page.getByRole('button', { name: 'Chant along, one by one' });
  await openBtn.click();
  const box = page.getByRole('dialog', { name: 'Sharanu ghosha' });
  await expect(box).toBeVisible();
  await expect(page.locator('[data-chant-n]')).toHaveText('1');
  await expect(page.locator('[data-chant-line] [data-sc="kn"]')).toHaveText('ಓಂ ಶ್ರೀ ಸ್ವಾಮಿನೇ ಶರಣಮಯ್ಯಪ್ಪ');
  await expect(page.locator('[data-chant-line] .rx-en')).toHaveText('ōṃ śrī svāminē śaraṇamayyappa');
  await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
  await expect(page.locator('html')).toHaveClass(/rx-chanting/);
  // tap the big area, press Next, use the arrow keys
  await page.locator('.rx-ch__stage').click();
  await expect(page.locator('[data-chant-n]')).toHaveText('2');
  await expect(page.locator('[data-chant-line] [data-sc="kn"]')).toHaveText('ಹರಿ ಹರ ಸುತನೇ ಶರಣಮಯ್ಯಪ್ಪ');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-chant-n]')).toHaveText('4');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-chant-n]')).toHaveText('3');
  // on to the last one
  for (let i = 3; i < 108; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-chant-n]')).toHaveText('108');
  await expect(page.locator('[data-chant-hint]')).toHaveText('Swamiye Sharanam Ayyappa');
  const finish = page.getByRole('button', { name: 'Finish' });
  await expect(finish).toBeVisible();
  // the bar is full
  expect(await page.locator('[data-chant-bar]').evaluate((el) => el.style.transform)).toBe('scaleX(1)');
  await finish.click();
  await expect(box).toBeHidden();
  await expect(page.locator('html')).not.toHaveClass(/rx-chanting/);
  await expect(openBtn).toBeFocused();
});

test('chant along follows the chosen script, keeps Tab inside, and Escape closes it', async ({ page }) => {
  await useTelugu(page);
  await page.goto('/resources/');
  await page.getByRole('button', { name: 'Chant along, one by one' }).click();
  await expect(page.locator('[data-chant-line] [data-sc="te"]')).toBeVisible();
  await expect(page.locator('[data-chant-line] [data-sc="te"]')).toHaveText('ఓం శ్రీ స్వామినే శరణమయ్యప్ప');
  await expect(page.locator('[data-chant-line] [data-sc="kn"]')).toBeHidden();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-chant]'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-chant]')).toBeHidden();
});

test('text size: A+ makes the lines larger, A− smaller, and the choice is remembered', async ({ page }) => {
  await page.goto('/resources/');
  const line = page.locator('[data-names] li').first().locator('.rx-sc');
  const px = () => line.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const start = await px();
  const smaller = page.getByRole('button', { name: 'Smaller text' }), larger = page.getByRole('button', { name: 'Larger text' });
  await expect(smaller).toBeDisabled();
  await larger.evaluate((b) => b.click());
  const mid = await px();
  expect(mid).toBeGreaterThan(start * 1.1);
  await larger.evaluate((b) => b.click());
  expect(await px()).toBeGreaterThan(mid * 1.1);
  await expect(larger).toBeDisabled();
  await page.reload();
  expect(await px()).toBeGreaterThan(mid * 1.1);
  await smaller.evaluate((b) => b.click());
  await smaller.evaluate((b) => b.click());
  expect(Math.abs((await px()) - start)).toBeLessThan(0.5);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
});

test('the bottom bar appears while reading, marks the part you are in, and jumps between parts', async ({ page }) => {
  await page.goto('/resources/');
  const bar = page.locator('[data-rx-bar]');
  await expect(bar).toHaveClass(/is-early/);
  const jump = (id) => page.evaluate((id) => {
    const y = document.getElementById(id).getBoundingClientRect().top + window.scrollY + 40;
    const lenis = window.__kodathi?.lenis?.();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
  }, id);
  await jump('ninaadalu');
  await expect(bar).not.toHaveClass(/is-early/);
  await expect(bar.locator('[data-tab="ninaadalu"]')).toHaveAttribute('aria-current', 'true');
  await expect(bar.locator('[aria-current="true"]')).toHaveCount(1);
  await bar.locator('[data-tab="harivarasanam"]').click();
  await expect(page.locator('#h-hari')).toBeInViewport();
  await expect(bar.locator('[data-tab="harivarasanam"]')).toHaveAttribute('aria-current', 'true');
});

test('the menu and the footer lead to Resources', async ({ page }) => {
  await page.goto('/visit/');
  await expect(page.locator('footer.foot').getByRole('link', { name: 'Resources' })).toHaveAttribute('href', /\/resources\/$/);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /Resources/ }).click();
  await expect(page).toHaveURL(/\/resources\/$/);
});

test.describe('on Android phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'phones only');
  for (const width of [360, 412]) {
    test(`${width} px: nothing off screen at the largest text, 44 px taps, and back closes the chant`, async ({ page }) => {
      await page.setViewportSize({ width, height: 740 });
      await page.addInitScript(() => { try { localStorage.setItem('kodathi-text', '2'); } catch (e) {} });
      await page.goto('/resources/');
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
      // no line of any text runs past the edge
      const wide = await page.evaluate((w) => [...document.querySelectorAll('.rx-sc, .rx-en')].filter((el) => el.getClientRects().length && el.getBoundingClientRect().right > w + 1).length, width);
      expect(wide).toBe(0);
      for (const b of await page.locator('.rx-bar__tabs a, .rx-bar__size button, .rx-toc a, [data-chant-open]').all()) {
        expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      // the whole chant screen fits: the line, Back and Next are all on screen
      await page.locator('[data-chant-open]').click();
      for (let i = 0; i < 4; i++) await page.locator('[data-chant-go]').click();   // the fifth is one of the longest
      await expect(page.locator('[data-chant-n]')).toHaveText('5');
      const line = await page.locator('[data-chant-line]').boundingBox();
      expect(line.x).toBeGreaterThanOrEqual(0);
      expect(line.x + line.width).toBeLessThanOrEqual(width);
      const next = await page.locator('[data-chant-go]').boundingBox();
      expect(next.y + next.height).toBeLessThanOrEqual(740);
      expect(next.height).toBeGreaterThanOrEqual(48);
      expect(line.y + line.height).toBeLessThanOrEqual(next.y);
      // the Android back button closes the chant and stays on the page
      await page.goBack();
      await expect(page.locator('[data-chant]')).toBeHidden();
      await expect(page).toHaveURL(/\/resources\/$/);
    });
  }
});
