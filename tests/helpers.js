// Shared helpers for the Kodathi temple site tests.

/** Collect console errors and uncaught exceptions for a page. */
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return errors;
}

/** Pass the opening screen without sound. */
export async function enterQuietly(page) {
  const btn = page.getByRole('button', { name: 'Enter quietly' });
  await btn.waitFor({ state: 'visible' });
  await btn.click();
  await page.locator('[data-preloader]').waitFor({ state: 'detached' });
}

/** Jump to a fraction of a section's scroll length, bypassing smooth-scroll easing. */
export async function scrollToSection(page, id, fraction = 0) {
  await page.evaluate(
    ([id, f]) => {
      const el = document.getElementById(id);
      const r = el.getBoundingClientRect();
      const y = r.top + window.scrollY + Math.max(0, r.height - window.innerHeight) * f;
      const lenis = window.__kodathi?.lenis?.();
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    },
    [id, fraction],
  );
  await page.waitForTimeout(400);
}

/** Width the document overflows the viewport by, in px. */
export async function horizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
