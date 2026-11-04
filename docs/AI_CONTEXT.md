# AI Context: Scorepad

Read this file before proposing or implementing repository changes. Source code is authoritative if it conflicts with this guide.

## Product and constraints

Scorepad is a mobile-first static web app for game-night scorekeeping and local tabletop-style games. It is published with GitHub Pages and is designed for offline use after service-worker caching. There are no accounts, backend, server APIs, cloud saves, or cross-device synchronization.

- Stack: plain HTML5, CSS, and browser JavaScript.
- No framework, TypeScript, npm dependencies, package manager, bundler, or build step.
- Each game is a self-contained page under `games/<game-id>/index.html`.
- Keep game-specific UI, logic, and persistence within that game's directory.
- Use namespaced `localStorage` keys. Handle storage errors/malformed data defensively.
- Do not introduce runtime dependencies on external scripts, fonts, APIs, or assets; offline operation is a product requirement.
- Use relative links to support hosting below a project path such as `/scorecard/`.
- Mobile/touch is primary. Maintain responsive layouts, accessible labels, keyboard focus indicators, and live announcements for important status changes.
- Existing visual language: dark teal `#174e4f`, muted teal `#103b3c`, pale background `#edf2ed`, warm off-white panels, rounded corners, subtle shadows.

## Repository map

| Path | Responsibility |
|---|---|
| `index.html` | Homepage, game cards, PWA install prompt, service-worker registration |
| `games/canasta/index.html` | Canasta scorekeeper: setup, scoring, rounds, history, edits, backup/restore |
| `games/roll-connect/index.html` | Roll & Connect board, dice turns, player progress, local match state |
| `manifest.webmanifest` | PWA metadata, scope, start URL, colors, icons |
| `sw.js` | App-shell precache, navigation fallback, same-origin runtime caching |
| `icons/` | PWA icons |
| `tests/canasta-test.js` | Existing Canasta layout and scoring source checks |
| `tests/roll-connect-test.js` | Roll & Connect rule and offline integration source checks |
| `docs/AI_CONTEXT.md` | This guide |

## Navigation and offline behaviour

The homepage links each game using a relative path. A game page links home with `../../index.html` and registers the root service worker at `../../sw.js`; the homepage registers `sw.js` relative to its base URL. Service workers need HTTPS or localhost; opening files with `file://` does not provide PWA/offline support.

The service worker has an explicit `APP_SHELL` list. For every new page, include both its directory URL and exact `index.html` URL. Navigation is network-first and caches successful responses; offline navigation then attempts the exact cached URL. Increment `CACHE_NAME` whenever cached resources change so the activate handler removes the previous app cache. Current cache version: `scorepad-static-v6`.

## Persistence model

Each game owns its own local state and key. Canasta has its own state and backup/restore format. Roll & Connect uses `scorepad.rollConnect.v1`. Never reuse or reinterpret another game's key. Local storage belongs to one browser/device; do not describe it as a cloud save or multiplayer network.

## Roll & Connect specification

- Two players alternate turns rolling a standard six-sided die.
- Each player independently owns six targets numbered 1–6, located on opposite sides of the centre.
- On a roll, connect the matching number on the current player's side to the central goal.
- Each player can connect each of their own numbers once.
- Repeating a number already connected by that same player skips their turn and passes play to the opponent.
- The other player's matching number remains available. If Player 1 connects 3, Player 2 may still connect 3.
- Lines may cross. Crossing has no game effect.
- The first player with all six of their own numbers connected wins.
- The page includes a manual pass action and undo for the latest recorded turn.
- Starting a new game clears progress but keeps current player names; reset names returns both to defaults.
- Keep player progress as two independent arrays. Never make claimed numbers globally shared.

## Safe implementation workflow

1. Read affected source files and current tests before editing.
2. Keep changes scoped; avoid modifying Canasta behaviour when working on Roll & Connect.
3. For a new game, add the standalone game page, homepage card, service-worker app-shell entries, and a new cache version.
4. Add focused tests for rules, structural integration, and offline wiring.
5. Update this guide and README when behaviour, architecture, or conventions change.
6. Do not claim validation passed unless commands or browser checks were actually run.

## Validation and manual checks

Run source-level tests with Node.js:

```sh
node --test tests/*.test.js
```

These checks are not end-to-end tests. Also serve the site with a local HTTP server and verify:
- navigation from homepage to each game and back;
- narrow-screen sizing and touch targets;
- successful turns, repeat-roll skips, independent matching numbers, and win condition;
- reload persistence, undo, new game, and name reset;
- service-worker refresh after cache version change and exact game navigation while offline.

## AI agent behaviour

Before coding, identify the relevant files and summarize their current responsibilities. Prefer small, reviewable diffs. State assumptions explicitly. Preserve existing local data and backward compatibility. If a request changes a game rule, update UI instructions, implementation, tests, and this document together.
