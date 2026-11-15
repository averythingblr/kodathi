// The sharanam call button, in detail: which recording plays on each press, what the
// page shows, when the chorus answers, and how it copes with fast taps, the keyboard,
// the language switch, slow audio and reduced motion.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection, watchErrors } from './helpers.js';

const LINES = [
  { en: 'Swamiye', kn: 'ಸ್ವಾಮಿಯೇ', te: 'స్వామియే', answerAt: 3.3 },
  { en: 'Harihara sudhane', kn: 'ಹರಿಹರ ಸುತನೇ', te: 'హరిహర సుతనే', answerAt: 3.2 },
  { en: 'Kannimoola Ganapathi Bhagavane', kn: 'ಕನ್ನಿಮೂಲ ಗಣಪತಿ ಭಗವಾನನೇ', te: 'కన్నిమూల గణపతి భగవానే', answerAt: 3.85 },
  { en: 'Pathinettam padiye', kn: 'ಪದಿನೆಟ್ಟಾಂ ಪಡಿಯೇ', te: 'పదునెట్టాం పడియే', answerAt: 3.8 },
  { en: 'Sabarigiri vasane', kn: 'ಶಬರಿಗಿರಿ ವಾಸನೇ', te: 'శబరిగిరి వాసనే', answerAt: 3.95 },
];

// Record every decoded buffer (tagged with the file it came from), every clip that starts
// and stops, and every gain change, so the test can see what was actually played.
const instrument = () => {
  const log = { starts: [], stops: [], gains: [] };
  window.__audioLog = log;
  const urlOf = new WeakMap();
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const res = await origFetch(...args);
    const url = String(args[0]);
    const origAB = res.arrayBuffer.bind(res);
    res.arrayBuffer = async () => { const ab = await origAB(); urlOf.set(ab, url); return ab; };
    return res;
  };
  const origDecode = BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData = function (ab, ...rest) {
    const url = urlOf.get(ab);
    return origDecode.call(this, ab, ...rest).then((buf) => { buf.__name = (url || '').split('/').pop(); return buf; });
  };
  const origStart = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    const ctx = this.context;
    const entry = { name: this.buffer?.__name, at: ctx.currentTime, wall: performance.now(), dur: this.buffer?.duration, stoppedAt: null };
    log.starts.push(entry);
    this.addEventListener('ended', () => { if (entry.stoppedAt === null) entry.stoppedAt = ctx.currentTime; });
    this.__entry = entry;
    return origStart.apply(this, a);
  };
  const origStop = AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.stop = function (when, ...a) {
    log.stops.push({ name: this.buffer?.__name, at: this.context.currentTime, when: when ?? this.context.currentTime });
    if (this.__entry) this.__entry.stopCalled = when ?? this.context.currentTime;
    return origStop.call(this, when, ...a);
  };
  const origTarget = AudioParam.prototype.setTargetAtTime;
  AudioParam.prototype.setTargetAtTime = function (v, t, c) {
    log.gains.push({ v, wall: performance.now() });
    return origTarget.call(this, v, t, c);
  };
};

const viliStarts = (page) => page.evaluate(() => window.__audioLog.starts.filter((s) => /^vili-\d\.mp3$/.test(s.name || '')).map((s) => ({ ...s })));

async function openVili(page, { script } = {}) {
  await page.addInitScript(instrument);
  if (script) await page.addInitScript((s) => { try { localStorage.setItem('kodathi-script', s); } catch (e) {} }, script);
  await page.goto('/');
  await enterQuietly(page);
  await scrollToSection(page, 'vili', 0);
  const call = page.locator('[data-call]');
  await call.scrollIntoViewIfNeeded();
  return call;
}

/** Press Call and wait until the chorus has answered and the button is ready again. */
async function callAndWaitForAnswer(page, call, n) {
  await call.click();
  await expect(page.locator('[data-call-count]')).toHaveText(n === 1 ? /The chorus answered/ : new RegExp(`called ${n} times`), { timeout: 9000 });
  await expect(call).not.toHaveClass(/is-calling/, { timeout: 4000 });
}

test.describe('sharanam call button', () => {
  test.describe.configure({ timeout: 120_000 });

  test('each press calls the next name with its own recording, and the sixth wraps to the first', async ({ page }) => {
    const errors = watchErrors(page);
    const call = await openVili(page);
    const next = page.locator('[data-call-next]');
    const en = page.locator('[data-call-text] [lang="en"]');
    const kn = page.locator('[data-call-text] [data-sc="kn"]');
    await expect(next).toHaveText(LINES[0].en);

    for (let n = 1; n <= 6; n++) {
      const line = LINES[(n - 1) % 5];
      await callAndWaitForAnswer(page, call, n);
      await expect(en).toHaveText(line.en);
      await expect(kn).toHaveText(line.kn);
      await expect(next).toHaveText(LINES[n % 5].en);
    }
    const starts = await viliStarts(page);
    expect(starts.map((s) => s.name)).toEqual(['vili-0.mp3', 'vili-1.mp3', 'vili-2.mp3', 'vili-3.mp3', 'vili-4.mp3', 'vili-0.mp3']);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the chorus text appears when the recorded chorus comes in', async ({ page }) => {
    const call = await openVili(page);
    const ans = page.locator('[data-answer-text]');
    for (const [n, line] of LINES.slice(0, 3).entries()) {
      // watch every frame for the moment the chorus text becomes visible
      await ans.evaluate((el) => {
        window.__shownAt = null;
        const tick = () => { if (Number(getComputedStyle(el).opacity) > 0.4) window.__shownAt = performance.now(); else requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
      await call.click();
      await expect.poll(() => page.evaluate(() => window.__shownAt), { timeout: 9000, intervals: [100] }).not.toBeNull();
      const shownAt = await page.evaluate(() => window.__shownAt);
      await expect.poll(() => ans.evaluate((el) => Number(getComputedStyle(el).opacity)), { timeout: 6000, intervals: [100] }).toBeLessThan(0.1);
      const s = (await viliStarts(page))[n];
      const lag = (shownAt - s.wall) / 1000;
      expect(lag, `${line.en}: chorus text ${lag.toFixed(2)}s after the clip started, recording answers at ${line.answerAt}s`).toBeGreaterThan(line.answerAt - 0.15);
      expect(lag).toBeLessThan(line.answerAt + 0.9);
      await expect(call).not.toHaveClass(/is-calling/, { timeout: 4000 });
    }
  });

  test('a new call never plays over the previous recording', async ({ page }) => {
    const call = await openVili(page);
    await callAndWaitForAnswer(page, call, 1);
    await callAndWaitForAnswer(page, call, 2);
    await callAndWaitForAnswer(page, call, 3);
    const starts = await viliStarts(page);
    for (let i = 1; i < starts.length; i++) {
      const prev = starts[i - 1];
      const prevEnd = Math.min(prev.at + prev.dur, prev.stopCalled ?? Infinity, prev.stoppedAt ?? Infinity);
      // allow a short fade (0.35s) while the old voice is let go
      expect(prevEnd, `${prev.name} still sounding ${(prevEnd - starts[i].at).toFixed(2)}s into ${starts[i].name}`).toBeLessThanOrEqual(starts[i].at + 0.35);
    }
  });

  test('tapping fast does not skip names or start several voices', async ({ page }) => {
    const call = await openVili(page);
    for (let i = 0; i < 5; i++) await call.click({ delay: 0 });
    await expect(page.locator('[data-call-count]')).toHaveText(/The chorus answered/, { timeout: 9000 });
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText(LINES[0].en);
    await expect(page.locator('[data-call-next]')).toHaveText(LINES[1].en);
    expect((await viliStarts(page)).map((s) => s.name)).toEqual(['vili-0.mp3']);
    await expect(call).not.toHaveClass(/is-calling/, { timeout: 4000 });
    await callAndWaitForAnswer(page, call, 2);
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText(LINES[1].en);
  });

  test('the background chant dips for the call and comes back after the chorus', async ({ page }) => {
    const call = await openVili(page);
    await call.click();
    await expect(page.locator('[data-sound-toggle]').first()).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => window.__audioLog.gains.some((g) => g.v === 0.08)), { timeout: 6000 }).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__audioLog.gains.some((g) => g.v === 0.55)), { timeout: 12000 }).toBe(true);
    const order = await page.evaluate(() => window.__audioLog.gains.filter((g) => g.v === 0.08 || g.v === 0.55).map((g) => g.v));
    expect(order.indexOf(0.08)).toBeLessThan(order.lastIndexOf(0.55));
  });

  test('works from the keyboard with Enter and Space', async ({ page }) => {
    const call = await openVili(page);
    await call.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-call-count]')).toHaveText(/The chorus answered/, { timeout: 9000 });
    await expect(call).not.toHaveClass(/is-calling/, { timeout: 4000 });
    await page.keyboard.press('Space');
    await expect(page.locator('[data-call-count]')).toHaveText(/called 2 times/, { timeout: 9000 });
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText(LINES[1].en);
  });

  test('with Telugu chosen, the call shows Telugu only, and switching mid-way follows the switch', async ({ page }) => {
    const call = await openVili(page, { script: 'te' });
    await callAndWaitForAnswer(page, call, 1);
    const te = page.locator('[data-call-text] [data-sc="te"]');
    const kn = page.locator('[data-call-text] [data-sc="kn"]');
    await expect(te).toBeVisible();
    await expect(te).toHaveText(LINES[0].te);
    await expect(kn).toBeHidden();
    await page.evaluate(() => document.querySelector('[data-script-toggle]').click());
    await expect(page.locator('html')).toHaveAttribute('data-script', 'kn');
    await callAndWaitForAnswer(page, call, 2);
    await expect(kn).toBeVisible();
    await expect(kn).toHaveText(LINES[1].kn);
    await expect(te).toBeHidden();
  });

  test('a slow recording does not freeze the button or break the order', async ({ page }) => {
    const errors = watchErrors(page);
    await page.route('**/media/audio/vili-1.mp3', async (route) => { await new Promise((r) => setTimeout(r, 4500)); await route.continue(); });
    const call = await openVili(page);
    await callAndWaitForAnswer(page, call, 1);
    await callAndWaitForAnswer(page, call, 2); // vili-1 is still loading: text and chorus still move on
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText(LINES[1].en);
    await callAndWaitForAnswer(page, call, 3);
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText(LINES[2].en);
    const names = (await viliStarts(page)).map((s) => s.name);
    expect(names).toContain('vili-0.mp3');
    expect(names).toContain('vili-2.mp3');
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('turning sound off stops the voice that is playing', async ({ page }) => {
    const call = await openVili(page);
    await call.click();
    await expect.poll(async () => (await viliStarts(page)).length, { timeout: 6000 }).toBe(1);
    await page.waitForTimeout(800);
    await page.evaluate(() => document.querySelector('[data-sound-toggle]').click());
    await expect(page.locator('[data-sound-toggle]').first()).toHaveAttribute('aria-pressed', 'false');
    // master gain falls to 0 within about a second
    await expect.poll(() => page.evaluate(() => window.__audioLog.gains.some((g) => g.v === 0)), { timeout: 3000 }).toBe(true);
  });
});

test.describe('sharanam call button, reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('calls and answers without animation', async ({ page }) => {
    test.setTimeout(60_000);
    const call = await openVili(page);
    await callAndWaitForAnswer(page, call, 1);
    await expect(page.locator('[data-answer-text]')).toHaveCSS('opacity', '1');
    await callAndWaitForAnswer(page, call, 2);
    await expect(page.locator('[data-call-text] [lang="en"]')).toHaveText(LINES[1].en);
  });
});
