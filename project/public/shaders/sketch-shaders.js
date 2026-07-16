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
 * 1. In async setup(): await shaderEffects.preload(window)
 * 2. In setup(): shaderEffects.setup(width, height, mainCanvas, shaderCanvas)
 * 3. To apply shaders: shaderEffects.apply()
 * 4. To update time: shaderEffects.updateTime()
 * 5. Master speed: set SHADER_ANIMATION_SPEED in sketch.js (or shaderEffects.setAnimationSpeed())
 */
class ShaderEffects {
	constructor() {
		// Shader animation control
		this.continueShadersAfterCompletion = true; // Set to false to stop shaders when sketch is done
		this.applyShadersDuringSketch = true; // Set to true to apply shaders while sketching
		this.shaderFrameRate = 60; // Base clock rate (see advanceShaderClock)
		this.animationSpeed = 1.0; // Master speed multiplier — override via setAnimationSpeed() or SHADER_ANIMATION_SPEED in sketch.js

		// Animation state
		this.shaderTime = 0;
		this.shaderSeed = 0;
		this.lastShaderUpdateTime = 0;
		this.particleAnimationComplete = false;
		this.loadingProgress = 0.0; // Loading progress from 0.0 (0%) to 1.0 (100%)

		// Canvas references
		this.mainCanvas = null;
		this.shaderCanvas = null;
		this.pixelDensity = 1;

		// Shader system references
		this.shaderManager = null;
		this.shaderPipeline = null;
		this.p5Instance = null;

		// Output framing — passed to shaderManager.setRenderRatio() in setup().
		// fitCanvas: true = full texture mapped to canvas (no crop).
		// Custom ratios use object-fit: cover on the final pass only.
		this.renderRatio = {
			fitCanvas: true,
			width: 1,
			height: 1,
		};

		// NEAREST sampling + CSS pixelated when true (togglable in shader panel).
		// Default false to preserve this project's smooth (LINEAR) rendering.
		this.crispPixels = false;

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
			pixelSort: {
				enabled: false,
				angle: 0.0, // 0 = vertical, Math.PI/2 = horizontal
				threshold: 0.2,
				sortAmount: 1.8,
				sampleCount: 1.0, // Number of samples (8-64, higher = better quality but slower)
				invert: 0.0, // 0.0 = sort bright pixels, 1.0 = sort dark pixels
				sortMode: 1.0, // 1.0 = sine wave, 2.0 = noise, 3.0 = FBM, 4.0 = vector field
				timeMultiplier: 0.03,
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
				symmetryMode: 0.0, // 0=horizontal, 1=vertical, 2=2-line, 3=4-line, 4=8-line, 5=16-line, 6=radial
				amount: 1.0, // Blend strength [0..1]
				debug: 0.0, // 0.0 = normal, 1.0 = debug mode (shows fold lines and center)
				center: [0.5, 0.5], // symmetry center in normalized coords
				translationEnabled: 1.0, // Master toggle for translation animation
				translationSpeedX: 0.01, // Horizontal translation speed (0 = none)
				translationSpeedY: 0.01, // Vertical translation speed (0 = none)
				translationMode: 3.0, // 0=sine, 1=noise, 2=FBM, 3=vector field, 4=continuous scroll
				translationNoiseScale: 0.5, // Scale of noise variation (lower = smoother, higher = more frequent changes)
				translationPhaseX: -0.5, // Accumulated phase for X translation (prevents jumps)
				translationPhaseY: 0.5, // Accumulated phase for Y translation (prevents jumps)
				rotationEnabled: 1.0, // Master toggle for animated rotation
				rotationSpeed: 0.01, // Speed of rotation
				rotationOscillationSpeed: 0.5, // Speed of oscillation (controls how fast it alternates between positive/negative)
				rotationStartingAngle: 0.0, // Static rotation in degrees [0..360] (applied even when animation is off)
				rotationMode: 1.0, // 0=cosine oscillation, 1=noise, 2=FBM
				rotationNoiseScale: 0.1, // Scale of rotation noise (lower = smoother, higher = more frequent changes)
				rotationPhase: 0.0, // Accumulated phase for rotation (prevents jumps)
				rotationAmplitude: 50.0, // Fixed amplitude - speed controls phase accumulation rate, not amplitude
				timeMultiplier: 0.4, // Time multiplier for animation
				uniforms: {
					uResolution: "[width, height]",
					uSeed: "shaderSeed + 1234.0",
					uSymmetryMode: "symmetryMode",
					uAmount: "amount",
					uDebug: "debug",
					uCenter: "center",
					uTime: "shaderTime * timeMultiplier",
					uTranslationEnabled: "translationEnabled",
					uTranslationSpeedX: "translationSpeedX",
					uTranslationSpeedY: "translationSpeedY",
					uTranslationMode: "translationMode",
					uTranslationNoiseScale: "translationNoiseScale",
					uTranslationPhaseX: "translationPhaseX",
					uTranslationPhaseY: "translationPhaseY",
					uRotationEnabled: "rotationEnabled",
					uRotationSpeed: "rotationSpeed",
					uRotationOscillationSpeed: "rotationOscillationSpeed",
					uRotationStartingAngle: "rotationStartingAngle * 0.017453292519943295", // deg → rad
					uRotationMode: "rotationMode",
					uRotationNoiseScale: "rotationNoiseScale",
					uRotationPhase: "rotationPhase",
					uRotationAmplitude: "rotationAmplitude",
				},
			},

			symmetry2: {
				enabled: false,
				symmetryMode: 1.0, // 0=horizontal, 1=vertical, 2=2-line, 3=4-line, 4=8-line, 5=16-line, 6=radial
				amount: 1.0, // Blend strength [0..1]
				debug: 0.0, // 0.0 = normal, 1.0 = debug mode (shows fold lines and center)
				center: [0.5, 0.5], // symmetry center in normalized coords
				translationEnabled: 1.0, // Master toggle for translation animation
				translationSpeedX: 0.01, // Horizontal translation speed (0 = none)
				translationSpeedY: 0.01, // Vertical translation speed (0 = none)
				translationMode: 3.0, // 0=sine, 1=noise, 2=FBM, 3=vector field, 4=continuous scroll
				translationNoiseScale: 0.2, // Scale of noise variation (lower = smoother, higher = more frequent changes)
				translationPhaseX: -0.5, // Accumulated phase for X translation (prevents jumps)
				translationPhaseY: 0.5, // Accumulated phase for Y translation (prevents jumps)
				rotationEnabled: 1.0, // Master toggle for animated rotation
				rotationSpeed: 0.01, // Speed of rotation
				rotationOscillationSpeed: 0.1, // Speed of oscillation (controls how fast it alternates between positive/negative)
				rotationStartingAngle: 5.7, // Static rotation in degrees [0..360] (applied even when animation is off)
				rotationMode: 1.0, // 0=cosine oscillation, 1=noise, 2=FBM
				rotationNoiseScale: 0.01, // Scale of rotation noise (lower = smoother, higher = more frequent changes)
				rotationPhase: 0.0, // Accumulated phase for rotation (prevents jumps)
				rotationAmplitude: 50.0, // Fixed amplitude - speed controls phase accumulation rate, not amplitude
				timeMultiplier: 0.1, // Time multiplier for animation
				uniforms: {
					uResolution: "[width, height]",
					uSeed: "shaderSeed + 1234.0",
					uSymmetryMode: "symmetryMode",
					uAmount: "amount",
					uDebug: "debug",
					uCenter: "center",
					uTime: "shaderTime * timeMultiplier",
					uTranslationEnabled: "translationEnabled",
					uTranslationSpeedX: "translationSpeedX",
					uTranslationSpeedY: "translationSpeedY",
					uTranslationMode: "translationMode",
					uTranslationNoiseScale: "translationNoiseScale",
					uTranslationPhaseX: "translationPhaseX",
					uTranslationPhaseY: "translationPhaseY",
					uRotationEnabled: "rotationEnabled",
					uRotationSpeed: "rotationSpeed",
					uRotationOscillationSpeed: "rotationOscillationSpeed",
					uRotationStartingAngle: "rotationStartingAngle * 0.017453292519943295", // deg → rad
					uRotationMode: "rotationMode",
					uRotationNoiseScale: "rotationNoiseScale",
					uRotationPhase: "rotationPhase",
					uRotationAmplitude: "rotationAmplitude",
				},
			},

			symmetry3: {
				enabled: false,
				symmetryMode: 4.0, // 0=horizontal, 1=vertical, 2=2-line, 3=4-line, 4=8-line, 5=16-line, 6=radial
				amount: 1.0, // Blend strength [0..1]
				debug: 0.0, // 0.0 = normal, 1.0 = debug mode (shows fold lines and center)
				center: [0.5, 0.5], // symmetry center in normalized coords
				translationEnabled: 1.0, // Master toggle for translation animation
				translationSpeedX: 0.01, // Horizontal translation speed (0 = none)
				translationSpeedY: 0.01, // Vertical translation speed (0 = none)
				translationMode: 3.0, // 0=sine, 1=noise, 2=FBM, 3=vector field, 4=continuous scroll
				translationNoiseScale: 0.2, // Scale of noise variation (lower = smoother, higher = more frequent changes)
				translationPhaseX: 0.5, // Accumulated phase for X translation (prevents jumps)
				translationPhaseY: 0.5, // Accumulated phase for Y translation (prevents jumps)
				rotationEnabled: 1.0, // Master toggle for animated rotation
				rotationSpeed: 0.16, // Speed of rotation
				rotationOscillationSpeed: 0.1, // Speed of oscillation (controls how fast it alternates between positive/negative)
				rotationStartingAngle: 5.7, // Static rotation in degrees [0..360] (applied even when animation is off)
				rotationMode: 2.0, // 0=cosine oscillation, 1=noise, 2=FBM
				rotationNoiseScale: 0.01, // Scale of rotation noise (lower = smoother, higher = more frequent changes)
				rotationPhase: 0.0, // Accumulated phase for rotation (prevents jumps)
				rotationAmplitude: 1.0, // Fixed amplitude - speed controls phase accumulation rate, not amplitude
				timeMultiplier: 0.1, // Time multiplier for animation
				uniforms: {
					uResolution: "[width, height]",
					uSeed: "shaderSeed + 1234.0",
					uSymmetryMode: "symmetryMode",
					uAmount: "amount",
					uDebug: "debug",
					uCenter: "center",
					uTime: "shaderTime * timeMultiplier",
					uTranslationEnabled: "translationEnabled",
					uTranslationSpeedX: "translationSpeedX",
					uTranslationSpeedY: "translationSpeedY",
					uTranslationMode: "translationMode",
					uTranslationNoiseScale: "translationNoiseScale",
					uTranslationPhaseX: "translationPhaseX",
					uTranslationPhaseY: "translationPhaseY",
					uRotationEnabled: "rotationEnabled",
					uRotationSpeed: "rotationSpeed",
					uRotationOscillationSpeed: "rotationOscillationSpeed",
					uRotationStartingAngle: "rotationStartingAngle * 0.017453292519943295", // deg → rad
					uRotationMode: "rotationMode",
					uRotationNoiseScale: "rotationNoiseScale",
					uRotationPhase: "rotationPhase",
					uRotationAmplitude: "rotationAmplitude",
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
				enabled: false,
				zoomAmount: 1.0, // Static zoom level (1.0 = no zoom, 2.0 = 2x in, 0.5 = 2x out)
				zoomSpeed: 0.8, // Animation speed
				zoomOutAmount: 2.25, // Min zoom when animating
				zoomInAmount: 4.5, // Max zoom when animating
				animateZoom: 0.0, // 0.0 = static, 1.0 = animate between out/in
				easingMode: 4.0, // 0=sine, 1=linear, 2=ease-in, 3=ease-out, 4=ease-in-out, 5=bounce
				center: [0.5, 0.5], // Zoom center point (normalized 0-1)
				timeMultiplier: 0.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uZoomSpeed: "zoomSpeed",
					uZoomAmount: "zoomAmount",
					uZoomOutAmount: "zoomOutAmount",
					uZoomInAmount: "zoomInAmount",
					uAnimateZoom: "animateZoom",
					uCenter: "center",
					uEasingMode: "easingMode",
					uCenter: "center",
				},
			},
			pixelGrid: {
				enabled: false,
				gridSize: [24.0, 24.0],
				cellRatio: 0.0,
				gridMode: 0.0,
				diffuse: 1.5,
				gapSize: 0.0,
				gapBrightness: 1.0,
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
				enabled: false,
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
				enabled: false,
				levels: 3.0,
				mix: 1.0,
				uniforms: {
					uLevels: "levels",
					uMix: "mix",
				},
			},
			chromatic: {
				enabled: true,
				amount: 0.001,
				timeMultiplier: 0.0,
				uniforms: {
					uTime: "shaderTime * timeMultiplier",
					uSeed: "shaderSeed + 777.0",
					uAmount: "amount",
				},
			},

			crtDisplay: {
				enabled: false,
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
				enabled: false,
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
				enabled: false,
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
				enabled: false,
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
		};

		// Default templates for create-from-dropdown in the shader panel
		// (survive delete of the last instance of an effect)
		this.effectTemplates = {};
		for (const [name, cfg] of Object.entries(this.effectsConfig)) {
			const root = String(name).replace(/\d+$/, "") || name;
			if (this.effectTemplates[root]) continue;
			const template = JSON.parse(JSON.stringify(cfg));
			template.enabled = false;
			template.pass = cfg.pass || root;
			this.effectTemplates[root] = template;
		}

		// Symmetry phase tracking (prevents jumps when speed changes)
		this.lastTranslationSpeed = {};
		this.lastRotationSpeed = {};
		this.lastRotationOscillationSpeed = {};
		for (const name of Object.keys(this.effectsConfig).filter((n) => n.startsWith("symmetry"))) {
			this.lastTranslationSpeed[name] = null;
			this.lastRotationSpeed[name] = null;
			this.lastRotationOscillationSpeed[name] = null;
		}

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
	 * Load shaders — call from async setup() (p5.js 2.0 removed preload)
	 * Customize the shaders you load for your sketch
	 * @param {p5|Window} p5Instance - The p5 instance (or window in global mode)
	 */
	async preload(p5Instance) {
		this.p5Instance = p5Instance;

		// Initialize the global shader manager instance
		shaderManager.init(p5Instance);

		// Set default vertex shader
		shaderManager.setDefaultVertex("chromatic-aberration/vertex.vert");

		// Load shaders in parallel - customize this list for your sketch
		await Promise.all([
			shaderManager.loadShader("copy", "copy/fragment.frag", "copy/vertex.vert"),
			shaderManager.loadShader("deform", "deform/fragment.frag", "deform/vertex.vert"),
			shaderManager.loadShader("chromatic", "chromatic-aberration/fragment.frag", "chromatic-aberration/vertex.vert"),
			shaderManager.loadShader("grain", "grain/fragment.frag", "grain/vertex.vert"),
			shaderManager.loadShader("collage", "collage-rotate/fragment.frag", "collage-rotate/vertex.vert"),
			shaderManager.loadShader("pixelSort", "pixel-sort/fragment.frag", "pixel-sort/vertex.vert"),
			shaderManager.loadShader("crtDisplay", "pixel-checker/fragment.frag", "pixel-checker/vertex.vert"),
			shaderManager.loadShader("symmetry", "symmetry/fragment.frag", "symmetry/vertex.vert"),
			shaderManager.loadShader("symmetry2", "symmetry/fragment.frag", "symmetry/vertex.vert"),
			shaderManager.loadShader("symmetry3", "symmetry/fragment.frag", "symmetry/vertex.vert"),
			shaderManager.loadShader("loaderGlitch", "loader-glitch/fragment.frag", "loader-glitch/vertex.vert"),
			shaderManager.loadShader("zoom", "zoom/fragment.frag", "zoom/vertex.vert"),
			shaderManager.loadShader("pixelGrid", "pixel-grid/fragment.frag", "pixel-grid/vertex.vert"),
			shaderManager.loadShader("colorQuantize", "color-quantize/fragment.frag", "color-quantize/vertex.vert"),
			shaderManager.loadShader("dither", "dither/fragment.frag", "dither/vertex.vert"),
			shaderManager.loadShader("crtWarp", "crt-warp/fragment.frag", "crt-warp/vertex.vert"),
			shaderManager.loadShader("blur", "blur/fragment.frag", "blur/vertex.vert"),
			shaderManager.loadShader("glitchDisplacement", "glitch-displacement/fragment.frag", "glitch-displacement/vertex.vert"),
		]);

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
	setup(width, height, mainCanvas, shaderCanvas, pixelDensity = 1) {
		this.mainCanvas = mainCanvas;
		this.shaderCanvas = shaderCanvas;
		this.pixelDensity = pixelDensity;
		this.lastShaderUpdateTime = 0;

		if (this.shaderManager) {
			this.shaderManager.setRenderRatio(this.renderRatio);
			this.setCrispPixels(this.crispPixels);
		}

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

		this.shaderPipeline = new ShaderPipeline(this.shaderManager, this.p5Instance).init(width, height, enabledEffects, pixelDensity);

		// Make it globally accessible (for backward compatibility)
		window.shaderPipeline = this.shaderPipeline;

		return this;
	}

	/**
	 * Update output framing (delegates to shaderManager).
	 * @param {object} options - { fitCanvas, width, height }
	 */
	setRenderRatio(options = {}) {
		this.renderRatio = {
			fitCanvas: options.fitCanvas !== undefined ? Boolean(options.fitCanvas) : this.renderRatio.fitCanvas,
			width: options.width ?? this.renderRatio.width,
			height: options.height ?? this.renderRatio.height,
		};
		if (this.shaderManager) {
			this.shaderManager.setRenderRatio(this.renderRatio);
		}
		return this;
	}

	getRenderRatio() {
		return {...this.renderRatio};
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
	 * Sharp pixel look when the buffer is upscaled (CSS + WebGL NEAREST sampling).
	 * @param {boolean} enabled
	 */
	setCrispPixels(enabled) {
		this.crispPixels = Boolean(enabled);
		if (this.shaderManager) {
			this.shaderManager.crispPixels = this.crispPixels;
		}
		if (typeof document !== "undefined") {
			document.querySelectorAll("canvas.p5Canvas").forEach((el) => {
				el.classList.toggle("is-smooth", !this.crispPixels);
			});
		}
		return this;
	}

	getCrispPixels() {
		return !!this.crispPixels;
	}

	/**
	 * Resize artwork + display canvases and rebuild the shader pipeline
	 * (used by the shader panel's size controls).
	 * @param {number} width
	 * @param {number} height
	 */
	resize(width, height) {
		const w = Math.max(16, Math.min(8192, Math.round(Number(width) || 16)));
		const h = Math.max(16, Math.min(8192, Math.round(Number(height) || 16)));

		const cur = this.getCanvasSize();
		if (Math.round(cur.width) === w && Math.round(cur.height) === h) {
			return this;
		}

		const p5 = this.p5Instance || (typeof window !== "undefined" ? window : null);

		// Artwork offscreen buffer
		if (this.mainCanvas) {
			if (typeof this.mainCanvas.resizeCanvas === "function") {
				this.mainCanvas.resizeCanvas(w, h);
			} else if (typeof this.mainCanvas.resize === "function") {
				this.mainCanvas.resize(w, h);
			}
		}

		// Main WEBGL display canvas (global-mode p5 exposes resizeCanvas on window)
		if (typeof resizeCanvas === "function") {
			resizeCanvas(w, h);
		} else if (p5 && typeof p5.resizeCanvas === "function") {
			p5.resizeCanvas(w, h);
		}

		this.lastEnabledEffects = null;
		this.reinitializePipeline();

		console.log(`[ShaderEffects] resized to ${w}×${h} (main=${this.mainCanvas?.width}×${this.mainCanvas?.height})`);
		return this;
	}

	getCanvasSize() {
		const w = this.mainCanvas?.width ?? (typeof width !== "undefined" ? width : 0);
		const h = this.mainCanvas?.height ?? (typeof height !== "undefined" ? height : 0);
		return {width: w, height: h};
	}

	/**
	 * Reorder effects in the render stack (Object key order = pass order).
	 * @param {string[]} orderedNames - Effect names top→bottom = first→last pass
	 */
	reorderEffects(orderedNames) {
		if (!Array.isArray(orderedNames) || !orderedNames.length) return this;

		const prev = this.effectsConfig;
		const next = {};
		const seen = new Set();

		for (const name of orderedNames) {
			if (prev[name] !== undefined && !seen.has(name)) {
				next[name] = prev[name];
				seen.add(name);
			}
		}
		// Keep any effects omitted from the list at the end
		for (const name of Object.keys(prev)) {
			if (!seen.has(name)) next[name] = prev[name];
		}

		this.effectsConfig = next;
		this.lastEnabledEffects = null; // force pass list rebuild on next apply()
		this.reinitializePipeline();
		return this;
	}

	/**
	 * Next free name: prefers root ("wave") if free, else wave2 / wave3…
	 */
	_nextCloneName(sourceName) {
		const root = String(sourceName).replace(/\d+$/, "") || sourceName;
		if (!this.effectsConfig[root]) return root;
		let n = 2;
		while (this.effectsConfig[root + n]) n++;
		return root + n;
	}

	/**
	 * Register phase-tracking slots for a (new) symmetry-style effect.
	 */
	_ensurePhaseTracking(effectName) {
		if (!String(effectName).startsWith("symmetry")) return;
		if (!(effectName in this.lastTranslationSpeed)) this.lastTranslationSpeed[effectName] = null;
		if (!(effectName in this.lastRotationSpeed)) this.lastRotationSpeed[effectName] = null;
		if (!(effectName in this.lastRotationOscillationSpeed)) this.lastRotationOscillationSpeed[effectName] = null;
	}

	/**
	 * Template names available for createEffect (from initial effectsConfig).
	 * @returns {string[]}
	 */
	getEffectTemplateNames() {
		return Object.keys(this.effectTemplates || {}).sort();
	}

	/**
	 * Create a new stack instance from a template (e.g. "symmetry", "grain").
	 * @param {string} templateName
	 * @param {object} [options]
	 * @param {boolean} [options.enabled=true]
	 * @returns {string|null} new effect name
	 */
	createEffect(templateName, options = {}) {
		const root = String(templateName).replace(/\d+$/, "") || templateName;
		const template = this.effectTemplates?.[root];
		if (!template) {
			console.warn(`[ShaderEffects] createEffect: unknown template "${templateName}"`);
			return null;
		}

		const newName = this._nextCloneName(root);
		const created = JSON.parse(JSON.stringify(template));
		created.enabled = options.enabled !== undefined ? Boolean(options.enabled) : true;
		created.pass = template.pass || root;

		this.effectsConfig[newName] = created;
		this._ensurePhaseTracking(newName);

		this.lastEnabledEffects = null;
		this.reinitializePipeline();
		console.log(`[ShaderEffects] created "${newName}" from template "${root}" (pass: ${created.pass})`);
		return newName;
	}

	/**
	 * Remove an effect from the stack.
	 * @param {string} effectName
	 */
	removeEffect(effectName) {
		if (!this.effectsConfig[effectName]) {
			console.warn(`[ShaderEffects] removeEffect: "${effectName}" not found`);
			return this;
		}

		delete this.effectsConfig[effectName];
		delete this.lastTranslationSpeed?.[effectName];
		delete this.lastRotationSpeed?.[effectName];
		delete this.lastRotationOscillationSpeed?.[effectName];

		this.lastEnabledEffects = null;
		this.reinitializePipeline();
		console.log(`[ShaderEffects] removed "${effectName}"`);
		return this;
	}

	/**
	 * Deep-clone an effect as a new stack instance (visual overdub).
	 * Shares the same GL program via `pass` (defaults to the source effect's program).
	 * @param {string} sourceName
	 * @param {object} [options]
	 * @param {boolean} [options.enabled=true]
	 * @param {boolean} [options.insertAfter=true] - place clone right after the source in the stack
	 * @returns {string|null} new effect name
	 */
	cloneEffect(sourceName, options = {}) {
		const source = this.effectsConfig[sourceName];
		if (!source) {
			console.warn(`[ShaderEffects] cloneEffect: "${sourceName}" not found`);
			return null;
		}

		const newName = this._nextCloneName(sourceName);
		const cloned = JSON.parse(JSON.stringify(source));
		cloned.enabled = options.enabled !== undefined ? Boolean(options.enabled) : true;
		// GL program key — reuse the source program (symmetry4 → same as symmetry, etc.)
		cloned.pass = source.pass || String(sourceName).replace(/\d+$/, "") || sourceName;

		const insertAfter = options.insertAfter !== false;
		if (insertAfter) {
			const next = {};
			for (const name of Object.keys(this.effectsConfig)) {
				next[name] = this.effectsConfig[name];
				if (name === sourceName) next[newName] = cloned;
			}
			if (!next[newName]) next[newName] = cloned;
			this.effectsConfig = next;
		} else {
			this.effectsConfig[newName] = cloned;
		}

		this._ensurePhaseTracking(newName);

		this.lastEnabledEffects = null;
		this.reinitializePipeline();
		console.log(`[ShaderEffects] cloned "${sourceName}" → "${newName}" (pass: ${cloned.pass})`);
		return newName;
	}

	/**
	 * Physical canvas resolution in pixels (logical size × pixel density).
	 */
	getPhysicalResolution() {
		const density = this.mainCanvas?.pixelDensity?.() ?? this.pixelDensity ?? 1;
		return [this.mainCanvas.width * density, this.mainCanvas.height * density];
	}

	/**
	 * Update pixel density and rebuild intermediate shader buffers.
	 * @param {number} density
	 */
	setPixelDensity(density) {
		this.pixelDensity = density;
		this.reinitializePipeline();
		return this;
	}

	/**
	 * Reinitialize shader pipeline when effects or resolution change
	 */
	reinitializePipeline() {
		if (this.shaderPipeline && this.shaderManager && this.mainCanvas) {
			const enabledEffects = Object.keys(this.effectsConfig).filter((name) => this.effectsConfig[name].enabled);
			const density = this.mainCanvas.pixelDensity?.() ?? this.pixelDensity ?? 1;
			this.pixelDensity = density;
			this.shaderPipeline.init(this.mainCanvas.width, this.mainCanvas.height, enabledEffects, density);
		}
		return this;
	}

	/**
	 * Set master shader animation speed (scales all time-driven effects uniformly).
	 * @param {number} speed - Multiplier (1.0 = default, 0.5 = half, 2.0 = double)
	 */
	setAnimationSpeed(speed) {
		this.animationSpeed = Math.max(0, speed ?? 1);
		return this;
	}

	getAnimationSpeed() {
		return this.animationSpeed;
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
	 * Names of symmetry effect passes in the pipeline.
	 * @returns {string[]}
	 */
	getSymmetryEffectNames() {
		return Object.keys(this.effectsConfig).filter((name) => name.startsWith("symmetry"));
	}

	/**
	 * Update translation phases to prevent position jumps when speed changes.
	 * @param {number} delta - Time delta
	 */
	updateTranslationPhases(delta) {
		for (const effectName of this.getSymmetryEffectNames()) {
			const effect = this.effectsConfig[effectName];
			if (!effect || !effect.enabled) continue;
			if (effect.translationEnabled !== undefined && effect.translationEnabled < 0.5) continue;
			this._ensurePhaseTracking(effectName);

			// Prefer per-axis speeds; fall back to legacy translationSpeed
			const legacy = effect.translationSpeed ?? 0;
			const speedX = effect.translationSpeedX !== undefined ? effect.translationSpeedX : legacy;
			const speedY = effect.translationSpeedY !== undefined ? effect.translationSpeedY : legacy;

			if (effect.translationPhaseX === undefined) effect.translationPhaseX = 0;
			if (effect.translationPhaseY === undefined) effect.translationPhaseY = 0;

			const timeMultiplier = effect.timeMultiplier || 0.1;
			const effectiveDelta = delta * timeMultiplier;

			effect.translationPhaseX += effectiveDelta * speedX;
			effect.translationPhaseY += effectiveDelta * speedY;

			this.lastTranslationSpeed[effectName] = {x: speedX, y: speedY};
		}
	}

	/**
	 * Update rotation phases to prevent angle jumps when speed changes.
	 * @param {number} delta - Time delta
	 */
	updateRotationPhases(delta) {
		for (const effectName of this.getSymmetryEffectNames()) {
			const effect = this.effectsConfig[effectName];
			if (!effect || !effect.enabled) continue;
			if (effect.rotationEnabled !== undefined && effect.rotationEnabled < 0.5) continue;
			this._ensurePhaseTracking(effectName);

			const currentSpeed = effect.rotationSpeed || 0;
			const currentOscillationSpeed = effect.rotationOscillationSpeed || 0;
			const lastSpeed = this.lastRotationSpeed[effectName];
			const lastOscillationSpeed = this.lastRotationOscillationSpeed[effectName];
			const rotMode = Math.floor(effect.rotationMode || 0);

			if (effect.rotationPhase === undefined) effect.rotationPhase = 0;

			if (lastSpeed !== null && lastSpeed !== currentSpeed && currentSpeed !== 0) {
				const currentTime = this.shaderTime * (effect.timeMultiplier || 0.1);

				if (rotMode === 0) {
					const oldOscillation = -Math.cos(currentTime * (lastOscillationSpeed || 0));
					effect.rotationPhase = oldOscillation * lastSpeed;
				} else if (rotMode === 1 || rotMode === 2) {
					if (effect.rotationAmplitude === undefined) {
						effect.rotationAmplitude = lastSpeed || currentSpeed;
					}
				}
			}

			const timeMultiplier = effect.timeMultiplier || 0.1;
			const effectiveDelta = delta * timeMultiplier;
			const currentTime = this.shaderTime * timeMultiplier;

			if (rotMode === 0) {
				const oscillation = -Math.cos(currentTime * currentOscillationSpeed);
				const angleDerivative = oscillation * currentSpeed;
				effect.rotationPhase += effectiveDelta * angleDerivative;
			} else {
				effect.rotationPhase += effectiveDelta * currentSpeed;

				if (effect.rotationAmplitude === undefined) {
					effect.rotationAmplitude = currentSpeed;
				}
			}

			this.lastRotationSpeed[effectName] = currentSpeed;
			this.lastRotationOscillationSpeed[effectName] = currentOscillationSpeed;
		}
	}

	/**
	 * Advance shader clock from wall-clock elapsed time (consistent before/after sketch completion).
	 * @returns {number} Delta applied to shaderTime
	 */
	advanceShaderClock() {
		const now = performance.now();
		if (!this.lastShaderUpdateTime) {
			this.lastShaderUpdateTime = now;
			return 0;
		}

		const dt = Math.min((now - this.lastShaderUpdateTime) / 1000, 0.1);
		this.lastShaderUpdateTime = now;
		const delta = dt * (this.shaderFrameRate / 100) * this.animationSpeed;

		if (delta > 0) {
			this.updateTime(delta);
		}

		return delta;
	}

	/**
	 * Update shader time - call this in your animation loop
	 * @param {number} delta - Time delta (default: 0.01)
	 */
	updateTime(delta = 0.01) {
		this.shaderTime += delta;
		this.updateTranslationPhases(delta);
		this.updateRotationPhases(delta);
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
				return this.getPhysicalResolution();
			}

			// Handle expressions like 'shaderSeed + 777.0'
			if (value.includes("+") || value.includes("-") || value.includes("*") || value.includes("/")) {
				try {
					const [physW, physH] = this.getPhysicalResolution();
					// Create a safe evaluation context with available variables
					const evalContext = {
						shaderTime: this.shaderTime,
						shaderSeed: this.shaderSeed,
						width: physW,
						height: physH,
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
			if (value === "width") return this.getPhysicalResolution()[0];
			if (value === "height") return this.getPhysicalResolution()[1];

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
			// (effect.pass lets clones like "chromatic2" reuse the "chromatic" GL program)
			for (const effectName in this.effectsConfig) {
				const effect = this.effectsConfig[effectName];
				if (effect.enabled) {
					const passName = effect.pass || effectName;
					this.shaderPipeline.addPass(passName, () => {
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
		// Always track FPS (the debug panel reads currentFPS even when the
		// standalone overlay is hidden); drawFPS() gates the overlay itself.
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
				this.advanceShaderClock();
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
		this.advanceShaderClock();

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
