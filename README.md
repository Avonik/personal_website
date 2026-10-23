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
- All eight existing projects, CV entries, awards, and contact links are retained. Content and illustrations are in `index.html`; filtering is in `assets/js/main.js`; styles are in `assets/css/styles.css`.
- Projects remain readable without JavaScript. Filters use native keyboard-operable buttons and announce counts to screen readers.
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

Browser checks cover desktop and phone layouts, all three project filters, valid section navigation, no missing images, and no console errors. Static checks cover JavaScript syntax, section anchors, duplicate IDs, and asset references.

## Project carousel

The hero keeps three overlapping cards in view while all eight projects follow a slow orbit, passing the centre every twelve seconds. It pauses on hover or keyboard focus, has explicit pause and previous/next controls, and suspends updates when offscreen or in a background tab. Reduced-motion preferences disable autoplay and make manual navigation immediate. Manual navigation uses a critically damped spring and remains interruptible.

Run the carousel behavior checks with:

```sh
node tests/carousel.test.cjs
```

These cover autoplay, pausing, manual stepping, rapid retargeting, hidden/offscreen suspension, and changes to motion preferences.
