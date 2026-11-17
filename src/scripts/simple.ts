// The simple site: small, plain scripts. No smooth-scroll library, no sound until a visitor taps.
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const base = (document.body.dataset.base || '/').replace(/\/?$/, '/');
const DAY = 86400000;
const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()); // YYYY-MM-DD
const at = (d: string) => new Date(d + 'T00:00:00+05:30').getTime();
const daysTo = (d: string) => Math.round((at(d) - at(istToday())) / DAY);

/* An overlay that the Android back button closes, instead of leaving the page. */
function backClosable(dlg: HTMLDialogElement, key: string) {
  const open = () => {
    if (dlg.open) return;
    dlg.showModal();
    history.pushState({ ...(history.state || {}), [key]: true }, '');
  };
  const close = () => { if (history.state?.[key]) history.back(); else dlg.close(); };
  window.addEventListener('popstate', () => { if (dlg.open) dlg.close(); });
  // Escape closes the dialog natively; keep history in step
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  return { open, close };
}

/* ---------- Kannada or Telugu, remembered (shared with the main site) ---------- */
$$<HTMLButtonElement>('[data-script-toggle]').forEach((b) => {
  b.addEventListener('click', () => {
    const next = document.documentElement.dataset.script === 'te' ? 'kn' : 'te';
    document.documentElement.dataset.script = next;
    try { localStorage.setItem('kodathi-script', next); } catch { /* storage blocked */ }
  });
});

/* ---------- the menu ---------- */
(function menu() {
  const dlg = $<HTMLDialogElement>('[data-menu]');
  if (!dlg) return;
  const m = backClosable(dlg, 'menu');
  $('[data-menu-open]')?.addEventListener('click', m.open);
  $('[data-menu-close]', dlg)?.addEventListener('click', m.close);
  // a link to another page: let the browser go there; to this page: just close
  $$<HTMLAnchorElement>('a', dlg).forEach((a) => a.addEventListener('click', () => { if (a.getAttribute('aria-current') === 'page') m.close(); }));
})();

/* ---------- dated lists: past events hide, today and tomorrow are marked; the strip says so ---------- */
(function events() {
  const soon: string[] = [];
  $$('[data-events]').forEach((list) => {
    const max = +(list.dataset.events || 99);
    let shown = 0;
    $$('[data-date]', list).forEach((row) => {
      const left = daysTo(row.dataset.date!);
      if (left < 0 || shown >= max) { row.hidden = true; return; }
      row.hidden = false;
      shown++;
      const tag = $('[data-left]', row);
      if (tag) tag.textContent = left === 0 ? 'Today' : left === 1 ? 'Tomorrow' : `In ${left} days`;
      if (left <= 1) {
        row.classList.add('is-soon');
        const name = row.dataset.name;
        if (name && !soon.some((s) => s.endsWith(name))) soon.push(`${left === 0 ? 'Today' : 'Tomorrow'}: ${name}`);
      }
    });
    const empty = $('[data-events-empty]', list.parentElement!);
    if (empty) empty.hidden = shown > 0;
  });
  const note = $('[data-note-text]');
  if (note && soon.length) { note.textContent = soon.join('   ·   '); $('[data-note]')!.classList.add('is-soon'); }
})();

/* ---------- each swamy's own day of 41 ---------- */
(function deeksha() {
  const box = $('[data-deeksha]');
  if (!box) return;
  const input = $<HTMLInputElement>('[data-mala-date]', box)!;
  const txt = $('[data-mala-txt]', box)!;
  const beads = $$('[data-beads] rect', box);
  const days = +box.dataset.days!;
  const KEY = 'kodathi-mala-date';
  const fmt = (ms: number) => new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }).format(ms);
  input.max = istToday();
  try { const saved = localStorage.getItem(KEY); if (saved) input.value = saved; } catch { /* storage blocked */ }
  const say = (b: string, s: string) => { const bb = document.createElement('b'); bb.textContent = b; const ss = document.createElement('span'); ss.textContent = s; txt.replaceChildren(bb, ss); };
  function draw() {
    const v = input.value;
    beads.forEach((r) => r.removeAttribute('class'));
    if (!v) return say('Your 41 days', 'Choose the day you took the mala.');
    const d = Math.floor((at(istToday()) - at(v)) / DAY) + 1;
    beads.forEach((r, i) => { if (i < d - 1) r.setAttribute('class', 'on'); else if (i === d - 1) r.setAttribute('class', 'today'); });
    const last = at(v) + (days - 1) * DAY;
    if (d < 1) say('Not yet', 'That day is still to come.');
    else if (d < days) say(`Day ${d} of ${days}`, `Your 41 days complete on ${fmt(last)}.`);
    else if (d === days) say(`Day ${days} of ${days}`, 'The last day of your deeksha. Swamiye Sharanam Ayyappa.');
    else say('Completed', `Your 41 days completed on ${fmt(last)}.`);
  }
  input.addEventListener('change', () => { try { localStorage.setItem(KEY, input.value); } catch { /* storage blocked */ } draw(); });
  draw();
})();

/* ---------- the eighteen steps, one at a time ---------- */
(function steps() {
  const box = $('[data-steps]');
  if (!box) return;
  let i = 0;
  const show = () => {
    $$('[data-step]', box).forEach((li) => { li.hidden = +li.dataset.step! !== i; });
    $$('[data-stair]', box).forEach((r) => r.classList.toggle('on', +r.dataset.stair! <= i));
    $('[data-step-n]', box)!.textContent = String(i + 1);
    $<HTMLButtonElement>('[data-step-prev]', box)!.disabled = i === 0;
    $('[data-step-next]', box)!.textContent = i === 17 ? 'Start again' : 'Next step';
  };
  $('[data-step-next]', box)!.addEventListener('click', () => { i = i === 17 ? 0 : i + 1; show(); });
  $('[data-step-prev]', box)!.addEventListener('click', () => { if (i > 0) i--; show(); });
  show();
})();

/* ---------- sharanu ghosha: each tap plays one call and its answer, never two at once ---------- */
(function ghosha() {
  const box = $('[data-ghosha]');
  if (!box) return;
  const lines = JSON.parse($('[data-vili]', box)!.textContent || '[]') as { en: string; kn: string; te: string }[];
  const btn = $<HTMLButtonElement>('[data-call]', box)!;
  let k = 0;
  let audio: HTMLAudioElement | null = null;
  const set = (n: number) => {
    const l = lines[n];
    $('[data-call-en]', box)!.textContent = l.en;
    const kn = $('[data-call-sc] [data-sc="kn"]', box), te = $('[data-call-sc] [data-sc="te"]', box);
    if (kn) kn.textContent = l.kn;
    if (te) te.textContent = l.te;
  };
  btn.addEventListener('click', () => {
    audio?.pause();
    set(k);
    audio = new Audio(`${base}media/audio/vili-${k}.mp3`);
    audio.play().catch(() => {});
    k = (k + 1) % lines.length;
    $('[data-call-n]', box)!.textContent = String(k + 1);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio?.pause(); });
})();

/* ---------- gallery viewer: one photo or video at a time; back closes it ---------- */
(function viewer() {
  const dlg = $<HTMLDialogElement>('[data-lb]');
  if (!dlg) return;
  const items = $$<HTMLButtonElement>('[data-item]');
  const stage = $('[data-lb-stage]', dlg)!;
  const cap = $('[data-lb-cap]', dlg)!;
  let i = 0;
  const v = backClosable(dlg, 'viewer');
  const show = () => {
    const it = items[i].dataset;
    stage.replaceChildren();
    if (it.type === 'video') {
      const vid = document.createElement('video');
      vid.src = it.src!; vid.poster = it.thumb!; vid.controls = true; vid.playsInline = true; vid.preload = 'metadata';
      stage.append(vid);
    } else {
      const img = document.createElement('img');
      img.src = it.src!; img.alt = it.alt || '';
      stage.append(img);
    }
    cap.textContent = `${it.album} · ${i + 1} of ${items.length}`;
  };
  items.forEach((b, n) => b.addEventListener('click', () => { i = n; show(); v.open(); }));
  $('[data-lb-close]', dlg)!.addEventListener('click', v.close);
  $('[data-lb-prev]', dlg)!.addEventListener('click', () => { i = (i - 1 + items.length) % items.length; show(); });
  $('[data-lb-next]', dlg)!.addEventListener('click', () => { i = (i + 1) % items.length; show(); });
  dlg.addEventListener('close', () => stage.replaceChildren());
})();

/* ---------- Add to calendar: iPhones get the calendar file, Android opens Google Calendar ---------- */
if (/iPhone|iPad|iPod/.test(navigator.userAgent)) $$<HTMLAnchorElement>('[data-ics]').forEach((a) => { a.href = a.dataset.ics!; a.removeAttribute('target'); });
