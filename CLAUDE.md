# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

- **Install**: `npm install` (pulls fxlens and dependencies)
- **Development**: `npm start` (runs on ports 3300 for fx(lens) and 3301 for your project)
  - Visit `http://localhost:3300/?target=http://localhost:3301` to see your project in fx(lens)
  - Alternative: `npm start:project` runs only the project server (port 3301)
- **Build**: `npm run build` (creates `dist-zipped/project.zip` for upload)

## Project Overview

This is an fxhash boilerplate for creating **generative tokens** — algorithmic art where each minted token receives a unique hash that deterministically generates a different output. The project uses **p5.js** for 2D/3D graphics with an optional WebGL shader system.

Key fxhash concepts:
- `$fx` object: Exposes `hash`, `rand()` (deterministic PRNG), `params()`, `features()`, and preview triggers
- `$fx.rand()`: Use instead of `Math.random()` to ensure reproducibility across mints
- `$fx.hash`: A 64-char hex string that's random during dev, fixed per mint on fxhash
- Parameters (`fx(params)`) allow collectors to customize tokens at mint time
- Features tag the output for discoverability (e.g., color scheme, composition style)

## Architecture

### Core Files

**Entry point & parameters:**
- `project/src/index.js` — Minimal entry; defines basic fx(params) for shape type
- `project/public/parameters/params.js` — Parameter definitions (see `$fx.params()`)

**Main sketch logic:**
- `project/public/sketch.js` — p5.js draw loop, particle system (`movers`), shader effects, frame timing
  - Uses a `Mover` class system for particles (details in `project/public/shapes/mover.js`)
  - Manages swatch palettes, shader effects, and lifecycle resets
  - Key variables: `movers[]`, `maxFrames`, `particleLifecycle`, `startTime`, `swatchPalette`

**Utility libraries (in `project/public/library/`):**
- `utils.js` — General utilities (download button, FPS counter)
- `shaderManager.js` — Loads and manages shader programs
- `shaderPipeline.js` — Chains multiple shader effects in sequence
- `swatchPalette.js` — Loads color swatches from PNG files (in `project/public/swatches/`)
- `shaders/` — Pre-made shader effects (pixel-sort, crt-warp, chromatic-aberration, etc.); each has vertex/fragment files
- `p5/` — External p5.js and plugin libraries (p5.min.js, matter.js, spectral.js, etc.)
- `utils/knob.js`, `midiChime.js`, `audioAnalyzer.js` — Specialized tools for interactivity

**HTML & styling:**
- `project/public/index.html` — Includes all script dependencies in order; has a debug overlay (`#debug-bounds`) and controls (`#controls`)
- `project/public/style.css` — Styling for canvas and UI

### Build System

- **Webpack config** in `lib/config/`:
  - `webpack.config.dev.js` — Dev server with live reload (port from env)
  - `webpack.config.prod.js` — Production build; outputs bundled files
  - `webpack.config.headless.js` — Alternate dev config (no p5.js renderer on canvas)
  - `ZipperPlugin.js` — Custom plugin that zips the final output for fxhash submission
- **Entry points**:
  - `project/public/index.html` → `project/public/sketch.js` (main p5.js sketch)
  - `project/src/index.js` → Mostly metadata; param definitions happen here
- **Environment**: `lib/config/env.js` reads `.env` for ports (default 3300 for fx(lens), 3301 for project)

### Shader System

- Each shader is a pair of files: `filename.vert` (vertex) and `filename.frag` (fragment)
- Located in both `project/public/library/shaders/` (built-ins) and `project/public/shaders/` (project-specific)
- Applied via `ShaderManager` and chained in `ShaderPipeline`
- WebGL canvas is separate from the main p5.js canvas; shader effects composite over the artwork

### Particle System

The `Mover` class drives animated particles:
- Each mover has position, velocity, lifespan, and color cycling
- `particleLifecycle` object controls respawning: "sync" (all at once), "random", or "window" (range-based)
- `colorLoop` cycles particles through the palette; `colorYoyo` reverses direction; `colorRandomStart` offsets each particle
- `ExecutionTimer` tracks cumulative draw time (used for frame limiting and lifecycle management)

### Color/Swatch System

- Palettes are stored as PNG files in `project/public/swatches/`
- `manifest.json` lists available swatches
- `swatchPalette` object samples colors from the PNG at runtime
- Allows deterministic, image-based color schemes in generative art

## Development Workflow

### Running Tests
There are no traditional unit tests. Instead, use **fx(lens)** (the interactive IDE):
1. Run `npm start`
2. Open `http://localhost:3300/?target=http://localhost:3301` in your browser
3. Refresh to generate a new random hash
4. Tweak parameters and see live changes
5. Use FPS button and debug overlay to monitor performance

### Adding a Parameter
1. Define it in `project/public/parameters/params.js` or `project/src/index.js` using `$fx.params()`
2. Access via `$fx.getParam('id')` or `$fx.getParams()` in sketch.js
3. Test in fx(lens) to ensure randomization works as expected

### Adding a Shader
1. Create `.vert` and `.frag` files in `project/public/shaders/` (or library)
2. Load via `ShaderManager.loadShader('shader-name')`
3. Add to the `ShaderPipeline` or apply directly to the canvas
4. Reference any README files in shader directories for specific setup (e.g., `pixel-sort/README.md`)

### Building & Publishing
1. Run `npm run build` → creates `dist-zipped/project.zip`
2. Test locally in the fxhash sandbox: upload to https://fxhash.xyz/sandbox/
3. Once verified, mint your token and upload the same .zip to go live

## Key Variables & State

- **Global timing**: `startTime`, `elapsedTime`, `executionTimer` (frame counter)
- **Rendering mode**: `useFrameMode` (all particles per frame) vs. cycle rendering
- **Particle system**: `movers[]`, `particleNum`, `particleLifecycle`
- **Color system**: `swatchPalette`, `colorLoop`, `colorYoyo`, `colorLoopSpeed`
- **Canvas**: `mainCanvas` (p5 graphics buffer), `shaderCanvas` (WebGL for effects)
- **Debugging**: `debugBounds` (shows render bounds overlay), `updateDebugOverlay()`

## Environment & Ports

- `.env` file defines:
  - `PORT_PROJECT` (default 3301) — your artwork server
  - `PORT_FXLENS` (default 3300) — the interactive IDE
- `HOST` defaults to `0.0.0.0` (accessible from other devices on your network)

## Notes for Future Work

- The `ExecutionTimer` handles frame-based animation; familiarize with its interface if you add time-dependent features
- Shader effects are composited; the order in `ShaderPipeline` matters
- `$fx.rand()` is seeded by the hash; use it everywhere you need randomness for reproducibility
- The swatches system allows runtime palette selection; it reads PNG files, so ensure swatch PNGs are in `project/public/swatches/`
- Debug overlay shows artwork bounds (10% padding) and mover bounds for collision/layout debugging
