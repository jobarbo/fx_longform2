/**
 * Sketch Shader Effects
 *
 * A modular, plug-and-play shader effects system for p5.js projects.
 * This file contains all shader-related code and configuration, keeping sketch.js clean.
 *
 * Features:
 * - Easy configuration of multiple shader effects
 * - Dynamic enable/disable of effects
 * - Animated shader parameters with time control
 * - Seamless integration with ShaderManager and ShaderPipeline
 * - Reusable across projects with minimal setup
 *
 * Usage:
 * 1. In preload(): shaderEffects.preload(this)
 * 2. In setup(): shaderEffects.setup(width, height, mainCanvas, shaderCanvas)
 * 3. To apply shaders: shaderEffects.apply()
 * 4. To update time: shaderEffects.updateTime()
 */
class ShaderEffects {
	constructor() {
		// Shader animation control
		this.continueShadersAfterCompletion = true; // Set to false to stop shaders when sketch is done
		this.applyShadersDuringSketch = false; // Set to true to apply shaders while sketching
		this.shaderFrameRate = 60; // Frame rate for shader animation

		// Animation state
		this.shaderTime = 0;
		this.shaderSeed = 0;
		this.particleAnimationComplete = false;

		// Canvas references
		this.mainCanvas = null;
		this.shaderCanvas = null;

		// Shader system references
		this.shaderManager = null;
		this.shaderPipeline = null;
		this.p5Instance = null;

		// Effects configuration - customize these for your sketch
		this.effectsConfig = {
			deform: {
				enabled: false,
				amount: 0.1,
				timeMultiplier: 0.0,
				octave: 4.0,
				noiseScale: 15.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed",
					uAmount: "amount",
					uOctave: "octave",
					uNoiseScale: "noiseScale",
				},
			},

			collage: {
				enabled: false,
				amount: 1.0,
				tileSize: 255.0,
				tileSize2: 50.0,
				tileSize3: 100.0,
				sizeNoise: 23.0,
				rotNoise: 24.0,
				timeMultiplier: 0.0,
				uniforms: {
					uSeed: "shaderSeed + 2222.0",
					uTileSize1: "tileSize",
					uTileSize2: "tileSize2",
					uTileSize3: "tileSize3",
					uSizeNoise: "sizeNoise",
					uRotNoise: "rotNoise",
					uAmount: "amount",
					uResolution: "[width, height]",
				},
			},

			chromatic: {
				enabled: true,
				amount: 0.005,
				timeMultiplier: 0.02,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 777.0",
					uAmount: "amount",
				},
			},

			grain: {
				enabled: false,
				amount: 0.05,
				timeMultiplier: 0.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 345.0",
					uAmount: "amount",
				},
			},

			pixelSort: {
				enabled: true,
				angle: 0.0, // 0 = vertical, Math.PI/2 = horizontal
				threshold: 0.3,
				sortAmount: 0.8,
				sampleCount: 32.0, // Number of samples (8-64, higher = better quality but slower)
				timeMultiplier: 1.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 999.0",
					uAngle: "angle",
					uThreshold: "threshold",
					uSortAmount: "sortAmount",
					uSampleCount: "sampleCount",
					uResolution: "[width, height]",
				},
			},

			pixelChecker: {
				enabled: true,
				crtMode: true, // true = CRT mode (RGB stripes), false = Checkerboard mode
				darkness: 0.2, // 0.0 = no effect, 1.0 = strong effect
				brightness: 0.0, // 0.0 = no effect, higher = brighter
				cellSize: 3.0, // CRT: 3-6 for visible effect, Checker: 1.0 for 1px, 2.0 for 2x2
				uniforms: {
					uResolution: "[width, height]",
					uCrtMode: "crtMode",
					uDarkness: "darkness",
					uBrightness: "brightness",
					uCellSize: "cellSize",
				},
			},
		};

		// Performance: Flag to track if shader passes have been built
		this.passesBuilt = false;
	}

	/**
	 * Preload shaders - call this in p5 preload()
	 * Customize the shaders you load for your sketch
	 * @param {p5} p5Instance - The p5 instance
	 */
	preload(p5Instance) {
		this.p5Instance = p5Instance;

		// Initialize the global shader manager instance
		shaderManager.init(p5Instance);

		// Set default vertex shader
		shaderManager.setDefaultVertex("chromatic-aberration/vertex.vert");

		// Load shaders - customize this list for your sketch
		shaderManager.loadShader("copy", "copy/fragment.frag", "copy/vertex.vert");
		shaderManager.loadShader("deform", "deform/fragment.frag", "deform/vertex.vert");
		shaderManager.loadShader("chromatic", "chromatic-aberration/fragment.frag", "chromatic-aberration/vertex.vert");
		shaderManager.loadShader("grain", "grain/fragment.frag", "grain/vertex.vert");
		shaderManager.loadShader("collage", "collage-rotate/fragment.frag", "collage-rotate/vertex.vert");
		shaderManager.loadShader("pixelSort", "pixel-sort/fragment.frag", "pixel-sort/vertex.vert");
		shaderManager.loadShader("pixelChecker", "pixel-checker/fragment.frag", "pixel-checker/vertex.vert");

		this.shaderManager = shaderManager;

		return this;
	}

	/**
	 * Setup shader effects - call this in p5 setup()
	 * @param {number} width - Canvas width
	 * @param {number} height - Canvas height
	 * @param {p5.Graphics} mainCanvas - Main graphics buffer for artwork
	 * @param {p5.Graphics} shaderCanvas - WEBGL canvas for shader effects
	 */
	setup(width, height, mainCanvas, shaderCanvas) {
		this.mainCanvas = mainCanvas;
		this.shaderCanvas = shaderCanvas;

		// Initialize shader seed with fxhash if available
		if (typeof fxrand === "function") {
			this.shaderSeed = fxrand() * 10000;
		} else {
			this.shaderSeed = Math.random() * 10000;
		}

		// Initialize shader pipeline with enabled effects
		const enabledEffects = Object.keys(this.effectsConfig).filter((name) => this.effectsConfig[name].enabled);

		this.shaderPipeline = new ShaderPipeline(this.shaderManager, this.p5Instance).init(width, height, enabledEffects);

		// Make it globally accessible (for backward compatibility)
		window.shaderPipeline = this.shaderPipeline;

		return this;
	}

	/**
	 * Add a new shader effect programmatically
	 * @param {string} effectName - Name of the effect
	 * @param {object} config - Effect configuration
	 */
	addEffect(effectName, config) {
		this.effectsConfig[effectName] = {
			enabled: config.enabled || false,
			...config,
			uniforms: config.uniforms || {},
		};
		this.passesBuilt = false; // Mark for rebuild
		return this;
	}

	/**
	 * Enable or disable an effect
	 * @param {string} effectName - Name of the effect
	 * @param {boolean} enabled - Enable or disable
	 */
	setEffectEnabled(effectName, enabled) {
		if (this.effectsConfig[effectName]) {
			this.effectsConfig[effectName].enabled = enabled;
			this.passesBuilt = false; // Mark for rebuild
			this.reinitializePipeline();
		}
		return this;
	}

	/**
	 * Update an effect parameter
	 * @param {string} effectName - Name of the effect
	 * @param {string} paramName - Parameter name
	 * @param {*} value - New value
	 */
	updateEffectParam(effectName, paramName, value) {
		if (this.effectsConfig[effectName] && this.effectsConfig[effectName][paramName] !== undefined) {
			this.effectsConfig[effectName][paramName] = value;
		}
		return this;
	}

	/**
	 * Reinitialize shader pipeline when effects change
	 */
	reinitializePipeline() {
		if (this.shaderPipeline && this.shaderManager) {
			const enabledEffects = Object.keys(this.effectsConfig).filter((name) => this.effectsConfig[name].enabled);
			this.shaderPipeline.init(this.mainCanvas.width, this.mainCanvas.height, enabledEffects);
			this.passesBuilt = false; // Mark for rebuild
		}
		return this;
	}

	/**
	 * Set shader frame rate
	 * @param {number} fps - Frame rate (1-120)
	 */
	setFrameRate(fps) {
		this.shaderFrameRate = Math.max(1, Math.min(120, fps));
		console.log(`Shader frame rate set to ${this.shaderFrameRate}fps`);
		return this;
	}

	/**
	 * Update shader time - call this in your animation loop
	 * @param {number} delta - Time delta (default: 0.01)
	 */
	updateTime(delta = 0.01) {
		this.shaderTime += delta;
		return this;
	}

	/**
	 * Evaluate uniform value from string expression
	 * @param {string|*} value - Value or expression
	 * @param {object} effect - Effect configuration
	 * @returns {*} Evaluated value
	 */
	evaluateUniformValue(value, effect) {
		if (typeof value === "string") {
			// Handle special cases
			if (value === "[width, height]") {
				return [this.mainCanvas.width, this.mainCanvas.height];
			}

			// Handle expressions like 'shaderSeed + 777.0'
			if (value.includes("+") || value.includes("-") || value.includes("*") || value.includes("/")) {
				try {
					// Create a safe evaluation context with available variables
					const evalContext = {
						shaderTime: this.shaderTime,
						shaderSeed: this.shaderSeed,
						width: this.mainCanvas.width,
						height: this.mainCanvas.height,
						...effect, // Include effect properties
					};

					// Replace variable names with their values
					let evalString = value;
					for (const [varName, varValue] of Object.entries(evalContext)) {
						if (typeof varValue === "number") {
							evalString = evalString.replace(new RegExp(`\\b${varName}\\b`, "g"), varValue);
						}
					}

					return eval(evalString);
				} catch (error) {
					console.warn(`Failed to evaluate uniform value "${value}":`, error);
					return 0;
				}
			}

			// Handle property references from the effect config
			if (value in effect) {
				return effect[value];
			}

			// Handle global variable references
			if (value === "shaderTime") return this.shaderTime;
			if (value === "shaderSeed") return this.shaderSeed;
			if (value === "width") return this.mainCanvas.width;
			if (value === "height") return this.mainCanvas.height;

			// Try to evaluate as a simple variable reference
			try {
				return eval(value);
			} catch (error) {
				console.warn(`Failed to evaluate uniform value "${value}":`, error);
				return 0;
			}
		}

		return value;
	}

	/**
	 * Apply shader effects to the main canvas
	 * Call this in your render loop
	 */
	apply() {
		if (!this.shaderManager || !this.mainCanvas) {
			console.warn("ShaderEffects not properly initialized");
			return this;
		}

		// Clear the shader canvas (use p5Instance for global clear)
		if (this.p5Instance && this.p5Instance.clear) {
			this.p5Instance.clear();
		}

		// Build effect passes only once (or when passesBuilt flag is reset)
		if (!this.passesBuilt) {
			this.shaderPipeline.clearPasses();

			// Iterate through effectsConfig to build passes
			for (const effectName in this.effectsConfig) {
				const effect = this.effectsConfig[effectName];
				if (effect.enabled) {
					this.shaderPipeline.addPass(effectName, () => {
						const uniforms = {};
						for (const uniformName in effect.uniforms) {
							const value = effect.uniforms[uniformName];
							uniforms[uniformName] = this.evaluateUniformValue(value, effect);
						}
						return uniforms;
					});
				}
			}

			this.passesBuilt = true;
		}

		// Run pipeline from mainCanvas to the shader canvas
		this.shaderPipeline.run(this.mainCanvas);

		return this;
	}

	/**
	 * Apply copy shader (just display the main canvas without effects)
	 */
	applyCopy() {
		if (!this.shaderManager || !this.mainCanvas) {
			return this;
		}

		if (this.p5Instance && this.p5Instance.clear) {
			this.p5Instance.clear();
		}

		this.shaderManager.apply("copy", {uTexture: this.mainCanvas}, this.p5Instance).drawFullscreenQuad(this.p5Instance);

		return this;
	}

	/**
	 * Load additional shader dynamically
	 * @param {string} name - Shader name
	 * @param {string} fragPath - Fragment shader path
	 * @param {string} vertPath - Vertex shader path (optional)
	 */
	loadShader(name, fragPath, vertPath = null) {
		if (this.shaderManager) {
			this.shaderManager.loadShader(name, fragPath, vertPath);
			console.log(`Loaded shader: ${name}`);
		}
		return this;
	}

	/**
	 * Get list of loaded shader names
	 * @returns {string[]} Array of shader names
	 */
	getLoadedShaders() {
		if (this.shaderManager && this.shaderManager.shaders) {
			return Object.keys(this.shaderManager.shaders);
		}
		return [];
	}

	/**
	 * Mark particle animation as complete
	 */
	setParticleAnimationComplete(complete = true) {
		this.particleAnimationComplete = complete;
		return this;
	}

	/**
	 * Check if shaders should continue after completion
	 * @returns {boolean}
	 */
	shouldContinueAfterCompletion() {
		return this.continueShadersAfterCompletion;
	}

	/**
	 * Set whether shaders should continue after sketch completion
	 * @param {boolean} value - Continue or not
	 */
	setContinueAfterCompletion(value) {
		this.continueShadersAfterCompletion = value;
		return this;
	}

	/**
	 * Set whether to apply shaders during sketch rendering
	 * @param {boolean} value - Apply or not
	 */
	setApplyDuringSketch(value) {
		this.applyShadersDuringSketch = value;
		return this;
	}

	/**
	 * Check if shaders should be applied during sketch
	 * @returns {boolean}
	 */
	shouldApplyDuringSketch() {
		return this.applyShadersDuringSketch;
	}

	/**
	 * Get current shader frame rate
	 * @returns {number}
	 */
	getFrameRate() {
		return this.shaderFrameRate;
	}

	/**
	 * Render frame - handles shader logic for each animation frame
	 * @param {boolean} isSketchComplete - Whether the sketch animation is complete
	 * @param {Function} continueCallback - Callback to continue animation loop
	 * @returns {boolean} Whether to continue the animation loop
	 */
	renderFrame(isSketchComplete, continueCallback) {
		if (isSketchComplete) {
			// Always apply shaders at least once when sketch is complete
			if (!this.shouldApplyDuringSketch()) {
				this.apply();
			}

			if (this.shouldContinueAfterCompletion()) {
				// Keep shaders running even after particles are complete
				this.updateTime(0.01);
				this.apply();

				// Continue using requestAnimationFrame
				return true;
			} else {
				// Stop everything when sketch is complete
				console.log("Sketch complete - shaders stopped");
				return false;
			}
		}

		// Update shader time during sketching
		this.updateTime(0.01);

		// Only apply shaders during sketching if enabled
		if (this.shouldApplyDuringSketch()) {
			this.apply();
		} else {
			// If not applying shaders during sketching, use copy shader to display base sketch
			this.applyCopy();
		}

		return true; // Continue animation
	}
}

// Create a global instance for easy access
const shaderEffects = new ShaderEffects();
