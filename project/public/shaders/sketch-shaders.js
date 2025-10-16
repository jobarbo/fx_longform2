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

		// Audio analyzer reference
		this.audioAnalyzer = null;
		this.audioEnabled = false;

		// Effects configuration - customize these for your sketch
		this.effectsConfig = {
			deform: {
				enabled: false,
				amount: 0.1,
				timeMultiplier: 0.0,
				octave: 4.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed",
					uAmount: "amount",
					uOctave: "octave",
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
				amount: 0.0025,
				timeMultiplier: 0.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 777.0",
					// Pulses with audio energy (comment out for static effect)
					uAmount: "amount * (1 + audioEnergy * 3)",
				},
			},

			grain: {
				enabled: false,
				amount: 0.1,
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
				sortAmount: 2.8,
				sampleCount: 32.0, // Number of samples (8-64, higher = better quality but slower)
				invert: 0.0, // 0.0 = sort bright pixels, 1.0 = sort dark pixels
				sortMode: 1.0, // 1.0 = sine wave, 2.0 = noise, 3.0 = FBM, 4.0 = vector field
				timeMultiplier: 1.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 999.0",
					// Rotate based on mid frequencies (comment out for static angle)
					uAngle: "angle + audioMid * 3.14159",
					// Threshold modulated by bass (comment out for static threshold)
					uThreshold: "threshold * (0.27 + audioBass * 0.5)",
					uSortAmount: "sortAmount",
					uSampleCount: "sampleCount",
					uInvert: "invert",
					uSortMode: "sortMode",
					uResolution: "[width, height]",
				},
			},

			crtDisplay: {
				enabled: true,
				brightness: 0.15, // Brightness boost (0.0 = none, higher = brighter)
				cellSize: 3.0, // Size of CRT cells/pixels (2-10 typical range)
				gapOpacity: 0.6, // Gap opacity between phosphor dots (0.0 = no gaps, 1.0 = full dark gaps)
				rgbOpacity: 0.5, // RGB color separation opacity (0.0 = no separation, 1.0 = full RGB isolation)
				dotRadius: 0.5, // Size of phosphor dots (0.0-0.5, smaller = larger gaps)
				dotFalloff: 0.99, // Softness of phosphor dot edges (0.0 = sharp, 1.0 = very soft)
				filterMode: 1.0, // Display mode: 0.0 = true pixel display (sample at cell center), 1.0 = filter overlay (sample at actual position)
				uniforms: {
					uResolution: "[width, height]",
					uBrightness: "brightness",
					uCellSize: "cellSize",
					uGapOpacity: "gapOpacity",
					uRgbOpacity: "rgbOpacity",
					uDotRadius: "dotRadius",
					uDotFalloff: "dotFalloff",
					uFilterMode: "filterMode",
				},
			},
		};

		// Cache for last enabled effects (to detect changes)
		this.lastEnabledEffects = null;
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
		shaderManager.loadShader("crtDisplay", "pixel-checker/fragment.frag", "pixel-checker/vertex.vert");

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
	 * Enable audio reactivity
	 * @param {string} source - 'microphone', 'chime', or custom source
	 * @param {object} options - Audio configuration options
	 */
	enableAudio(source = "microphone", options = {}) {
		if (typeof audioAnalyzer !== "undefined") {
			this.audioAnalyzer = audioAnalyzer;
			this.audioAnalyzer.init(source, options);
			this.audioEnabled = true;
			console.log(`Audio reactivity enabled (source: ${source})`);

			// If using chime, initialize it
			if (source === "chime" && typeof midiChime !== "undefined") {
				midiChime.init(options.chimeOptions || {});
				console.log("MIDI Chime initialized - press SPACE to start auto-play");
			}
		} else {
			console.warn("audioAnalyzer not found - make sure audioAnalyzer.js is loaded");
		}
		return this;
	}

	/**
	 * Disable audio reactivity
	 */
	disableAudio() {
		if (this.audioAnalyzer) {
			this.audioAnalyzer.stop();
			this.audioEnabled = false;
			console.log("Audio reactivity disabled");
		}
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
						// Audio variables (safe defaults if audio not enabled)
						audioBass: this.audioEnabled ? this.audioAnalyzer.bass : 0,
						audioMid: this.audioEnabled ? this.audioAnalyzer.mid : 0,
						audioTreble: this.audioEnabled ? this.audioAnalyzer.treble : 0,
						audioVolume: this.audioEnabled ? this.audioAnalyzer.volume : 0,
						audioEnergy: this.audioEnabled ? this.audioAnalyzer.energy : 0,
						audioSubBass: this.audioEnabled ? this.audioAnalyzer.subBass : 0,
						audioLowMid: this.audioEnabled ? this.audioAnalyzer.lowMid : 0,
						audioHighMid: this.audioEnabled ? this.audioAnalyzer.highMid : 0,
						audioPresence: this.audioEnabled ? this.audioAnalyzer.presence : 0,
						audioBeat: this.audioEnabled ? (this.audioAnalyzer.isBeat ? 1.0 : 0.0) : 0,
						audioBPM: this.audioEnabled ? this.audioAnalyzer.bpm : 0,
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

			// Handle audio variable references
			if (this.audioEnabled && this.audioAnalyzer) {
				if (value === "audioBass") return this.audioAnalyzer.bass;
				if (value === "audioMid") return this.audioAnalyzer.mid;
				if (value === "audioTreble") return this.audioAnalyzer.treble;
				if (value === "audioVolume") return this.audioAnalyzer.volume;
				if (value === "audioEnergy") return this.audioAnalyzer.energy;
				if (value === "audioSubBass") return this.audioAnalyzer.subBass;
				if (value === "audioLowMid") return this.audioAnalyzer.lowMid;
				if (value === "audioHighMid") return this.audioAnalyzer.highMid;
				if (value === "audioPresence") return this.audioAnalyzer.presence;
				if (value === "audioBeat") return this.audioAnalyzer.isBeat ? 1.0 : 0.0;
				if (value === "audioBPM") return this.audioAnalyzer.bpm;
			}

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

		// Build effect passes dynamically (only rebuild if effects changed)
		const currentEnabledEffects = Object.keys(this.effectsConfig).filter((name) => this.effectsConfig[name].enabled);

		if (JSON.stringify(this.lastEnabledEffects) !== JSON.stringify(currentEnabledEffects)) {
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

			this.lastEnabledEffects = [...currentEnabledEffects];
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
		// Update MIDI chime if it exists
		if (typeof midiChime !== "undefined" && midiChime.isInitialized) {
			midiChime.update();
		}

		// Update audio analysis if enabled
		if (this.audioEnabled && this.audioAnalyzer) {
			this.audioAnalyzer.update();
		}

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
