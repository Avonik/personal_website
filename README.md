# juhermes.de landing page

A static personal landing page for the root domain `juhermes.de`.

## Edit projects

Project cards are defined in `assets/js/main.js`. Add another item to the `projects`
array when a new subdomain goes live.

## Local preview

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy on Raspberry Pi

Copy the repository to the Pi, for example under `/var/www/juhermes.de`, then serve it with
Nginx on a local port that your existing Cloudflare Tunnel can reach.

Example Nginx server:

```nginx
server {
    listen 8090;
    server_name juhermes.de www.juhermes.de;

    root /var/www/juhermes.de;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then add `juhermes.de` and optionally `www.juhermes.de` to your existing `cloudflared`
ingress config, pointing them at `http://localhost:8090`.
