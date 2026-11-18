// Round 4, step 1: one regional script at a time, words from published sources,
// padi pooja off the daily schedule, maala dharana as each swamy's own 41 days,
// the now bar, coming up, the gallery albums, and the gate left as it was.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection, watchErrors } from './helpers.js';

const TELUGU = /[ఀ-౿]/;
const KANNADA = /[ಀ-೿]/;
const PAGES = ['/', '/gallery/', '/poojas/', '/festivals/', '/visit/'];

/** Everything a visitor can read: visible text, with the menu open so its labels count too. */
async function visibleText(page) {
  return page.evaluate(() => {
    const menu = document.querySelector('[data-menu]');
    menu?.removeAttribute('inert');
    menu?.classList.add('is-open');
    // the language switch names both scripts on purpose: it is how you choose
    const switches = [...document.querySelectorAll('[data-script-toggle], [data-language-choice]')];
    const styles = switches.map((el) => el.style.display);
    switches.forEach((el) => { el.style.display = 'none'; });
    const text = document.body.innerText;
    switches.forEach((el, i) => { el.style.display = styles[i]; });
    return text;
  });
}

for (const [lang, other, otherName] of [['kn', TELUGU, 'Telugu'], ['te', KANNADA, 'Kannada']]) {
  test(`with ${lang === 'kn' ? 'Kannada' : 'Telugu'} chosen, no ${otherName} letters are visible on any page`, async ({ page }) => {
    await page.addInitScript((l) => { try { localStorage.setItem('kodathi-script', l); } catch (e) {} }, lang);
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-script', lang);
      // the gate counts too: check it before entering
      if (path === '/') {
        await expect(page.locator('[data-preloader]')).toBeVisible();
        expect(await page.locator('[data-preloader]').innerText(), 'gate').not.toMatch(other);
        await enterQuietly(page);
      }
      const text = await visibleText(page);
      const hit = text.split('\n').find((l) => other.test(l));
      expect(hit, `${path}: "${hit}"`).toBeUndefined();
      expect(text, `${path} shows the chosen script`).toMatch(lang === 'kn' ? KANNADA : TELUGU);
    }
  });
}

test('the floating chorus words after a call use the chosen script only', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {}
    const drawn = [];
    window.__drawn = drawn;
    const orig = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { drawn.push(String(t)); return orig.call(this, t, ...r); };
  });
  await page.goto('/');
  await enterQuietly(page);
  await scrollToSection(page, 'vili', 0);
  const call = page.locator('[data-call]');
  await call.scrollIntoViewIfNeeded();
  await call.click();
  await expect(page.locator('[data-call-count]')).toHaveText(/The chorus answered/, { timeout: 9000 });
  const drawn = await page.evaluate(() => window.__drawn);
  expect(drawn.length).toBeGreaterThan(0);
  expect(drawn.some((t) => TELUGU_RE.test(t))).toBe(true);
  expect(drawn.some((t) => KANNADA_RE.test(t))).toBe(false);
});
const TELUGU_RE = TELUGU, KANNADA_RE = KANNADA;

test('the eighteen steps show the chosen language and its own list', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {} });
  await page.goto('/');
  await enterQuietly(page);
  const name = page.locator('[data-step-name] [data-sc="te"]');
  const en = page.locator('[data-step-en] [data-sc="te"]');
  await scrollToSection(page, 'climb', 0.12);
  await expect(name).toHaveText('కామం');
  await expect(en).toHaveText('Desire');
  await expect(page.locator('[data-step-grp] [data-sc="te"]')).toContainText('అరిషడ్వర్గములు');
  await scrollToSection(page, 'climb', 0.33);
  await expect(name).toHaveText(/నేత్రములు|చెవులు|నాసిక|జిహ్వ|స్పర్శ/);
  await scrollToSection(page, 'climb', 0.49);
  await expect(name).toHaveText('అవిద్య');
  await expect(page.locator('[data-step-name] [data-sc="kn"]')).toBeHidden();
});

test('padi pooja is not on the daily schedule anywhere', async ({ page }) => {
  await page.goto('/poojas/');
  await expect(page.locator('.tl')).toHaveCount(2);
  await expect(page.locator('.tl')).not.toContainText(['Padi pooja']);
  await expect(page.locator('.tl').first()).not.toContainText('Padi pooja');
  await expect(page.locator('.tl').last()).not.toContainText('Padi pooja');
  await page.goto('/');
  await enterQuietly(page);
  await expect(page.locator('[data-sched]')).not.toContainText('Padi pooja');
  await expect(page.locator('#coming')).toContainText('Thursday evenings');
  await page.goto('/visit/');
  await expect(page.locator('.hours')).toContainText('Thursday evenings at the temple, and at homes on request');
});

test('no Malayalam-only terms remain in what visitors read', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    if (path === '/') await enterQuietly(page);
    const text = await visibleText(page);
    for (const w of [/\bnada\b/i, /vratham/i, /\bvili\b/i, /mala dharanam/i, /kettunira/i, /mundu/i, /Malayalam calendar/i]) {
      expect(text, `${path} still says ${w}`).not.toMatch(w);
    }
  }
});

test.describe('maala dharana', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-15T10:00:00+05:30'));
    await page.goto('/');
    await enterQuietly(page);
    await scrollToSection(page, 'mala', 0);
  });

  test('your mala date gives your day of 41, and is remembered', async ({ page }) => {
    const input = page.getByLabel('The day you took the mala');
    await input.fill('2026-11-09');
    await input.dispatchEvent('change');
    await expect(page.locator('[data-vratham-txt]')).toHaveText('Day 7 of 41. Your 41 days complete on Saturday, 19 December.');
    await expect(page.locator('[data-beads] i.on')).toHaveCount(6);
    await expect(page.locator('[data-beads] i.today')).toHaveCount(1);
    await page.reload();
    await enterQuietly(page);
    await expect(page.getByLabel('The day you took the mala')).toHaveValue('2026-11-09');
    await expect(page.locator('[data-vratham-txt]')).toHaveText(/^Day 7 of 41\./);
  });

  test('today, a later date, and a completed deeksha', async ({ page }) => {
    const input = page.getByLabel('The day you took the mala');
    const txt = page.locator('[data-vratham-txt]');
    await input.fill('2026-11-15'); await input.dispatchEvent('change');
    await expect(txt).toHaveText(/^Day 1 of 41\./);
    await input.fill('2026-11-20'); await input.dispatchEvent('change');
    await expect(txt).toHaveText('That day is still to come. Enter the day you took the mala.');
    await input.fill('2026-10-06'); await input.dispatchEvent('change');
    await expect(txt).toHaveText('Today is day 41, the last day of your deeksha. Swamiye Sharanam Ayyappa.');
    await input.fill('2026-09-20'); await input.dispatchEvent('change');
    await expect(txt).toHaveText(/^Your 41 days completed on/);
  });
});

test('the now bar shows the status and the next pooja', async ({ page }) => {
  await page.goto('/?t=07:00');
  await enterQuietly(page);
  await scrollToSection(page, 'now', 0);
  await expect(page.locator('[data-now-status-text]')).toHaveText('The temple is open');
  await expect(page.locator('[data-now-next]')).toHaveText('Next: Evening pooja at 19:00, in 12 h 00 min');
  await expect(page.locator('#now').getByRole('link', { name: 'Directions' })).toHaveAttribute('href', /maps\.app\.goo\.gl/);
  await expect(page.locator('#now').getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
});

test('coming up lists maala dharana, padi pooja and the next three dated events', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-15T10:00:00+05:30'));
  await page.goto('/');
  await enterQuietly(page);
  await scrollToSection(page, 'coming', 0);
  const visible = page.locator('#coming .up__row:visible');
  await expect(visible).toHaveCount(5);
  // tomorrow's padi pooja at a swamy's home leads the list, highlighted
  await expect(visible.nth(0)).toContainText('Padi pooja at Mahesh Swamy’s home, Mullur');
  await expect(visible.nth(0)).toContainText('Tomorrow');
  await expect(visible.nth(0)).toHaveClass(/is-soon/);
  await expect(visible.nth(1)).toContainText('Going on');
  await expect(visible.nth(1)).toContainText('Maala dharana');
  await expect(visible.nth(2)).toContainText('Padi pooja');
  await expect(visible.nth(2)).not.toHaveClass(/is-soon/);
  // the Kudlu padi pooja (17-11-2026) comes next, then the Mandala pooja
  await expect(visible.nth(3)).toContainText('Padi pooja at Kudlu');
  await expect(visible.nth(3)).toContainText('In 2 days');
  await expect(visible.nth(4)).toContainText('Mandala pooja');
  await expect(visible.nth(4)).toContainText('In 42 days');
});

test('the Mullur padi pooja shows as Today on its day and is gone the day after', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-16T09:00:00+05:30'));
  await page.goto('/');
  await enterQuietly(page);
  const row = page.locator('#coming .up__row[data-up-padi][data-up-date="2026-11-16"]');
  await expect(row).toBeVisible();
  await expect(row).toContainText('Today');
  await expect(row).toContainText('Evening, at Mahesh Swamy’s home in Mullur.');
  await page.goto('/festivals/');
  const cal = page.locator('.cal__row', { hasText: 'Mahesh Swamy' });
  await expect(cal.locator('[data-in]')).toHaveText('Today');

  await page.clock.setFixedTime(new Date('2026-11-17T09:00:00+05:30'));
  await page.goto('/');
  await enterQuietly(page);
  await expect(page.locator('#coming .up__row[data-up-date="2026-11-16"]')).toBeHidden();
  // the next day's padi pooja at Kudlu is Today instead
  await expect(page.locator('#coming .up__row[data-up-date="2026-11-17"]')).toContainText('Today');
  await expect(page.locator('#coming .up__row:visible')).toHaveCount(5);
});

test('words the temple gave: Kannada for neyyabhishekam, annadanam, sharanu ghosha, Matha, Manikanta and kanne swamy', async ({ page }) => {
  await page.goto('/poojas/');
  for (const w of ['ನೆಯ್ಯಭಿಷೇಕ', 'ಅನ್ನದಾನ']) await expect(page.locator('main [data-sc="kn"]', { hasText: w }).first()).toBeAttached();
  await page.goto('/festivals/');
  for (const w of ['ಮಾತಾ', 'ಮಣಿಕಂಠ']) await expect(page.locator('.addr-terms [data-sc="kn"]', { hasText: w })).toBeVisible();
  await expect(page.locator('.kn-box .eyebrow-sc [data-sc="kn"]')).toHaveText('ಕನ್ನೆ ಸ್ವಾಮಿ');
  await page.addInitScript(() => { try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {} });
  await page.goto('/festivals/');
  await expect(page.locator('.kn-box .eyebrow-sc [data-sc="te"]')).toHaveText('కన్నె స్వాములు');
});

test('the gallery shows both albums with their names and dates, and no AI image', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await enterQuietly(page);
  const kanne = page.locator('[data-album="2026-11-14-kanne-pooja-home"]');
  const padi = page.locator('[data-album="2026-11-12-padi-pooja-temple"]');
  await expect(kanne.locator('h3')).toHaveText('Kanne Pooja, Home');
  await expect(kanne).toContainText('Saturday, 14 November 2026');
  await expect(kanne.locator('img')).toHaveCount(4);
  await expect(padi.locator('h3')).toHaveText('Padi Pooja at Temple');
  await expect(padi).toContainText('Thursday, 12 November 2026');
  await expect(padi.locator('img')).toHaveCount(2);
  await expect(padi.locator('video')).toHaveCount(2);
  // the AI pilgrim image is no longer among the temple's photos
  await expect(page.locator('#temple img[src*="pilgrim"]')).toHaveCount(0);
  for (const img of await page.locator('.gal img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
  }
  expect(errors, errors.join('\n')).toEqual([]);
});

test('the gate is unchanged: lamp, both entry buttons, then the site', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-pre-status]')).toHaveText('The lamp is lit', { timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Enter with sound' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter quietly' })).toBeVisible();
  await enterQuietly(page);
  await expect(page.locator('body')).not.toHaveClass(/is-gated/);
});


// ---- round 5 corrections ----
test('wording: no temple office, no "book", no "not every week", no Archana, Ucha pooja or prasadam names', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    if (path === '/') await enterQuietly(page);
    const text = await visibleText(page);
    for (const w of [/office/i, /\bbook\b/i, /not every week/i, /usually on a thursday/i, /archana/i, /ucha pooja/i, /aravana/i, /appam/i, /prathishta/i]) {
      expect(text, `${path} still says ${w}`).not.toMatch(w);
    }
  }
});

test('sevas: Maala dharana first, Padi pooja second, no Archana', async ({ page }) => {
  await page.goto('/poojas/');
  const names = await page.locator('.off h3').allInnerTexts();
  expect(names[0]).toBe('Maala dharana');
  expect(names[1]).toBe('Padi pooja');
  expect(names.join('|')).not.toMatch(/Archana/);
  await expect(page.getByRole('link', { name: 'Ask about Maala dharana on WhatsApp' })).toHaveAttribute('href', /wa\.me/);
  await expect(page.getByRole('link', { name: 'Offer Padi pooja on WhatsApp' })).toHaveAttribute('href', /wa\.me/);
});

test('daily poojas: morning at 5:00 and evening at 7:00 pm, open all day, with facilities for swamys', async ({ page }) => {
  await page.goto('/poojas/');
  await expect(page.locator('.tl__row')).toHaveCount(2);
  await expect(page.locator('.tl__row').first()).toContainText('5:00');
  await expect(page.locator('.tl__row').first()).toContainText('Morning pooja');
  await expect(page.locator('.tl__row').last()).toContainText('7:00');
  await expect(page.locator('.tl__row').last()).toContainText('Evening pooja');
  await page.goto('/visit/');
  await expect(page.locator('.hours')).toContainText('All day during the season');
  await expect(page.locator('main')).toContainText('Swamys can use the washrooms and bathing area, and sleep at the temple.');
  await expect(page.locator('main')).toContainText('Prasadam is given after the poojas. What is offered varies.');
});

test('a kanne swamy can see what to bring, and how swamys address each other', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {} });
  await page.goto('/');
  await enterQuietly(page);
  await scrollToSection(page, 'mala', 0);
  const kanne = page.locator('[data-kanne]');
  await kanne.locator('summary').click();
  await expect(kanne.locator('.kanne__list li')).toHaveCount(4);
  await expect(kanne).toContainText('kumkum, turmeric, sandal powder');
  await expect(kanne).not.toContainText(/banana|coconut|Khammam|Sastha/i);
  const ask = kanne.getByRole('link', { name: 'Ask the temple on WhatsApp' });
  await expect(ask).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
  expect(decodeURIComponent((await ask.getAttribute('href')).split('text=')[1])).toContain('taking the mala for the first time');
  const addr = page.locator('.mala__address');
  for (const w of ['Swamy', 'Matha', 'Manikanta', 'Malikapuram', 'మాత', 'మణికంఠ']) await expect(addr).toContainText(w);
  await page.goto('/festivals/');
  await expect(page.locator('.kn-box')).toContainText('What a kanne swamy brings');
  await expect(page.locator('.addr-terms li')).toHaveCount(4);
});

test('Our Guruswamys and Swamys: the Chief Guruswamy comes first, no priest', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  await expect(page.locator('#h-swamis')).toHaveText('Our Guruswamys and Swamys');
  const cards = page.locator('.swami');
  await expect(cards.first()).toContainText('Chief Guruswamy');
  await expect(cards.first()).toContainText('Wearing the mala since 1998');
  await expect(page.locator('#swamis')).not.toContainText(/priest/i);
});

test('the events list has no invented dates', async ({ page }) => {
  await page.goto('/festivals/');
  await expect(page.locator('.cal')).not.toContainText(/Prathishta|Panguni/);
});
