# Generative art project

Local webpack + p5.js environment for generative artwork, with a live shader panel and branch-folder saves during development.

## Prerequisites

- Node.js >= 14
- npm >= 6.14.4

## Getting started

```bash
npm install
npm start
```

`npm start` serves the project at **http://localhost:3301** and opens it in your browser.

## Scripts

- `npm start` — webpack-dev-server on port 3301 with live reload
- `npm run start:project` — same server via webpack CLI
- `npm run build` — production build + zip under `dist-zipped/`

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
- `lib/config/` — webpack configs
