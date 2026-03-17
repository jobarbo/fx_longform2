//* PARAMS *//
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;
features = $fx.getFeatures();
seed = parseInt(fxrand() * 10000000);

// ============================================================================
// RUNTIME UI PARAMETERS (EXLIBRIS-style control panel)
// ============================================================================
// Keep options centralized here. Sketch + UI read from this object.
window.PARAMS_UI = window.PARAMS_UI ?? {
	// ---- Available options (drives the UI dropdowns) ----
	options: {
		populations: [100000, 300000, 500000, 1000000, 1500000, 2500000, 3500000],
		particleSizes: [0.25, 0.35, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
		horizontalSpeeds: ["veryFast", "fast", "standard", "slow", "snail"],
		verticalSpeeds: ["veryFast", "fast", "standard", "slow", "snail"],
		innerFlowLevels: ["low", "standard", "medium", "high"],
		outerFlowLevels: ["standard", "medium", "high"],
		printDPIs: [1, 2, 3, 4, 5],
		exposures: [10, 20, 30, 45, 60],
		presentations: ["off", "on", "horizontal"],
		externalFrame: ["on", "off"],
		swirlIndex: ["none", "low", "medium", "high", "veryHigh", "extreme"],
		zigzag: ["hairline", "fine", "normal", "large", "XL"],
		noiseScale2: ["low", "medium", "high", "intense"],
		palettes: [], // filled once swatches are loaded
	},

	// ---- Lookup maps (single source of truth for every enum → value) ----
	maps: {
		swirl: {none: 0.3, low: 10, medium: 100, high: 500, veryHigh: 1000, extreme: 2000},
		zigzag: {hairline: 0.001, fine: 0.003, normal: 0.005, large: 0.007, XL: 0.009},
		noiseScale2: {low: 1, medium: 2, high: 4, intense: 6},
		speed: {
			veryFast: 0.015,
			fast: 0.025,
			standard: 0.045,
			slow: 0.075,
			snail: 0.5,
		},
		innerFlow: {
			low: -1,
			standard: 0,
			medium: 2,
			high: 5,
		},
		outerFlow: {
			low: -1,
			standard: 0,
			medium: 2,
			high: 5,
		},
	},

	// ---- Current selections (string keys or plain numbers) ----
	current: {
		population: 500000,
		particleSize: 0.75,
		horizontalSpeed: "standard",
		verticalSpeed: "standard",
		innerFlowLevel: "standard",
		outerFlowLevel: "standard",
		paletteName: "",
		printDPI: 2,
		exposure: 30,
		presentation: "off",
		externalFrame: "on",
		swirlIndex: "none",
		zigzag: "normal",
		noiseScale2: "low",
	},

	// ---- Resolved values (numeric/boolean — read by sketch + mover) ----
	resolved: {},

	lockedSeeds: null,
};

// Derives resolved numeric values from current selections.
// Call this once after any change to PARAMS_UI.current.
window.resolveParams = function resolveParams() {
	const {current, maps} = window.PARAMS_UI;
	// Mutate the *same* object so any `const` alias (CURRENT_PARAMS) stays live.
	Object.assign(window.PARAMS_UI.resolved, {
		population: current.population,
		particleSize: current.particleSize,
		horizontalSpeed: maps.speed[current.horizontalSpeed] ?? maps.speed.standard,
		verticalSpeed: maps.speed[current.verticalSpeed] ?? maps.speed.standard,
		innerFlowThreshold: maps.innerFlow[current.innerFlowLevel] ?? maps.innerFlow.standard,
		outerFlowThreshold: maps.outerFlow[current.outerFlowLevel] ?? maps.outerFlow.standard,
		paletteName: current.paletteName,
		printDPI: current.printDPI,
		exposure: current.exposure,
		presentation: current.presentation,
		showExternalFrame: current.externalFrame !== "off",
		swirlFactor: maps.swirl[current.swirlIndex] ?? maps.swirl.none,
		zigzagStrength: maps.zigzag[current.zigzag] ?? maps.zigzag.normal,
		noiseScale2: maps.noiseScale2[current.noiseScale2] ?? maps.noiseScale2.low,
	});
};

// Populate resolved on first load.
window.resolveParams();

const CURRENT_PARAMS = window.PARAMS_UI?.resolved ?? {};

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	["1", 20],
	["2", 70],
	["3", 5],
	["4", 2],
	["5", 2],
	["6", 1],
];

const themeArr = [
	["bright", 0],
	["dark", 100],
];

const compositionArr = [
	["semiconstrained", 0],
	["constrained", 0],
	["compressed", 0],
	["unconstrained", 100],
];

const colorModeArr = [
	["monochrome", 100],
	["fixed", 0],
	["dynamic", 0],
	["iridescent", 0],
];

const strokestyleArr = [
	["thin", 100],
	["regular", 0],
	["bold", 0],
];

const clampvalueArr = [
	["0.0000015,0.25,0.25,0.0000015", 50],
	["0.0000015,0.025,0.025,0.0000015", 50],
	["0.00015,0.015,0.015,0.00015", 50],
	["0.15,0.00000015,0.15,0.0000015", 50],
	["0.0015,0.000015,0.0015,0.000015", 50],
	["0.05,0.05,0.05,0.05", 50],
	["0.15,0.15,0.15,0.15", 50],
	["0.015,0.015,0.015,0.015", 50],
	["0.0015,0.0015,0.0015,0.0015", 50],
	["0.0000015,0.0000015,0.0000015,0.0000015", 50],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(complexity, theme, composition, colormode, strokestyle, clampvalue) {
	// SET DEFAULTS IF NOT PASSED IN
	if (complexity === undefined) {
		complexity = weighted_choice(complexityArr);
	}

	if (theme === undefined) {
		theme = weighted_choice(themeArr);
	}

	if (composition === undefined) {
		composition = weighted_choice(compositionArr);
	}

	if (colormode === undefined) {
		colormode = weighted_choice(colorModeArr);
	}

	if (strokestyle === undefined) {
		strokestyle = weighted_choice(strokestyleArr);
	}

	if (clampvalue === undefined) {
		clampvalue = weighted_choice(clampvalueArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		complexity: complexity,
		theme: theme,
		composition: composition,
		colormode: colormode,
		strokestyle: strokestyle,
		clampvalue: clampvalue,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
