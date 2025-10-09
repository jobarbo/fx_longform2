# Sketch Adaptation Guide

## What Was Fixed

### 1. LibManager Updates

- ✅ **Removed** reference to non-existent `animationController.js`
  - Animation functionality now in `utils.js` as `createAnimationGenerator()`
- ✅ **Added** `shaderPipeline.js` to module paths
- ✅ **Fixed** mover path from `./object/mover.js` → `./modules/mover.js`
- ✅ **Updated** dependencies to reflect new structure

### 2. Sketch Adaptation

Your sketch now uses the **generator pattern** with **optional shader support**!

## How It Works

### Architecture

**With Shaders Enabled:**

```
movers → mainCanvas (drawing) → shaderCanvas (WEBGL) → shader effects → display
```

**Without Shaders:**

```
movers → mainCanvas (drawing) → direct display
```

### Key Features

1. **Generator-based Animation**

   - Uses `createAnimationGenerator()` from `utils.js`
   - Progress tracking with loading bar
   - Smooth frame-by-frame rendering
   - Completion callback

2. **Optional Shader System**

   - Works with or without `sketch-shaders.js`
   - Automatic detection and fallback
   - No errors if shaders not loaded

3. **Dual Canvas System**
   - `mainCanvas`: Drawing buffer (p5.Graphics)
   - `shaderCanvas`: WEBGL canvas for effects (optional)

## Usage

### Running with Shaders

Keep all shader scripts in `index.html`:

```html
<script src="./library/utils/shaderManager.js"></script>
<script src="./library/utils/shaderPipeline.js"></script>
<script src="./shaders/sketch-shaders.js"></script>
```

✅ Sketch runs with shader effects applied

### Running without Shaders

Comment out shader scripts:

```html
<!-- <script src="./library/utils/shaderManager.js"></script> -->
<!-- <script src="./library/utils/shaderPipeline.js"></script> -->
<!-- <script src="./shaders/sketch-shaders.js"></script> -->
```

✅ Sketch runs without effects (faster, simpler)

## Key Functions

### Animation Generator Pattern

```javascript
const animConfig = {
	items: movers, // Array of items to animate
	maxFrames: 300, // Total animation frames
	cycleLength: 30, // Update frequency
	renderItem: (mover, frame) => {
		mover.display(); // Draw the mover
	},
	moveItem: (mover, frame) => {
		mover.update(frame); // Update position
	},
	onComplete: () => {
		// Animation finished!
	},
};

generator = createAnimationGenerator(animConfig);
```

### Custom Draw Loop

```javascript
function customDraw() {
	const result = generator.next();

	// Draw to mainCanvas
	mainCanvas.push();
	// ... drawing code ...
	mainCanvas.pop();

	// Apply shaders (if available)
	if (typeof shaderEffects !== "undefined") {
		const shouldContinue = shaderEffects.renderFrame(result.done, customDraw);
		if (shouldContinue) {
			requestAnimationFrame(customDraw);
		}
	} else {
		// No shaders - direct display
		clear();
		image(mainCanvas, 0, 0);
		if (!result.done) {
			requestAnimationFrame(customDraw);
		}
	}
}
```

## Shader Configuration

To customize shaders, edit `/shaders/sketch-shaders.js`:

```javascript
this.effectsConfig = {
	chromatic: {
		enabled: true,
		amount: 0.0015,
		// ... more config
	},
	grain: {
		enabled: true,
		amount: 0.1,
		// ... more config
	},
};
```

## What Changed in Your Sketch

### Before (Regular draw loop):

```javascript
function draw() {
	scale(MULTIPLIER);
	translate(BASE_WIDTH * 0.5, BASE_HEIGHT * 0.5);

	for (let mover of movers) {
		mover.update(frameCount);
		mover.display();
	}
	// ... connections ...
}
```

### After (Generator + Optional Shaders):

```javascript
// Setup creates generator
generator = createAnimationGenerator({
	items: movers,
	maxFrames: 300,
	renderItem: (mover) => mover.display(),
	moveItem: (mover, frame) => mover.update(frame),
});

// Custom loop handles both animation and shaders
function customDraw() {
	const result = generator.next();
	// Draw to mainCanvas
	// Apply shaders if available
	// Continue loop if not done
}
```

## Benefits

1. ✅ **Progress Tracking** - Built-in loading bar shows completion %
2. ✅ **Modular** - Shaders are completely optional
3. ✅ **Reusable** - Generator pattern works for any animation
4. ✅ **Performance** - Controlled frame updates, no unnecessary redraws
5. ✅ **Clean Code** - Separation of drawing logic and shader effects

## Testing

### Test without shaders:

```bash
# Comment out shader scripts in index.html
npm start
```

### Test with shaders:

```bash
# Uncomment shader scripts in index.html
npm start
```

Both should work perfectly! 🎉

## Next Steps

1. Adjust `maxFrames` in sketch.js to control animation length
2. Customize shader effects in `shaders/sketch-shaders.js`
3. Modify the generator pattern for different animation types
4. Add more movers or change their behavior

The system is now fully modular and reusable across projects!

