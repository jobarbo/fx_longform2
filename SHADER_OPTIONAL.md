# Making Shaders Optional - Summary

## What Changed

The shader system is now **completely optional**! Your sketch will work with or without shaders loaded.

### Key Changes to `sketch.js`:

All shader-related code now includes defensive checks using `typeof shaderEffects !== 'undefined'`:

```javascript
// In preload()
if (typeof shaderEffects !== "undefined") {
	shaderEffects.preload(this);
}

// In setup()
if (typeof shaderEffects !== "undefined") {
	shaderCanvas = createCanvas(DIM, DIM * ARTWORK_RATIO, WEBGL);
	shaderEffects.setup(width, height, mainCanvas, shaderCanvas);
	shaderCanvas.pixelDensity(pixel_density);
} else {
	// No shaders - create regular canvas
	createCanvas(DIM, DIM * ARTWORK_RATIO);
	pixelDensity(pixel_density);
}

// In customDraw()
if (typeof shaderEffects !== "undefined") {
	const shouldContinue = shaderEffects.renderFrame(result.done, customDraw);
	// ...
} else {
	// No shaders - just copy mainCanvas to display canvas
	clear();
	image(mainCanvas, 0, 0);
	// ...
}
```

## How to Use

### With Shaders (Default)

Keep your HTML as is:

```html
<script src="./shaders/sketch-shaders.js"></script>
<script src="sketch.js"></script>
```

✅ Sketch runs with shader effects

### Without Shaders

Remove or comment out the shader script:

```html
<!-- <script src="./shaders/sketch-shaders.js"></script> -->
<script src="sketch.js"></script>
```

✅ Sketch runs without shader effects (displays mainCanvas directly)

## Benefits

1. **Flexibility**: Use the same sketch with or without shaders
2. **Performance Testing**: Easy to compare performance with/without shader overhead
3. **Debugging**: Remove shaders to see raw artwork
4. **Portability**: Share sketch code without requiring shader dependencies
5. **Gradual Adoption**: Start without shaders, add them later

## No Breaking Changes

- If you keep `sketch-shaders.js` loaded, everything works exactly as before
- The sketch intelligently detects shader availability at runtime
- No performance overhead from the checks (simple `typeof` is very fast)

## Examples

### Scenario 1: Testing Performance

```html
<!-- Temporarily disable shaders to test sketch performance -->
<!-- <script src="./shaders/sketch-shaders.js"></script> -->
<script src="sketch.js"></script>
```

### Scenario 2: Simple Sketch (No Effects Needed)

```html
<!-- Just the sketch, no post-processing -->
<script src="sketch.js"></script>
```

### Scenario 3: Full Effects (Default)

```html
<!-- Full shader pipeline -->
<script src="./shaders/sketch-shaders.js"></script>
<script src="sketch.js"></script>
```

## Technical Details

### Architecture

**With Shaders:**

```
mainCanvas (p5.Graphics) → shaderCanvas (WEBGL) → shaders applied → display
```

**Without Shaders:**

```
mainCanvas (p5.Graphics) → main canvas (2D) → direct display
```

### How It Works

The sketch checks for `shaderEffects` availability using JavaScript's `typeof` operator:

- `typeof shaderEffects !== 'undefined'` → shaders available
- If undefined → gracefully falls back to direct rendering

When shaders are **enabled**:

- WEBGL canvas is created as `shaderCanvas`
- `mainCanvas` content is processed through shader pipeline
- Effects applied and rendered to `shaderCanvas`

When shaders are **disabled**:

- Regular 2D canvas is created (no `shaderCanvas` variable needed)
- `mainCanvas` content is rendered directly using `image(mainCanvas, 0, 0)`
- Animation loop continues normally without shader processing
- No WEBGL overhead

**Zero errors, zero warnings** - the sketch just works! ✨
