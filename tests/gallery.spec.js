// @ts-check
import { test, expect } from '@playwright/test';
import { watchErrors, horizontalOverflow } from './helpers.js';

const PADI = '2026-11-12-padi-pooja-temple';
const KANNE = '2026-11-14-kanne-pooja-home';

test.describe('Gallery page', () => {
  test('albums are newest first, named as the temple named them, with counts', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/gallery/');
    await expect(page.getByRole('heading', { level: 1, name: 'Gallery' })).toBeVisible();
    const albums = page.locator('[data-album]');
    await expect(albums).toHaveCount(2);
    await expect(albums.nth(0)).toHaveAttribute('data-album', KANNE);
    await expect(albums.nth(0).locator('h2')).toHaveText('Kanne Pooja, Home');
    await expect(albums.nth(0)).toContainText('14-11-2026');
    await expect(albums.nth(0)).toContainText('4 photos');
    await expect(albums.nth(1).locator('h2')).toHaveText('Padi Pooja at Temple');
    await expect(albums.nth(1)).toContainText('12-11-2026');
    await expect(albums.nth(1)).toContainText('2 photos · 2 videos');
    await expect(page.locator('[data-gal-total]')).toHaveText('2 albums · 6 photos · 2 videos');
    // thumbnails load
    for (const img of await page.locator('.tile__btn img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('filters show one kind of pooja at a time', async ({ page }) => {
    await page.goto('/gallery/');
    const all = page.getByRole('button', { name: /^All/ });
    const padi = page.getByRole('button', { name: /^Padi pooja/ });
    const kanne = page.getByRole('button', { name: /^Kanne pooja/ });
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await padi.click();
    await expect(padi).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator(`[data-album="${PADI}"]`)).toBeVisible();
    await expect(page.locator(`[data-album="${KANNE}"]`)).toBeHidden();
    await kanne.click();
    await expect(page.locator(`[data-album="${PADI}"]`)).toBeHidden();
    await expect(page.locator(`[data-album="${KANNE}"]`)).toBeVisible();
    // the viewer only steps through what the filter shows
    await page.locator('[data-open]:visible').first().click();
    await expect(page.locator('[data-lb-n]')).toHaveText('1 of 4');
    await page.getByRole('button', { name: 'Close' }).click();
    await all.click();
    await expect(page.locator('[data-album]:visible')).toHaveCount(2);
  });

  test('the viewer opens full screen with the caption "Name | date", and steps with buttons and keys', async ({ page }) => {
    await page.goto('/gallery/');
    const tile = page.locator('[data-open="0"]');
    await tile.click();
    const lb = page.getByRole('dialog', { name: 'Kanne Pooja, Home | 14-11-2026' });
    await expect(lb).toBeVisible();
    await expect(page.locator('[data-lb-n]')).toHaveText('1 of 8');
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
    await expect(page.locator('[data-lb-n]')).toHaveText('2 of 8');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-lb-n]')).toHaveText('3 of 8');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    // wraps round to the last item, a video from the padi pooja
    await expect(page.locator('[data-lb-n]')).toHaveText('8 of 8');
    await expect(page.locator('[data-lb-cap]')).toHaveText('Padi Pooja at Temple | 12-11-2026');
    await expect(page.locator('video.lb__media')).toHaveAttribute('controls', '');
    await page.keyboard.press('Escape');
    await expect(lb).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/lb-open/);
    await expect(tile).toBeFocused();
    expect(new URL(page.url()).hash).toBe('');
  });

  test('Tab stays inside the viewer', async ({ page }) => {
    await page.goto('/gallery/');
    await page.locator('[data-open="0"]').click();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[data-lb]'))).toBe(true);
    }
  });

  test('a video plays in the viewer with its own sound', async ({ page }) => {
    await page.goto('/gallery/');
    await page.locator(`[data-album="${PADI}"] .tile--video button`).first().click();
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
    await page.locator('[data-open="1"]').click();
    await page.getByRole('button', { name: 'Share' }).click();
    const shared = await page.evaluate(() => window.__shared);
    expect(shared.title).toBe('Kanne Pooja, Home | 14-11-2026');
    expect(shared.url).toMatch(new RegExp(`/gallery/#${KANNE}/2$`));
  });

  test('without a share sheet, Share opens WhatsApp with the link', async ({ page, context }) => {
    await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined }); });
    await page.goto('/gallery/');
    await page.locator('[data-open="0"]').click();
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
    await page.locator('[data-open="4"]').click();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });
});

test.describe('Gallery on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch only');

  test('swipe left and right steps through, swipe down closes', async ({ page }) => {
    await page.goto('/gallery/');
    await page.locator('[data-open="0"]').click();
    const stage = page.locator('[data-lb-stage]');
    const b = await stage.boundingBox();
    const swipe = async (dx, dy) => {
      const x = b.x + b.width / 2, y = b.y + b.height / 3;
      await stage.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: x, clientY: y, isPrimary: true });
      await stage.dispatchEvent('pointerup', { pointerType: 'touch', clientX: x + dx, clientY: y + dy, isPrimary: true });
    };
    await swipe(-140, 6);
    await expect(page.locator('[data-lb-n]')).toHaveText('2 of 8');
    await swipe(140, -4);
    await expect(page.locator('[data-lb-n]')).toHaveText('1 of 8');
    // a small wobble is not a swipe
    await swipe(-20, 3);
    await expect(page.locator('[data-lb-n]')).toHaveText('1 of 8');
    await swipe(4, 160);
    await expect(page.locator('[data-lb]')).toBeHidden();
  });
});
