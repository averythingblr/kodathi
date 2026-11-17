// @ts-check
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

const PADI = '2026-11-12-padi-pooja-temple';
const KANNE = '2026-11-14-kanne-pooja-home';
const MULLUR = '2026-11-16-padi-pooja-mullur';
const MULLUR_NAME = 'Padi Pooja, Mahesh Swamy’s Home, Mullur';
// item numbers in page order: Mullur 0–5 (videos), Kanne 6–9 (photos), Padi at temple 10–13
const K0 = 6, TOTAL = 14;

/** Bring a photo of an album on screen (they are stacked and peel away on scroll), then tap it. */
async function openItem(page, i) {
  const b = page.locator(`.tile [data-open="${i}"]`);
  await b.focus();
  await b.click();
}

test.describe('Gallery page', () => {
  test('albums are newest first, named as the temple named them, with counts', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/gallery/');
    await expect(page.getByRole('heading', { level: 1, name: 'Gallery' })).toBeVisible();
    const albums = page.locator('[data-album]');
    await expect(albums).toHaveCount(3);
    await expect(albums.nth(0)).toHaveAttribute('data-album', MULLUR);
    await expect(albums.nth(0).locator('h2')).toHaveText(MULLUR_NAME);
    await expect(albums.nth(0)).toContainText('16-11-2026');
    await expect(albums.nth(0)).toContainText('16 November 2026 · 6 videos');
    await expect(albums.nth(0)).not.toContainText('0 photos');
    await expect(albums.nth(1)).toHaveAttribute('data-album', KANNE);
    await expect(albums.nth(1).locator('h2')).toHaveText('Kanne Pooja, Home');
    await expect(albums.nth(1)).toContainText('14-11-2026');
    await expect(albums.nth(1)).toContainText('4 photos');
    await expect(albums.nth(2).locator('h2')).toHaveText('Padi Pooja at Temple');
    await expect(albums.nth(2)).toContainText('12-11-2026');
    await expect(albums.nth(2)).toContainText('2 photos · 2 videos');
    await expect(page.locator('[data-gal-total]')).toHaveText('3 albums · 6 photos · 8 videos');
    // thumbnails load
    for (const img of await page.locator('.tile__btn img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('the Mullur padi pooja album: six videos as the temple filmed them, each with its still', async ({ page }) => {
    // the fourth keeps only its upright first 12 seconds (a shared link opens straight on it)
    await page.goto(`/gallery/#${MULLUR}/4`);
    const v = page.locator('video.lb__media');
    await expect.poll(() => v.evaluate((el) => el.duration), { timeout: 10_000 }).toBeGreaterThan(11);
    expect(await v.evaluate((el) => el.duration)).toBeLessThan(13);
    expect(await v.evaluate((el) => el.videoHeight > el.videoWidth)).toBe(true);
    await expect(page.locator('[data-lb-cap]')).toHaveText(`${MULLUR_NAME} | 16-11-2026`);
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    const album = page.locator(`[data-album="${MULLUR}"]`);
    await expect(album.locator('.tile--video')).toHaveCount(6);
    await expect(album.locator('.tile--photo')).toHaveCount(0);
    for (const img of await album.locator('.tile__btn img').all()) {
      await expect(img).toHaveAttribute('src', /2026-11-16-padi-pooja-mullur\/video-\d\.jpg$/);
    }
  });

  test('with only a few albums there are no filter buttons to get in the way', async ({ page }) => {
    await page.goto('/gallery/');
    await expect(page.locator('[data-filter]')).toHaveCount(0);
    await expect(page.locator('[data-album]:visible')).toHaveCount(3);
  });

  test('the viewer opens full screen with the caption "Name | date", and steps with buttons and keys', async ({ page }) => {
    await page.goto('/gallery/');
    const tile = page.locator(`.tile [data-open="${K0}"]`);
    await tile.focus();
    await tile.click();
    const lb = page.getByRole('dialog', { name: 'Kanne Pooja, Home | 14-11-2026' });
    await expect(lb).toBeVisible();
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0 + 1} of ${TOTAL}`);
    const img = page.locator('.lb__media');
    await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
    // the whole photo fits on screen
    const box = await img.boundingBox();
    const vp = page.viewportSize();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
    // focus moves into the viewer, the page behind does not scroll
    await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
    await expect(page.locator('html')).toHaveClass(/lb-open/);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0 + 2} of ${TOTAL}`);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0 + 3} of ${TOTAL}`);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    // back past the start of the album, into the newest album's last video
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0} of ${TOTAL}`);
    await expect(page.locator('[data-lb-cap]')).toHaveText(`${MULLUR_NAME} | 16-11-2026`);
    await expect(page.locator('video.lb__media')).toHaveAttribute('controls', '');
    await page.keyboard.press('Escape');
    await expect(lb).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/lb-open/);
    await expect(tile).toBeFocused();
    expect(new URL(page.url()).hash).toBe('');
  });

  test('Tab stays inside the viewer', async ({ page }) => {
    await page.goto('/gallery/');
    await openItem(page, 0);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[data-lb]'))).toBe(true);
    }
  });

  test('a video plays in the viewer with its own sound', async ({ page }) => {
    await page.goto('/gallery/');
    const vid = page.locator(`[data-album="${PADI}"] .tile--video button`).first();
    await vid.focus();
    await vid.click();
    const v = page.locator('video.lb__media');
    await expect(v).toBeVisible();
    await expect.poll(() => v.evaluate((el) => el.readyState >= 2 && !el.paused), { timeout: 10_000 }).toBe(true);
    expect(await v.evaluate((el) => el.muted)).toBe(false);
    const el = await v.elementHandle();
    await page.getByRole('button', { name: 'Next' }).click();
    // leaving the video stops it and takes it off the page
    expect(await el.evaluate((e) => e.paused && !e.isConnected)).toBe(true);
  });

  test('every item has a link of its own that opens straight on it', async ({ page }) => {
    await page.goto(`/gallery/#${PADI}/2`);
    await expect(page.locator('[data-lb]')).toBeVisible();
    await expect(page.locator('[data-lb-cap]')).toHaveText('Padi Pooja at Temple | 12-11-2026');
    await expect(page.locator('[data-lb-alt]')).toContainText('Looking up the lit steps');
    await page.getByRole('button', { name: 'Next' }).click();
    expect(new URL(page.url()).hash).toBe(`#${PADI}/3`);
  });

  test('Share sends the photo’s link', async ({ page }) => {
    await page.addInitScript(() => {
      // record what would go to the share sheet
      // @ts-ignore
      navigator.share = (d) => { window.__shared = d; return Promise.resolve(); };
    });
    await page.goto('/gallery/');
    await openItem(page, K0 + 1);
    await page.getByRole('button', { name: 'Share' }).click();
    const shared = await page.evaluate(() => window.__shared);
    expect(shared.title).toBe('Kanne Pooja, Home | 14-11-2026');
    expect(shared.url).toMatch(new RegExp(`/gallery/#${KANNE}/2$`));
  });

  test('without a share sheet, Share opens WhatsApp with the link', async ({ page, context }) => {
    await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined }); });
    await page.goto('/gallery/');
    await openItem(page, K0);
    await context.route('https://wa.me/**', (r) => r.fulfill({ body: 'ok' }));
    const [popup] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: 'Share' }).click()]);
    const text = decodeURIComponent(new URL(popup.url()).searchParams.get('text') || '');
    expect(text).toContain('Kanne Pooja, Home | 14-11-2026');
    expect(text).toContain(`/gallery/#${KANNE}/1`);
  });

  test('regional album names follow the selected script only', async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('kodathi-script', 'te'); } catch (e) {} });
    await page.goto('/gallery/');
    const sc = page.locator(`[data-album="${PADI}"] .alb__sc`);
    await expect(sc.locator('[data-sc="te"]')).toBeVisible();
    await expect(sc.locator('[data-sc="te"]')).toHaveText('ఆలయంలో పడిపూజ');
    await expect(sc.locator('[data-sc="kn"]')).toBeHidden();
    await page.getByRole('button', { name: 'Show Kannada or Telugu script' }).click();
    await expect(sc.locator('[data-sc="kn"]')).toHaveText('ದೇವಸ್ಥಾನದಲ್ಲಿ ಪಡಿಪೂಜೆ');
    await expect(sc.locator('[data-sc="te"]')).toBeHidden();
    await expect(page.locator(`[data-album="${KANNE}"] .alb__sc [data-sc="kn"]`)).toHaveText('ಮನೆಯಲ್ಲಿ ಕನ್ನೆ ಪೂಜೆ');
  });

  test('menu, footer and the home page link to the gallery', async ({ page }) => {
    await page.goto('/visit/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Gallery' }).click();
    await expect(page).toHaveURL(/\/gallery\/$/);
    await expect(page.locator('footer.foot').getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', /\/gallery\/$/);
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Open the gallery' })).toHaveAttribute('href', /\/gallery\/$/);
  });

  test('no sideways scroll, with or without the viewer', async ({ page }) => {
    await page.goto('/gallery/');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    await openItem(page, 4);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });
});

test.describe('Gallery on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch only');

  test('swipe left and right steps through, swipe down closes', async ({ page }) => {
    await page.goto('/gallery/');
    await openItem(page, K0);
    const stage = page.locator('[data-lb-stage]');
    const b = await stage.boundingBox();
    const swipe = async (dx, dy) => {
      const x = b.x + b.width / 2, y = b.y + b.height / 3;
      await stage.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: x, clientY: y, isPrimary: true });
      await stage.dispatchEvent('pointerup', { pointerType: 'touch', clientX: x + dx, clientY: y + dy, isPrimary: true });
    };
    await swipe(-140, 6);
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0 + 2} of ${TOTAL}`);
    await swipe(140, -4);
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0 + 1} of ${TOTAL}`);
    // a small wobble is not a swipe
    await swipe(-20, 3);
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0 + 1} of ${TOTAL}`);
    await swipe(4, 160);
    await expect(page.locator('[data-lb]')).toBeHidden();
  });
});

test.describe('Gallery motion (phones first)', () => {
  test('one photo holds the middle of the screen and each album’s photo slides up over the last', async ({ page }) => {
    await page.goto('/gallery/');
    const rows = page.locator('[data-ix]');
    await expect(rows).toHaveCount(3);
    const at = (f) => page.evaluate((f) => {
      const el = document.querySelector('[data-gx-index]');
      const y = el.getBoundingClientRect().top + window.scrollY + (el.offsetHeight - window.innerHeight) * f;
      const lenis = window.__kodathi?.lenis?.();
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    }, f);
    const clip = (n) => rows.nth(n).locator('[data-ix-card]').evaluate((c) => c.style.clipPath);
    await at(0);
    await expect(rows.nth(0)).toHaveClass(/is-on/);
    // the second album's photo is still wholly below the frame; its caption is not shown
    expect(await clip(1)).toContain('100%');
    await expect(rows.nth(1).locator('.gx-list__cap')).toHaveCSS('opacity', '0');
    // both photos share one frame in the middle of the screen
    const a = await rows.nth(0).locator('[data-ix-card]').boundingBox();
    const b = await rows.nth(1).locator('[data-ix-card]').boundingBox();
    expect(Math.abs(a.x - b.x) + Math.abs(a.y - b.y)).toBeLessThan(2);
    const vp = page.viewportSize();
    expect(Math.abs(a.x + a.width / 2 - vp.width / 2)).toBeLessThan(3);
    // a quarter of the way, the second photo covers half the frame
    await at(0.25);
    await expect.poll(() => clip(1)).toMatch(/inset\((4|5)\d(\.\d+)?%/);
    // at the end it has taken the frame, and its small caption names the album
    await at(1);
    await expect(rows.nth(2)).toHaveClass(/is-on/);
    await expect(rows.nth(0)).not.toHaveClass(/is-on/);
    // fully up (allowing for a fraction of a pixel of rounding)
    await expect.poll(() => clip(2)).toMatch(/^$|^inset\(0(\.\d+)?%/);
    await expect(page.locator('[data-ix-bg="2026-11-12-padi-pooja-temple"]')).toHaveClass(/is-on/);
    await expect(rows.nth(2).locator('.gx-list__cap')).toContainText('Padi Pooja at Temple');
    await expect(rows.nth(2).locator('.gx-list__cap')).toContainText('12-11-2026 · 2 photos · 2 videos');
    // there are no giant names: the caption is small
    const size = await rows.nth(2).locator('.gx-list__t').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeLessThanOrEqual(44);
    // tapping the photo goes to that album
    await rows.nth(2).locator('[data-ix-card]').click();
    await expect(page.locator('#album-2026-11-12-padi-pooja-temple')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test('each album fills the screen and its photos peel away as you scroll, with pills and a counter', async ({ page }) => {
    await page.goto('/gallery/');
    const album = page.locator(`[data-album="${KANNE}"]`);
    await expect(album.locator('.alb__pills i')).toHaveCount(4);
    const at = (f) => page.evaluate(([id, f]) => {
      const el = document.getElementById(id);
      const y = el.getBoundingClientRect().top + window.scrollY + (el.offsetHeight - window.innerHeight) * f;
      const lenis = window.__kodathi?.lenis?.();
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    }, [`album-${KANNE}`, f]);
    await at(0);
    await expect(album.locator('[data-rail-n]')).toHaveText('01 / 04');
    await expect(album.locator('.alb__pills i.is-on')).toHaveCount(1);
    // the album's name stays readable on screen the whole way
    await expect(album.getByRole('heading', { name: 'Kanne Pooja, Home' })).toBeInViewport();
    await at(1);
    await expect(album.locator('[data-rail-n]')).toHaveText('04 / 04');
    await expect(album.locator('.alb__pills i').nth(3)).toHaveClass(/is-on/);
    // the first photo has peeled fully away, the last is whole
    expect(await album.locator('.tile').first().evaluate((t) => t.style.clipPath)).toContain('100%');
    expect(await album.locator('.tile').last().evaluate((t) => t.style.clipPath)).toBe('');
    // "Open" opens the photo that is on screen
    await album.getByRole('button', { name: /^Open the photo on screen/ }).click();
    await expect(page.locator('[data-lb-n]')).toHaveText(`${K0 + 4} of ${TOTAL}`);
    await page.getByRole('button', { name: 'Close' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });

  test('the page opens on the pooja film inside the word Gallery; "Watch with sound" plays the full video', async ({ page }) => {
    await page.goto('/gallery/');
    const film = page.locator('[data-gx-video]');
    await expect(film).toHaveAttribute('poster', /loop-1\.jpg$/);
    await expect.poll(() => film.evaluate((v) => v.muted && v.loop && /loop-1\.mp4$/.test(v.currentSrc || v.src))).toBe(true);
    await expect(page.locator('.gx-hero__mask')).toHaveCSS('mix-blend-mode', 'multiply');
    // scroll through the letters: the film fills the screen and is named
    await page.evaluate(() => {
      const el = document.querySelector('[data-gx-hero]');
      const y = el.offsetHeight - window.innerHeight;
      const lenis = window.__kodathi?.lenis?.();
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });
    await expect(page.locator('[data-gx-end]')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-gx-end]')).toContainText(`${MULLUR_NAME} | 16-11-2026`);
    await page.getByRole('button', { name: /^Watch with sound/ }).click();
    await expect(page.locator('[data-lb-cap]')).toHaveText(`${MULLUR_NAME} | 16-11-2026`);
    await expect(page.locator('video.lb__media')).toBeVisible();
  });

  test('on data saver the opening film stays a still picture', async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(navigator, 'connection', { value: { saveData: true } }); });
    await page.goto('/gallery/');
    await expect(page.locator('[data-gx-video]')).not.toHaveAttribute('src', /.+/);
  });

  test('the quiet screens say what is in the gallery and where to send photos', async ({ page }) => {
    await page.goto('/gallery/');
    await expect(page.locator('.gx-say__big')).toHaveText(/Padi poojas\.\s*Kanne poojas\./);
    // no festival album yet, so festivals are not claimed
    await expect(page.locator('.gx-say__big')).not.toContainText('Festivals');
    const send = page.getByRole('link', { name: 'Send on WhatsApp' });
    await expect(send).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
    const box = await send.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('with reduced motion everything is shown at once, without scroll effects', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 412, height: 915 }, isMobile: true });
    const page = await ctx.newPage();
    await page.goto('/gallery/');
    await expect(page.locator('[data-gx-hero]')).toHaveClass(/is-static/);
    await expect(page.locator('[data-gx-end]')).toHaveCSS('opacity', '1');
    // albums are plain grids: every photo is laid out, nothing is stacked or pinned
    await expect(page.locator('html')).not.toHaveClass(/gx-motion/);
    const first = await page.locator('.tile').nth(0).boundingBox();
    const second = await page.locator('.tile').nth(1).boundingBox();
    expect(second.x).toBeGreaterThan(first.x + first.width - 1);
    await page.locator('.tile [data-open="1"]').click();
    await expect(page.locator('[data-lb-n]')).toHaveText(`2 of ${TOTAL}`);
    await ctx.close();
  });
});
