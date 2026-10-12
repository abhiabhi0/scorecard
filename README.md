# Scorepad

A mobile-friendly, static website for game-night scorekeeping. Canasta is the first game; the homepage is designed to add other game scorekeepers later.

## Files

- `index.html` — game-selection homepage
- `games/canasta/index.html` — Canasta scorekeeper
- `manifest.webmanifest` — installable PWA metadata
- `sw.js` — offline app-shell cache
- `icons/icon.svg`, `icons/icon-192.png`, `icons/icon-512.png` — app icons

## Publish with GitHub Pages

1. Create a GitHub repository, for example `scorecard`.
2. Upload all files and folders in this project to the repository root. Keep the paths exactly as shown above.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/(root)`, then save.
5. Wait for GitHub Pages to publish the site. Your URL will usually be `https://YOUR-USERNAME.github.io/scorecard/` for a project repository.

For a repository named `YOUR-USERNAME.github.io`, the URL is `https://YOUR-USERNAME.github.io/`.

## Offline and score storage

The site uses a service worker to cache the homepage and Canasta page after the first visit. Canasta saves its game state in browser `localStorage`, separately on each browser/device. Scores do not automatically sync between users or devices. Use the in-app export/restore backup tools to move score data.

For local testing, use a local web server rather than opening `index.html` as a `file://` URL if you want to test PWA/offline installation. GitHub Pages provides HTTPS, which is required for service workers and normal PWA installation.

## Adding another game

1. Create a folder such as `games/new-game/` and add its `index.html`.
2. Add a game card to the `.game-grid` in the root `index.html`.
3. Add the new page to `APP_SHELL` in `sw.js` so it is available in the offline app shell.
4. Increment `CACHE_NAME` in `sw.js` (for example, `scorepad-static-v2`) so deployed users receive the updated cache.
