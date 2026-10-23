# juhermes.de — Apple design exploration

An independent redesign on `design/apple-design`, based on [Emil Kowalski’s Apple design skill](https://github.com/emilkowalski/skills/tree/main/skills/apple-design). The production branch is `main`.

## Preview

Public review: https://designs.juhermes.de

```sh
python3 -m http.server 8093 --bind 127.0.0.1
```

Open http://127.0.0.1:8093. No build, dependency installation, or external font request is required.

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
sudo rsync -a --delete --exclude='.git' --exclude='.git/' --exclude='README.md' ./ /var/www/designs.juhermes.de/
```

Only run that command from this branch’s checkout. To retire the preview, remove its Cloudflare DNS/ingress entry and its Nginx site, test Nginx configuration, then reload Nginx and restart cloudflared. Do not change the production site configuration.

## Validation

Browser checks cover desktop and phone layouts, all three project filters, valid section navigation, no missing images, and no console errors. Static checks cover JavaScript syntax, section anchors, duplicate IDs, and asset references.
