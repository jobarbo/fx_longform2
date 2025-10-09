# Shader Effects Module

A modular, plug-and-play shader effects system for p5.js projects. This system keeps your `sketch.js` clean and focused on the sketch logic while managing all shader-related code separately.

## Quick Start

### 1. Copy Required Files

To use this shader system in a new project, copy these files:

```
library/utils/shaderManager.js      (shader loading utility)
library/utils/shaderPipeline.js     (shader pipeline utility)
shaders/sketch-shaders.js            (shader effects configuration)
library/shaders/                     (your shader files)
```

### 2. Include Scripts in HTML

Add these scripts to your `index.html` in order:

```html
<script src="./library/utils/shaderManager.js"></script>
<script src="./library/utils/shaderPipeline.js"></script>
<script src="./shaders/sketch-shaders.js"></script>
<script src="sketch.js"></script>
```

### 3. Initialize in Your Sketch

In your `sketch.js`:

```javascript
// Declare canvas variables
let mainCanvas; // Your artwork canvas (2D or WEBGL)
let shaderCanvas; // WEBGL canvas for shader effects

function preload() {
	// Initialize shader effects (loads all shaders)
	shaderEffects.preload(this);
}

function setup() {
	// Create your canvases
	mainCanvas = createGraphics(width, height);
	shaderCanvas = createCanvas(width, height, WEBGL);

	// Initialize shader effects system
	shaderEffects.setup(width, height, mainCanvas, shaderCanvas);

	// Your setup code...
}

function draw() {
	// Draw to mainCanvas
	mainCanvas.background(220);
	// ... your drawing code ...

	// Update shader time
	shaderEffects.updateTime(0.01);

	// Apply shaders (renders to shaderCanvas)
	shaderEffects.apply();
}
```

## Configuration

### Customizing Shaders

Edit `shaders/sketch-shaders.js` to:

1. **Load different shaders** in the `preload()` method:

```javascript
preload(p5Instance) {
    // ... existing code ...

    // Load your custom shaders
    shaderManager.loadShader("myShader", "myShader/fragment.frag", "myShader/vertex.vert");
}
```

2. **Configure effects** in the `effectsConfig` object:

```javascript
this.effectsConfig = {
	myShader: {
		enabled: true,
		amount: 1.0,
		timeMultiplier: 1.0,
		uniforms: {
			uTime: "shaderTime * timeMultiplier",
			uAmount: "amount",
			// Add more uniforms as needed
		},
	},
	// ... other effects
};
```

### Effect Configuration Options

Each effect in `effectsConfig` supports:

- `enabled`: (boolean) Enable/disable the effect
- Custom parameters (e.g., `amount`, `timeMultiplier`)
- `uniforms`: Map uniform names to values or expressions
  - Direct values: `uAmount: 1.0`
  - Property references: `uAmount: "amount"` (references effect.amount)
  - Expressions: `uSeed: "shaderSeed + 777.0"`
  - Special values: `uResolution: "[width, height]"`

### Uniform Expression Evaluation

The system automatically evaluates string expressions in uniforms:

```javascript
uniforms: {
    uTime: "shaderTime * timeMultiplier",     // Uses current shaderTime * effect.timeMultiplier
    uSeed: "shaderSeed + 777.0",             // Adds offset to shaderSeed
    uAmount: "amount",                        // References effect.amount property
    uResolution: "[width, height]",           // Special array syntax
}
```

## API Reference

### Main Methods

#### `shaderEffects.preload(p5Instance)`

Initialize and load all shaders. Call in p5's `preload()`.

#### `shaderEffects.setup(width, height, mainCanvas, shaderCanvas)`

Setup the shader system. Call in p5's `setup()`.

#### `shaderEffects.apply()`

Apply shader effects to mainCanvas and render to shaderCanvas.

#### `shaderEffects.applyCopy()`

Copy mainCanvas to shaderCanvas without effects (useful for debugging).

#### `shaderEffects.updateTime(delta = 0.01)`

Update shader animation time. Call in your animation loop.

### Configuration Methods

#### `shaderEffects.addEffect(effectName, config)`

Add a new effect programmatically:

```javascript
shaderEffects.addEffect("blur", {
	enabled: true,
	radius: 5.0,
	uniforms: {
		uRadius: "radius",
	},
});
```

#### `shaderEffects.setEffectEnabled(effectName, enabled)`

Enable/disable an effect:

```javascript
shaderEffects.setEffectEnabled("chromatic", false);
```

#### `shaderEffects.updateEffectParam(effectName, paramName, value)`

Update an effect parameter:

```javascript
shaderEffects.updateEffectParam("grain", "amount", 0.2);
```

#### `shaderEffects.setFrameRate(fps)`

Set shader animation frame rate (1-120 fps):

```javascript
shaderEffects.setFrameRate(30); // Match your p5 frameRate
```

#### `shaderEffects.setContinueAfterCompletion(value)`

Control whether shaders continue animating after sketch completion:

```javascript
shaderEffects.setContinueAfterCompletion(true);
```

#### `shaderEffects.setApplyDuringSketch(value)`

Control whether shaders are applied during sketch rendering:

```javascript
shaderEffects.setApplyDuringSketch(false); // Only apply when complete
```

### Utility Methods

#### `shaderEffects.loadShader(name, fragPath, vertPath)`

Load an additional shader at runtime:

```javascript
shaderEffects.loadShader("distort", "distort/fragment.frag");
```

#### `shaderEffects.getLoadedShaders()`

Get array of loaded shader names:

```javascript
const shaders = shaderEffects.getLoadedShaders();
console.log(shaders); // ["copy", "deform", "chromatic", "grain"]
```

## Animation Patterns

### Static Effects (Apply Once)

```javascript
function setup() {
	// ... setup code ...

	shaderEffects.setApplyDuringSketch(false);
	shaderEffects.setContinueAfterCompletion(false);
}

function draw() {
	// Draw your sketch
	mainCanvas.background(220);
	// ... drawing code ...

	// Apply shaders once at the end
	if (frameCount === maxFrames) {
		shaderEffects.apply();
	}
}
```

### Animated Effects During Sketch

```javascript
function setup() {
	// ... setup code ...

	shaderEffects.setApplyDuringSketch(true);
}

function draw() {
	// Draw your sketch
	mainCanvas.background(220);
	// ... drawing code ...

	// Update and apply shaders every frame
	shaderEffects.updateTime(0.01);
	shaderEffects.apply();
}
```

### Continue Animation After Sketch Complete

```javascript
function setup() {
	// ... setup code ...

	shaderEffects.setContinueAfterCompletion(true);
	shaderEffects.setFrameRate(60); // Match your draw speed
}

// Use custom animation loop (see sketch.js for example)
```

## Shader Pipeline

The shader effects are applied in the order they appear in `effectsConfig`:

1. mainCanvas (your artwork)
2. → Effect 1 (e.g., deform)
3. → Effect 2 (e.g., chromatic)
4. → Effect 3 (e.g., grain)
5. → shaderCanvas (final output)

Only enabled effects are included in the pipeline.

## Tips

1. **Keep sketch-specific config in sketch-shaders.js**: Don't modify the utility files (`shaderManager.js`, `shaderPipeline.js`) - they're reusable across projects.

2. **Customize for each project**: Copy `sketch-shaders.js` to new projects and modify the `effectsConfig` and shader loading as needed.

3. **Performance**: Disable effects you don't need, or set `enabled: false` in the config.

4. **Time sync**: Use `setFrameRate()` to match your p5.js frameRate for smooth animations.

5. **Debugging**: Use `applyCopy()` to bypass shaders and see the raw canvas output.

## Example: Minimal Setup

```javascript
// sketch.js
let mainCanvas, shaderCanvas;

function preload() {
	shaderEffects.preload(this);
}

function setup() {
	mainCanvas = createGraphics(400, 400);
	shaderCanvas = createCanvas(400, 400, WEBGL);
	shaderEffects.setup(400, 400, mainCanvas, shaderCanvas);
}

function draw() {
	mainCanvas.background(0);
	mainCanvas.fill(255);
	mainCanvas.circle(200, 200, 100);

	shaderEffects.updateTime(0.01);
	shaderEffects.apply();
}
```

That's it! Your shaders are now modular and reusable across projects.
