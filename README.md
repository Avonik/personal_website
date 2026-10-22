# juhermes.de landing page

A static personal landing page for the root domain `juhermes.de`.

## Edit projects

Project cards are defined in `assets/js/main.js`:

- `liveProjects` contains browser demos and clearly labelled upcoming releases.
- `githubProjects` contains hardware, research, and engineering projects with repository links.

Leave `url` empty for projects that are not public yet; the card shows a release note
instead of a clickable link. Only add public information to these cards.

## Local preview

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

