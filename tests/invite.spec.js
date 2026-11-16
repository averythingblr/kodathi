// @ts-check
// "Invite our swamys": an invitation the guruswamy confirms, sent as a WhatsApp message.
import { test, expect } from '@playwright/test';
import { enterQuietly, scrollToSection } from './helpers.js';

/** Fill the form and return the WhatsApp message it opens. */
async function send(page, context) {
  await context.route('https://wa.me/**', (r) => r.fulfill({ body: 'ok' }));
  const [popup] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: 'Send the invitation on WhatsApp' }).click()]);
  const url = new URL(popup.url());
  await popup.close();
  return { to: url.pathname, text: decodeURIComponent(url.searchParams.get('text') || '') };
}

test.describe('Invite our swamys', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-16T10:00:00+05:30'));
    await page.goto('/festivals/#invite');
  });

  test('a family invites the swamys home for padi pooja, with a second date and a map link', async ({ page, context }) => {
    const form = page.locator('[data-invite-form]');
    await expect(page.getByRole('heading', { name: 'Invite our swamys' })).toBeVisible();
    await form.getByLabel('Date', { exact: true }).fill('2026-11-26');
    await form.getByLabel(/Another date/).fill('2026-11-28');
    await form.getByLabel('Area or village').fill('Dommasandra');
    await form.getByLabel(/Map link/).fill('https://maps.app.goo.gl/abc');
    await form.getByLabel('Your name').fill('Ravi');
    await form.getByLabel('Phone').fill('98450 00000');
    await form.getByLabel(/Anything else/).fill('About 20 swamys, annadanam after');
    const { to, text } = await send(page, context);
    expect(to).toMatch(/^\/\d{10,}$/);
    expect(text.split('\n')).toEqual([
      'Swamiye Sharanam.',
      'I would like to invite the guruswamy and swamys for padi pooja at our home in Dommasandra.',
      'Date: Thursday, 26 November 2026, or Saturday, 28 November 2026',
      'Time: 7:00 pm',
      'Location: https://maps.app.goo.gl/abc',
      'Name: Ravi',
      'Phone: 98450 00000',
      'Note: About 20 swamys, annadanam after',
    ]);
  });

  test('another temple invites them for bhajana; the labels follow', async ({ page, context }) => {
    const form = page.locator('[data-invite-form]');
    await form.getByRole('radio', { name: 'A temple or sharanalayam' }).check();
    await form.getByRole('radio', { name: 'Bhajana' }).check();
    await expect(form.getByLabel('Temple, and its area')).toBeVisible();
    await form.getByLabel('Date', { exact: true }).fill('2026-12-05');
    await form.getByLabel('Time').fill('18:30');
    await form.getByLabel('Temple, and its area').fill('Sri Ayyappa Sharanalayam, Varthur');
    await form.getByLabel('Your name (organiser)').fill('Suresh');
    await form.getByLabel('Phone').fill('99000 00000');
    const { text } = await send(page, context);
    expect(text).toContain('I would like to invite the guruswamy and swamys for bhajana at Sri Ayyappa Sharanalayam, Varthur.');
    expect(text).toContain('Time: 6:30 pm');
    expect(text).not.toContain('Location:');
    expect(text).not.toContain('Note:');
  });

  test('missing details are named, and nothing opens until they are filled', async ({ page, context }) => {
    let opened = false;
    context.on('page', () => { opened = true; });
    await page.getByRole('button', { name: 'Send the invitation on WhatsApp' }).click();
    await expect(page.locator('[data-inv-err]')).toHaveText('Please add the date, the area, your name and your phone number.');
    await expect(page.locator('[data-invite-form]').getByLabel('Date', { exact: true })).toBeFocused();
    await page.waitForTimeout(300);
    expect(opened).toBe(false);
  });

  test('an evening already promised is shown, and picking it warns but still lets you ask', async ({ page }) => {
    await expect(page.locator('[data-taken-list]')).toContainText('Mahesh Swamy’s home, Mullur');
    const form = page.locator('[data-invite-form]');
    await form.getByLabel('Date', { exact: true }).fill('2026-11-16');
    await expect(page.locator('[data-inv-warn]')).toBeVisible();
    await expect(page.locator('[data-inv-warn]')).toContainText('already have a padi pooja that evening, at Mahesh Swamy’s home, Mullur');
    await form.getByLabel('Date', { exact: true }).fill('2026-11-19');
    await expect(page.locator('[data-inv-warn]')).toBeHidden();
  });

  test('past dates cannot be picked', async ({ page }) => {
    await expect(page.locator('[data-invite-form]').getByLabel('Date', { exact: true })).toHaveAttribute('min', '2026-11-16');
  });
});

test('once the promised evening has passed it leaves the list', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-18T10:00:00+05:30'));
  await page.goto('/festivals/#invite');
  await expect(page.locator('[data-taken-list]')).toHaveCount(0);
});

test('Coming up on the home page links to the invitation', async ({ page }) => {
  await page.goto('/');
  await enterQuietly(page);
  await scrollToSection(page, 'coming', 0);
  await page.getByRole('link', { name: 'Invite our swamys' }).click();
  await expect(page).toHaveURL(/\/festivals\/#invite$/);
  await expect(page.getByRole('heading', { name: 'Invite our swamys' })).toBeInViewport();
});
