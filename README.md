# Ayyappa Swamy Temple, Kodathi

Website for the Ayyappa Swamy Temple on Kodati–Sulikunte Road, Bengaluru.

The home page is one temple day. Scrolling moves the clock forward, from the
nada opening at 4:30 to Harivarasanam at night:

| Time  | Scene | What it does |
|-------|-------|--------------|
| 04:30 | Lamps | Opening film, scrubbed by scroll; the chant in Kannada, English and Telugu, with a chorus of voices behind it |
| 05:00 | Nada opens | The sanctum doors open onto Lord Ayyappa (Nirmalyam darshan), then the page turns to daylight |
| 07:30 | The temple | About the temple, a kolam that draws itself, photos from the temple |
| 12:00 | Today | Live status in IST: open or closed, what is happening now, what is next |
| 17:00 | Mandala season | 41-bead vratham tracker and a countdown to Mandala pooja darshan |
| 18:30 | Offerings | Each offering books through WhatsApp with a prefilled message |
| 19:00 | Sharanam vili | Call-and-response: each press of Call sings the next name of Ayyappa and the chorus answers; words burst in Kannada, Telugu and English |
| 19:30 | Padi pooja | The climb: the 18 steps, pinned, counted and named, with a WebGL ember layer; at the top the film enters the sanctum for darshan |
| 20:00 | Ours | The temple's own padi pooja video |
| 20:30 | Visit | Address, hours, directions |
| 21:00 | Harivarasanam | The whole courtyard lit, every lamp burning |

Inner pages: `/poojas/`, `/festivals/`, `/visit/`.

## Stack

- [Astro](https://astro.build) static site
- [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll, [GSAP](https://gsap.com) ScrollTrigger
- [Three.js](https://threejs.org) for the real-time ember layer in the climb (loaded only when reached)
- Native cross-document View Transitions between pages
- Fonts: Tiro Kannada, Tiro Telugu, Hind (self-hosted via Fontsource)
- Every Kannada/Telugu label carries both scripts; the ಕ / తె switch in the header picks one and remembers it

## Editing content

All temple details live in [`src/data/temple.ts`](src/data/temple.ts): address,
WhatsApp number, the daily schedule, offerings, festivals and Mandala dates.
**Timings, dates, the WhatsApp number and some customs are placeholders** and are
marked `confirm` in that file. Pages show a small note wherever placeholder
information appears.

## Media

`public/media/film/` holds the film sequences. They are AI-generated
(Seedream 5 Pro stills animated with Kling 4) and art-directed. The darshan
follows the traditional Sabarimala iconography; swap in a photo of the temple's own
idol (`film/darshan-poster.jpg` and the clip) if the committee prefers. Scroll-scrubbed clips are encoded with a keyframe every
3 frames so seeking stays smooth:

```sh
ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -crf 25 -g 3 -keyint_min 3 -bf 0 \
  -pix_fmt yuv420p -movflags +faststart -an out.mp4
```

Each clip has a `-m.mp4` phone version (854 px) and a `-poster.jpg`.
`public/media/temple/` holds the temple's own photos and padi pooja video.
`public/media/audio/` holds the chorus chant loop (call-and-response), one recording per litany line cut from it (`vili-0` to `vili-4`, each a call and its chorus answer), bell and conch.

Kannada and Telugu text lives in `src/data/temple.ts` and should be checked by a native speaker on the committee.

## Develop

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
```

Append `?t=19:40` to the home page URL to see the "Today" panel at a given IST time.

## Tests

End-to-end tests use Playwright (JavaScript) at desktop and phone sizes:

```sh
npx playwright test
```

They cover every page loading without console errors, broken requests or
sideways scroll; the opening and sound controls; the clock and colour changes
on scroll; the 18-step counter; video seeking; the offerings booking links; the
live schedule at several times of day; the Mandala tracker; and the
reduced-motion layout.

## Deploy

Any static host works. On Vercel, import the repo; the defaults
(`npm run build`, output `dist`) are correct.
