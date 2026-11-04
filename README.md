# Scorepad

A mobile-friendly, static website for game-night scorekeeping and offline tabletop-style games. Canasta is the first scorekeeper; Roll & Connect is the first quick-play game.

## Repository map

- `index.html` — game-selection homepage and PWA install prompt.
- `games/canasta/index.html` — self-contained Canasta scorekeeper, including scoring, round history, editing, and backup/restore.
- `games/roll-connect/index.html` — self-contained two-player dice game.
- `manifest.webmanifest` — installable PWA metadata and app scope.
- `sw.js` — service worker; app-shell precache and offline navigation fallback.
- `icons/` — app icons.
- `tests/canasta-test.js` — Node built-in test-runner checks for Canasta layout and scoring assumptions.
- `tests/roll-connect-test.js` — Node built-in test-runner checks for Roll & Connect rules and offline wiring.
- `docs/AI_CONTEXT.md` — maintained architecture, game rules, and AI implementation guide.

## Architecture and conventions

The project intentionally uses plain HTML, CSS, and browser JavaScript. There is no package manager, bundler, framework, server API, or build step. Each game is an independently navigable static page under `games/<game-id>/index.html`; game-specific UI, logic, and persistence live with that game. Shared navigation and PWA concerns stay at the repository root.

Use relative paths so GitHub Pages project-site hosting works under `/<repository>/`. Game pages link home via `../../index.html` and register the root service worker via `../../sw.js`. Keep games usable on narrow mobile screens, support keyboard focus, provide accessible labels/status announcements, and avoid external runtime dependencies.

## Offline and persistence

The service worker precaches the homepage, manifest, icons, and each game's entry page. Increment `CACHE_NAME` in `sw.js` whenever cached app resources change. Offline availability requires HTTPS (GitHub Pages qualifies) or localhost and each page to have been cached once. Games store data in browser `localStorage`; data is local to that browser/device and is not synced between users or devices.

## Tests

Run the static checks with Node.js:

```sh
node --test tests/*.test.js
```

These tests are source-level checks, not browser end-to-end tests. Verify important touch, offline, and layout behaviour in a browser before release.

## Adding another game

1. Create `games/<game-id>/index.html` as an isolated static game page.
2. Link it from the `.game-grid` in root `index.html`.
3. Add both the game directory URL and exact HTML URL to `APP_SHELL` in `sw.js`.
4. Bump `CACHE_NAME` so deployed users refresh the app shell.
5. Add focused tests for rules, structure, and offline wiring.
6. Update `docs/AI_CONTEXT.md` when architecture, rules, persistence, or extension conventions change.
