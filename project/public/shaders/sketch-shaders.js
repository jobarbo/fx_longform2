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
		this.applyShadersDuringSketch = true; // Set to true to apply shaders while sketching
		this.shaderFrameRate = 60; // Frame rate for shader animation

		// Animation state
		this.shaderTime = 0;
		this.shaderSeed = 0;
		this.particleAnimationComplete = false;
		this.loadingProgress = 0.0; // Loading progress from 0.0 (0%) to 1.0 (100%)

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

			grain: {
				enabled: true,
				amount: 0.1,
				timeMultiplier: 0.0,
				// Spatial threshold (UV 0-1): grain visible only inside this rectangle
				thresholdMinX: 0.0, // left [0..1]
				thresholdMaxX: 1.0, // right [0..1]
				thresholdMinY: 0.0, // bottom [0..1]
				thresholdMaxY: 1.0, // top [0..1]
				thresholdSmooth: 0.001, // soft edge at boundaries (0 = hard edge)
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 345.0",
					uAmount: "amount",
					uThresholdMinX: "thresholdMinX",
					uThresholdMaxX: "thresholdMaxX",
					uThresholdMinY: "thresholdMinY",
					uThresholdMaxY: "thresholdMaxY",
					uThresholdSmooth: "thresholdSmooth",
				},
			},

			pixelSort: {
				enabled: false,
				angle: 0.0, // 0 = vertical, Math.PI/2 = horizontal
				threshold: 0.3,
				sortAmount: 2.8,
				sampleCount: 1.0, // Number of samples (8-64, higher = better quality but slower)
				invert: 1.0, // 0.0 = sort bright pixels, 1.0 = sort dark pixels
				sortMode: 1.0, // 1.0 = sine wave, 2.0 = noise, 3.0 = FBM, 4.0 = vector field
				timeMultiplier: 0.3,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 999.0",
					uAngle: "angle",
					uThreshold: "threshold",
					uSortAmount: "sortAmount",
					uSampleCount: "sampleCount",
					uInvert: "invert",
					uSortMode: "sortMode",
					uResolution: "[width, height]",
				},
			},

			symmetry: {
				enabled: false,
				symmetryMode: 2.0, // 0=horizontal, 1=vertical, 2=2-line, 3=4-line, 4=8-line, 5=16-line, 6=radial
				amount: 1.0, // Blend strength [0..1]
				debug: 0.0, // 0.0 = normal, 1.0 = debug mode (shows fold lines and center)
				translationSpeed: 1.5, // Speed of horizontal/vertical movement
				translationMode: 0.0, // 0=sine, 1=noise, 2=FBM, 3=vector field
				translationNoiseScale: 0.2, // Scale of noise variation (lower = smoother, higher = more frequent changes)
				rotationSpeed: 0.0, // Speed of rotation
				rotationOscillationSpeed: 0.0, // Speed of oscillation (controls how fast it alternates between positive/negative)
				rotationStartingAngle: 0.5, // Starting angle for rotation (in radians, added to rotation)
				rotationMode: 0.0, // 0=cosine oscillation, 1=noise, 2=FBM
				rotationNoiseScale: 0.3, // Scale of rotation noise (lower = smoother, higher = more frequent changes)
				timeMultiplier: 0.1, // Time multiplier for animation
				uniforms: {
					uResolution: "[width, height]",
					uSeed: "shaderSeed + 1234.0",
					uSymmetryMode: "symmetryMode",
					uAmount: "amount",
					uDebug: "debug",
					uTime: "shaderTime * timeMultiplier",
					uTranslationSpeed: "translationSpeed",
					uTranslationMode: "translationMode",
					uTranslationNoiseScale: "translationNoiseScale",
					uRotationSpeed: "rotationSpeed",
					uRotationOscillationSpeed: "rotationOscillationSpeed",
					uRotationStartingAngle: "rotationStartingAngle",
					uRotationMode: "rotationMode",
					uRotationNoiseScale: "rotationNoiseScale",
				},
			},
			symmetry2: {
				enabled: false,
				symmetryMode: 2.0, // 0=horizontal, 1=vertical, 2=2-line, 3=4-line, 4=8-line, 5=16-line, 6=radial
				amount: 1.0, // Blend strength [0..1]
				debug: 0.0, // 0.0 = normal, 1.0 = debug mode (shows fold lines and center)
				translationSpeed: 1.5, // Speed of horizontal/vertical movement
				translationMode: 0.0, // 0=sine, 1=noise, 2=FBM, 3=vector field
				translationNoiseScale: 0.2, // Scale of noise variation (lower = smoother, higher = more frequent changes)
				rotationSpeed: 0.0, // Speed of rotation
				rotationOscillationSpeed: 0.0, // Speed of oscillation (controls how fast it alternates between positive/negative)
				rotationStartingAngle: 0.5, // Starting angle for rotation (in radians, added to rotation)
				rotationMode: 0.0, // 0=cosine oscillation, 1=noise, 2=FBM
				rotationNoiseScale: 0.3, // Scale of rotation noise (lower = smoother, higher = more frequent changes)
				timeMultiplier: 0.1, // Time multiplier for animation
				uniforms: {
					uResolution: "[width, height]",
					uSeed: "shaderSeed + 1234.0",
					uSymmetryMode: "symmetryMode",
					uAmount: "amount",
					uDebug: "debug",
					uTime: "shaderTime * timeMultiplier",
					uTranslationSpeed: "translationSpeed",
					uTranslationMode: "translationMode",
					uTranslationNoiseScale: "translationNoiseScale",
					uRotationSpeed: "rotationSpeed",
					uRotationOscillationSpeed: "rotationOscillationSpeed",
					uRotationStartingAngle: "rotationStartingAngle",
					uRotationMode: "rotationMode",
					uRotationNoiseScale: "rotationNoiseScale",
				},
			},

			loaderGlitch: {
				enabled: false, // Enable to show glitch loader animation
				timeMultiplier: 0.3, // Speed of block movement
				uniforms: {
					uProgress: "loadingProgress", // Progress from 0.0 (0%) to 1.0 (100%)
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 8888.0",
					uResolution: "[width, height]",
				},
			},

			zoom: {
				enabled: true,
				timeMultiplier: 1.0,
				zoomSpeed: 1.0,
				zoomAmount: 0.95,
				zoomOutAmount: 0.85,
				zoomInAmount: 1.15,
				animateZoom: 0.0,
				center: [0.5, 0.5],
				easingMode: 0.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uZoomSpeed: "zoomSpeed",
					uZoomAmount: "zoomAmount",
					uZoomOutAmount: "zoomOutAmount",
					uZoomInAmount: "zoomInAmount",
					uAnimateZoom: "animateZoom",
					uCenter: "center",
					uEasingMode: "easingMode",
				},
			},

			pixelGrid: {
				enabled: false,
				gridSize: [422.0, 422.0],
				cellRatio: 0.1,
				gridMode: 1.0,
				diffuse: 1.5,
				gapSize: 0.0,
				gapBrightness: 0.7,
				uniforms: {
					uResolution: "[width, height]",
					uGridSize: "gridSize",
					uCellRatio: "cellRatio",
					uMode: "gridMode",
					uDiffuse: "diffuse",
					uGapSize: "gapSize",
					uGapBrightness: "gapBrightness",
				},
			},

			dither: {
				enabled: true,
				ditherMode: 0.0, // 0=bayer4, 1=bayer8, 2=hash, 3=line, 4=clustered
				levels: 1.0,
				mix: 1.0,
				strength: 1.0,
				scale: 1.0,
				colorMode: 1.0, // 0=luma quantize, 1=per-channel quantize
				uniforms: {
					uResolution: "[width, height]",
					uDitherMode: "ditherMode",
					uLevels: "levels",
					uMix: "mix",
					uStrength: "strength",
					uScale: "scale",
					uColorMode: "colorMode",
					uSeed: "shaderSeed + 4321.0",
				},
			},
			colorQuantize: {
				enabled: true,
				levels: 3.0,
				mix: 1.0,
				uniforms: {
					uLevels: "levels",
					uMix: "mix",
				},
			},
			chromatic: {
				enabled: true,
				amount: 0.00015,
				timeMultiplier: 0.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 777.0",
					uAmount: "amount",
				},
			},

			crtDisplay: {
				enabled: true,
				brightness: 0.0,
				cellSize: 2.0,
				gapOpacity: 0.0,
				rgbOpacity: 0.0,
				rgbGain: [1.0, 1.0, 1.0],
				dotRadius: 0.41,
				dotFalloff: 0.4,
				filterMode: 0.0,
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
			blur: {
				enabled: true,
				blurMode: 1.0, // 0=gaussian, 1=radial, 2=directional
				blurAmount: 43.0, // Blur radius/intensity in pixels
				blurQuality: 120.0, // Sampling quality (1-8, higher = better but slower)
				blurDirection: 0, // Angle in radians for directional mode
				blurCenter: [0.5, 0.5], // Center for radial mode (normalized 0-1)
				blurStart: 0.6, // Radial mode: starting radius (0-1, blur kicks in beyond this distance)
				blurCrt: 1.0, // Radial mode: 0.0 = circular, 1.0 = super-ellipse (CRT shape)
				blurCrtPower: 27.0, // Super-ellipse exponent (2.0 = ellipse, 4.0+ = more rectangular/CRT-like)
				blurMin: 0.0, // Radial mode: minimum blur amount at blurStart (0 = sharp center, >0 = always some blur)
				uniforms: {
					uResolution: "[width, height]",
					uBlurMode: "blurMode",
					uBlurAmount: "blurAmount",
					uBlurQuality: "blurQuality",
					uBlurDirection: "blurDirection",
					uBlurCenter: "blurCenter",
					uBlurStart: "blurStart",
					uBlurCrt: "blurCrt",
					uBlurCrtPower: "blurCrtPower",
					uBlurMin: "blurMin",
				},
			},

			crtWarp: {
				enabled: true,
				warpAmount: 0.25,
				aspectCorrect: 0.0,
				borderColor: 2.0,
				vignette: 0.5,
				cornerSmooth: 0.015,
				cornerRadius: 0.1,
				boundsInset: 0.075,
				rgbGain: [1.0, 1.0, 1.0],
				uniforms: {
					uResolution: "[width, height]",
					uWarpAmount: "warpAmount",
					uAspectCorrect: "aspectCorrect",
					uCornerRadius: "cornerRadius",
					uCornerSmooth: "cornerSmooth",
					uBorderColor: "borderColor",
					uVignette: "vignette",
					uBoundsInset: "boundsInset",
					uRgbGain: "rgbGain",
				},
			},
			glitchDisplacement: {
				enabled: true,
				timeMultiplier: 21.0,
				intensity: 6.6,
				lineDensity: 12310.0,
				speed: 100.0,
				threshold: 0.85,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uResolution: "[width, height]",
					uIntensity: "intensity",
					uLineDensity: "lineDensity",
					uSpeed: "speed",
					uThreshold: "threshold",
				},
			},
		};

		// Cache for last enabled effects (to detect changes)
		this.lastEnabledEffects = null;

		// FPS tracking
		// Disable FPS counter on Safari mobile to prevent crashes
		// Also disable FPS counter when in iframe
		// NOTE: actual default is finalized in setup() so a sketch-level config constant
		// (declared in sketch.js) can control it.
		this.showFPS = false;
		this.fpsHistory = [];
		this.fpsHistorySize = 60; // Average over 60 frames
		this.lastFrameTime = performance.now();
		this.currentFPS = 60;
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
		shaderManager.loadShader("symmetry", "symmetry/fragment.frag", "symmetry/vertex.vert");
		shaderManager.loadShader("symmetry2", "symmetry/fragment.frag", "symmetry/vertex.vert");
		shaderManager.loadShader("loaderGlitch", "loader-glitch/fragment.frag", "loader-glitch/vertex.vert");
		shaderManager.loadShader("zoom", "zoom/fragment.frag", "zoom/vertex.vert");
		shaderManager.loadShader("pixelGrid", "pixel-grid/fragment.frag", "pixel-grid/vertex.vert");
		shaderManager.loadShader("colorQuantize", "color-quantize/fragment.frag", "color-quantize/vertex.vert");
		shaderManager.loadShader("dither", "dither/fragment.frag", "dither/vertex.vert");
		shaderManager.loadShader("crtWarp", "crt-warp/fragment.frag", "crt-warp/vertex.vert");
		shaderManager.loadShader("blur", "blur/fragment.frag", "blur/vertex.vert");
		shaderManager.loadShader("glitchDisplacement", "glitch-displacement/fragment.frag", "glitch-displacement/vertex.vert");

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

		// FPS overlay default (can be controlled by sketch-level constant SHOW_FPS_UI)
		const isSafariMobileCheck = typeof isSafariMobile === "function" && isSafariMobile();
		const isInIframeCheck = typeof isInIframe === "function" && isInIframe();
		const allowFpsUi = typeof SHOW_FPS_UI === "undefined" ? true : !!SHOW_FPS_UI;
		this.showFPS = allowFpsUi && !isSafariMobileCheck && !isInIframeCheck;

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
	 * Update loading progress - call this to sync with loading percentage
	 * @param {number} progress - Loading progress from 0.0 (0%) to 1.0 (100%)
	 */
	setLoadingProgress(progress) {
		this.loadingProgress = Math.max(0.0, Math.min(1.0, progress));
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
			if (value === "loadingProgress") return this.loadingProgress;
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
	 * Update FPS counter
	 */
	updateFPS() {
		// Skip FPS tracking if disabled
		if (!this.showFPS) return;

		const now = performance.now();
		const delta = now - this.lastFrameTime;
		this.lastFrameTime = now;

		// Calculate instantaneous FPS
		const instantFPS = 1000 / delta;

		// Add to history
		this.fpsHistory.push(instantFPS);
		if (this.fpsHistory.length > this.fpsHistorySize) {
			this.fpsHistory.shift();
		}

		// Calculate average FPS
		const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
		this.currentFPS = Math.round(sum / this.fpsHistory.length);
	}

	/**
	 * Draw FPS counter on screen (using DOM overlay for better visibility)
	 */
	drawFPS() {
		try {
			// Don't show FPS if in iframe
			if (typeof isInIframe === "function" && isInIframe()) {
				return;
			}

			// Create or update FPS overlay element
			let fpsElement = document.getElementById("shader-fps-overlay");
			if (!fpsElement) {
				fpsElement = document.createElement("div");
				fpsElement.id = "shader-fps-overlay";
				document.body.appendChild(fpsElement);
			}

			// Hide if FPS is disabled
			if (!this.showFPS) {
				fpsElement.style.display = "none";
				return;
			}

			fpsElement.style.display = "block";

			// Get canvas position
			const canvas = document.querySelector("canvas");
			if (!canvas) return;

			const canvasRect = canvas.getBoundingClientRect();

			// Update position to match canvas
			fpsElement.style.position = "fixed";
			fpsElement.style.left = canvasRect.left + 10 + "px";
			fpsElement.style.top = canvasRect.top + 10 + "px";
			fpsElement.style.zIndex = "10000";

			// Color based on performance
			let textColor;
			if (this.currentFPS >= 55) {
				textColor = "#64ff64"; // Green
			} else if (this.currentFPS >= 30) {
				textColor = "#ffc864"; // Orange
			} else {
				textColor = "#ff6464"; // Red
			}

			// Update content
			fpsElement.innerHTML = `
				<div style="
					background: rgba(0, 0, 0, 0.7);
					padding: 8px 12px;
					border-radius: 4px;
					font-family: 'Courier New', monospace;
					font-size: 16px;
					color: ${textColor};
					font-weight: bold;
				">
					FPS: ${this.currentFPS}
				</div>
			`;
		} catch (error) {
			// Silently fail if DOM operations crash (common on Safari mobile)
			console.warn("FPS counter failed:", error);
		}
	}

	/**
	 * Toggle FPS display
	 * @param {boolean} show - Show or hide FPS
	 */
	toggleFPS(show = null) {
		// Respect sketch-level UI toggle if present
		if (typeof SHOW_FPS_UI !== "undefined" && !SHOW_FPS_UI) return;
		if (show === null) {
			this.showFPS = !this.showFPS;
		} else {
			this.showFPS = show;
		}
		return this;
	}

	/**
	 * Render frame - handles shader logic for each animation frame
	 * @param {boolean} isSketchComplete - Whether the sketch animation is complete
	 * @param {Function} continueCallback - Callback to continue animation loop
	 * @returns {boolean} Whether to continue the animation loop
	 */
	renderFrame(isSketchComplete, continueCallback) {
		// Update FPS counter
		this.updateFPS();

		if (isSketchComplete) {
			// Always apply shaders at least once when sketch is complete
			if (!this.shouldApplyDuringSketch()) {
				this.apply();
			}

			if (this.shouldContinueAfterCompletion()) {
				// Keep shaders running even after particles are complete
				this.updateTime(0.01);
				this.apply();

				// Draw FPS counter
				this.drawFPS();

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

		// Draw FPS counter
		this.drawFPS();

		return true; // Continue animation
	}
}

// Create a global instance for easy access
const shaderEffects = new ShaderEffects();
