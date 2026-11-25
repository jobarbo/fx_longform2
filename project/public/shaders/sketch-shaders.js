/**
 * Sketch shader setup — the only shader file to edit per sketch.
 *
 * The ShaderEffects class lives in the library (library/utils/shaderEffects.js) and
 * every shader of library/shaders/catalog.js is loaded and available in the panel's
 * "add effect" menu automatically. New library shaders need no change here.
 *
 * Usage in sketch.js:
 * 1. In async setup(): await shaderEffects.preload(window)
 * 2. In setup(): shaderEffects.setup(width, height, mainCanvas, shaderCanvas)
 * 3. Per frame: shaderEffects.renderFrame(isSketchComplete)
 */

const shaderEffects = new ShaderEffects({
	// Effects in the stack at startup (order = pass order).
	defaultStack: ["chromatic", "grain"],

	// Per-sketch values on top of the catalog defaults (only the keys you want to pin).
	// Pinning the startup stack keeps the artwork stable if catalog defaults change.
	overrides: {
		chromatic: {
			amount: 0.001,
			timeMultiplier: 0.0,
		},
		grain: {
			amount: 0.1,
			grainSize: 1.0,
			angle: 0.25,
			timeMultiplier: 0.0,
			thresholdMinX: 0.0,
			thresholdMaxX: 1.0,
			thresholdMinY: 0.0,
			thresholdMaxY: 1.0,
			thresholdSmooth: 0.001,
		},
	},

	// localStorage key for the shader panel's saved state (unique per sketch).
	storageKey: "fx_longform2:shaderPanel",

	// Output framing (sketch.js can still override with SHADER_RENDER_RATIO).
	renderRatio: {fitCanvas: true, width: 1, height: 1},
	crispPixels: false, // true = NEAREST sampling + CSS pixelated
	continueAfterCompletion: true, // false = stop shaders when the sketch is done
	applyDuringSketch: true, // false = plain copy while drawing, shaders once complete
});
