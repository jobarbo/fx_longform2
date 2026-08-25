# Generative art project

Local webpack + p5.js environment for generative artwork, with a live shader panel and branch-folder saves during development.

## Prerequisites

- Node.js >= 16
- npm >= 6.14.4

## Getting started

```bash
npm install
npm start
```

`npm start` serves the project at **http://localhost:3301** and opens it in your browser.

## Scripts

- `npm start` — bootstrap `lib/` then webpack-dev-server on port 3301
- `npm run start:project` — same server via webpack CLI
- `npm run build` — production build + zip under `dist-zipped/`
- `npm run bootstrap` — recreate generated `lib/` files (also runs automatically before start/build)

## Tooling (`lib/`)

Only [`lib/scripts/bootstrap-lib.js`](lib/scripts/bootstrap-lib.js) is tracked. It writes the rest of `lib/` (webpack configs, `start.js`, etc.). Those generated files are gitignored so branch switches keep the same local tooling.

- Edit infra inside the `FILES` map in `bootstrap-lib.js`, then run `npm run bootstrap` (or just `npm start`)
- If generated files are missing: `npm run bootstrap`
- Do not commit generated files under `lib/` (except `bootstrap-lib.js`)

## Development features

### Shader panel (key **E**)

Toggle and edit post-processing effects live. With `PERSIST_SHADER_PANEL` enabled in `sketch.js`, panel edits survive a refresh (stored in `localStorage`).

### Save artwork (Cmd/Ctrl+S)

In the local server, saves write to `~/Downloads/<current-git-branch>/` (filesystem-unsafe characters in the branch name become hyphens). Production / static builds fall back to a normal browser download.

### Seed / randomness

`library/utils/fxhash.js` provides `$fx`, `fxhash`, and `fxrand` so sketches get a deterministic PRNG per refresh. Sketches should use `fxrand()` instead of `Math.random()`.

## Project layout

- `project/public/sketch.js` — main sketch
- `project/public/shaders/sketch-shaders.js` — shader effect stack + panel APIs
- `project/public/library/` — shared utilities (git submodule)
- `lib/scripts/bootstrap-lib.js` — tracked bootstrap (source of truth for tooling)
- `lib/` — generated webpack / start files (gitignored except bootstrap)
