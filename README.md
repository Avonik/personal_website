# juhermes.de — Apple design exploration

An independent redesign on `design/apple-design`, based on [Emil Kowalski’s Apple design skill](https://github.com/emilkowalski/skills/tree/main/skills/apple-design). The production branch is `main`.

## Preview

Public review: https://designs.juhermes.de

```sh
python3 -m http.server 8093 --bind 127.0.0.1
```

Open http://127.0.0.1:8093. No build, dependency installation, or external font request is required.

## Second design pass

Studied Apple’s homepage and online Store on 23 October 2026. The refinement uses a compact navigation bar, a short centered introduction with paired calls to action, custom project illustrations, continuous project tile surfaces, larger body text, and alternating light/dark project treatments. Apple screenshots are reference material only; no Apple product imagery is used in the site. The hero and live project cards share original SVG illustrations for weather, rail, and football, with a consistent palette, lighting, and level of detail. They are conceptual illustrations and contain no live readings or app screenshots.

## Design and content

- System typography, restrained blue accents, translucent sticky navigation, immediate press feedback, and responsive illustrated project cards.
- All eight existing projects, CV entries, awards, and contact links are retained. Content and illustrations are in `index.html`; carousel interaction is in `assets/js/main.js`; styles are in `assets/css/styles.css`.
- Projects remain readable without JavaScript. Projects are grouped into live tools/upcoming work and research/engineering on GitHub, each with a short explanation.
- Reduced motion, transparency, and increased contrast preferences have dedicated CSS treatments.
- The preview contains `noindex, nofollow` in its HTML and an `X-Robots-Tag` response header. Remove these preview restrictions if promoting to production.

## Pi deployment

The preview is a separate static snapshot at `/var/www/designs.juhermes.de`, served by `/etc/nginx/sites-available/designs.juhermes.de` on loopback port 8094. The existing Cloudflare tunnel routes only `designs.juhermes.de` to this port. The production checkout and web root are separate.

To update after editing this branch:

```sh
sudo rsync -a --delete --exclude='.git' --exclude='.git/' --exclude='README.md' --exclude='tests/' ./ /var/www/designs.juhermes.de/
```

Only run that command from this branch’s checkout. To retire the preview, remove its Cloudflare DNS/ingress entry and its Nginx site, test Nginx configuration, then reload Nginx and restart cloudflared. Do not change the production site configuration.

## Validation

Browser checks cover desktop and phone layouts, the draggable carousel, valid section navigation, no missing images, and no console errors. Static checks cover JavaScript syntax, section anchors, duplicate IDs, and asset references.

## Project carousel

Three overlapping cards cycle through all eight projects, with one step taking about 8.33 seconds. Two complete stacking orders crossfade around the foreground handoff, avoiding an opaque z-index switch. Headings stay aligned throughout movement.

Drag with mouse or touch, scroll sideways on a trackpad, or use Shift+wheel. Horizontal gestures move the cards directly, then settle with momentum and an interruptible spring. Vertical swipes and ordinary vertical wheel input preserve page scrolling. The focusable carousel also supports left/right arrows and Space to pause or resume, with no visible navigation buttons.

Autoplay pauses during interaction and suspends while offscreen or in a background tab. Reduced-motion preferences disable autoplay and spring-based settling.

```sh
node tests/carousel.test.cjs
```

Checks cover speed, continuous layer blending, direct dragging, release momentum, interrupted movement, wheel handling, keyboard navigation, motion preferences, and background/offscreen suspension.
