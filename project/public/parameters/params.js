//* PARAMS *//
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;
features = $fx.getFeatures();
seed = parseInt(fxrand() * 10000000);

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const shapeArr = [
	// name, probability(0-100)
	["simple block", 6],
	["electron microscope", 6],
	["electron microscope oct", 6],
	["block rect", 6],
	["block rect 2", 6],
	["drapery yin/yang", 6],
	["drapery equilibrium", 6],
	["hybrid drapery/blocks", 6],
	["jellyfish", 6],
	["jellyfish 2", 6],
	["jellyfish 3", 6],
	["astral beings", 6],
	["astral beings 2", 6],
	["astral beings 3", 6],
	["astral beings 4", 6],
	["astral beings asym", 6],
	["complex organism", 6],
];

const symmetryArr = [
	["1 (225)", 7],
	["1 (45)", 7],
	["2 (90/270)", 7],
	["2 (180/270)", 7],
	["3 (0/45/90)", 7],
	["3 (0/90/270)", 7],
	["4 diag", 7],
	["4 ortho", 7],
	["6 hex", 7],
	["8", 7],
	["8 y-asym", 7],
	["16", 7],
	["18", 7],
	["36", 7],
	["37 partial", 7],
];

const patternArr = [
	["original", 34],
	["inverted", 33],
	["eidolons", 33],
];

const lineWidthArr = [
	["hairline", 12.5],
	["very thin", 12.5],
	["thin", 12.5],
	["normal", 12.5],
	["medium", 12.5],
	["semibold", 12.5],
	["bold", 12.5],
	["black", 12.5],
];

const zoomLevelArr = [
	["close", 33],
	["medium", 33],
	["far", 33],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(shape_type, symmetry, pattern, line_type, zoom_level) {
	// SET DEFAULTS IF NOT PASSED IN
	if (shape_type === undefined) {
		shape_type = weighted_choice(shapeArr);
	}

	if (symmetry === undefined) {
		symmetry = weighted_choice(symmetryArr);
	}

	if (pattern === undefined) {
		pattern = weighted_choice(patternArr);
	}

	if (line_type === undefined) {
		line_type = weighted_choice(lineWidthArr);
	}

	if (zoom_level === undefined) {
		zoom_level = weighted_choice(zoomLevelArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		shape_type: shape_type,
		symmetry: symmetry,
		pattern: pattern,
		line_type: line_type,
		zoom_level: zoom_level,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}

// ============================================================================
// RUNTIME UI PARAMETERS (ParamsPanel)
// ============================================================================
// Keys are unique to this piece: the panel's localStorage slot is shared by every
// branch served on the same origin, so generic names (exposure, printDPI...) would
// pick up values saved by other artworks.
const optionNames = (arr) => arr.map(([name]) => name);
const angleRange = (from, to, step) => Array.from({length: Math.floor((to - from) / step) + 1}, (_, i) => from + i * step);

window.PARAMS_UI = window.PARAMS_UI ?? {
	// ---- Available options (drives the UI dropdowns) ----
	options: {
		shapes: optionNames(shapeArr),
		symmetries: optionNames(symmetryArr),
		zooms: optionNames(zoomLevelArr),
		noiseRanges: ["standard [0,1]", "custom [-1,1]"],
		offPatterns: optionNames(patternArr),
		offSpreads: [0.001, 0.0025, 0.005, 0.007, 0.01, 0.025, 0.05, 0.07],
		noiseCosMaps: ["abs", "signed", "signed crossed"],
		offMaps: ["cos", "cos split", "off_cos"],
		oscFreqs: [10, 12, 20, 50, 100],
		oscFns: ["sin", "cos", "tan"],
		noiseCosFreqs: [6, 8, 9, 10, 11, 12, 15, 18, 20, 25, 30, 35, 36, 40, 45, 50, 54, 60, 70, 75, 80, 90, 100, 200, 500],
		offCosFreqs: [2, 26, 30, 50, 60, 150, 500, 800, 1250, 1500],
		colorSources: ["col_cos", "noise_cos"],
		colorCosFns: ["cos", "sin"],
		paletteStarts: ["random", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
		backdrops: ["gradient", "dark", "light"],
		lineWidths: optionNames(lineWidthArr),
		particleBoosts: [1, 2, 3, 4],
		alphaScales: [0.25, 0.5, 0.75, 1],
		renderFrames: ["auto", "500", "700", "1000", "1400", "2000"],
		pixelRatios: [1, 2, 3, 4],
	},

	// ---- Lookup maps (single source of truth for every enum -> value) ----
	maps: {
		symmetry: {
			"1 (225)": [225],
			"1 (45)": [45],
			"2 (90/270)": [90, 270],
			"2 (180/270)": [180, 270],
			"3 (0/45/90)": [0, 45, 90],
			"3 (0/90/270)": [0, 90, 270],
			"4 diag": [45, 135, 225, 315],
			"4 ortho": [0, 90, 180, 270],
			"6 hex": [45, 105, 165, 225, 285, 345],
			8: angleRange(0, 315, 45),
			"8 y-asym": [85, 105, 125, 145, 305, 325, 345, 5],
			16: angleRange(0, 337.5, 22.5),
			18: angleRange(5, 345, 20),
			36: angleRange(0, 350, 10),
			"37 partial": [...angleRange(0, 135, 5), ...angleRange(315, 355, 5)],
		},
		// generateSymmetricOffValues(numCases, baseLow, baseHigh, maxPatternValue) inputs
		offPattern: {
			original: {l: {baseLow: 1, baseHigh: 0.148, maxPatternValue: 1}, h: {baseLow: 1.148, baseHigh: 0, maxPatternValue: 1}},
			inverted: {l: {baseLow: 0.148, baseHigh: 1, maxPatternValue: 1}, h: {baseLow: 0, baseHigh: 1.148, maxPatternValue: 1}},
			eidolons: {l: {baseLow: 0.5, baseHigh: 0, maxPatternValue: 3}, h: {baseLow: 0, baseHigh: 0.5, maxPatternValue: 3}},
		},
		noiseRange: {
			"standard [0,1]": [0, 1],
			"custom [-1,1]": [-1, 1],
		},
		// fraction of the canvas height used as the particle position range
		zoom: {close: 0.75, medium: 0.6, far: 0.45},
		// multiplier on the ink square size
		lineWidth: {hairline: 0.4, "very thin": 0.55, thin: 0.75, normal: 1, medium: 1.25, semibold: 1.5, bold: 1.8, black: 2.2},
	},

	// ---- Current selections (overwritten by the hash features in setup) ----
	current: {
		shape: "jellyfish 3",
		symmetry: "1 (225)",
		zoom: "medium",
		noiseRange: "standard [0,1]",
		offPattern: "original",
		offSpread: 0.001,
		noiseCosMap: "abs",
		offMap: "cos",
		oscFreq: 50,
		noiseCosFn: "sin",
		noiseCosFreq: 40,
		offCosFreq: 800,
		colorSource: "col_cos",
		colorCosFn: "cos",
		paletteStart: "random",
		backdrop: "gradient",
		lineWidth: "normal",
		particleBoost: 2,
		alphaScale: 0.5,
		renderFrames: "auto",
		pixelRatio: 3,
	},

	// ---- UI metadata (drives ParamsPanel control generation) ----
	ui: [
		{key: "shape", label: "Shape", optionsKey: "shapes"},
		{key: "symmetry", label: "Symmetry (angles)", optionsKey: "symmetries"},
		{key: "zoom", label: "Zoom", optionsKey: "zooms"},
		{key: "noiseRange", label: "Noise range", optionsKey: "noiseRanges"},
		{key: "offPattern", label: "Offset pattern", optionsKey: "offPatterns"},
		{key: "offSpread", label: "Offset spread", optionsKey: "offSpreads"},
		{key: "noiseCosMap", label: "noise_cos mapping", optionsKey: "noiseCosMaps"},
		{key: "offMap", label: "xoff/yoff mapping", optionsKey: "offMaps"},
		{key: "oscFreq", label: "cos/sin frequency", optionsKey: "oscFreqs"},
		{key: "noiseCosFn", label: "noise_cos function", optionsKey: "oscFns"},
		{key: "noiseCosFreq", label: "noise_cos frequency", optionsKey: "noiseCosFreqs"},
		{key: "offCosFreq", label: "off_cos frequency", optionsKey: "offCosFreqs"},
		{key: "colorSource", label: "Color driver", optionsKey: "colorSources"},
		{key: "colorCosFn", label: "col_cos function", optionsKey: "colorCosFns"},
		{key: "paletteStart", label: "Palette start", optionsKey: "paletteStarts"},
		{key: "backdrop", label: "Background", optionsKey: "backdrops"},
		{key: "lineWidth", label: "Line width", optionsKey: "lineWidths"},
		{key: "particleBoost", label: "Particle boost", optionsKey: "particleBoosts"},
		{key: "alphaScale", label: "Alpha scale", optionsKey: "alphaScales"},
		{key: "renderFrames", label: "Frames", optionsKey: "renderFrames"},
		{key: "pixelRatio", label: "Pixel density", optionsKey: "pixelRatios"},
	],

	resolved: {},

	lockedSeeds: null,
};

// Hash features become the panel defaults (called from setup, before ParamsPanel.init
// snapshots the defaults, because src/index.js draws the features after this file loads).
window.applyFeatureDefaults = function applyFeatureDefaults(f) {
	if (!f) return;
	const {current} = window.PARAMS_UI;
	if (f.shape_type) current.shape = f.shape_type;
	if (f.symmetry) current.symmetry = f.symmetry;
	if (f.pattern) current.offPattern = f.pattern;
	if (f.line_type) current.lineWidth = f.line_type;
	if (f.zoom_level) current.zoom = f.zoom_level;
};

// Derives resolved values from current selections.
// Call this once after any change to PARAMS_UI.current.
window.resolveParams = function resolveParams() {
	const {current, options, maps} = window.PARAMS_UI;
	const fallback = window.PARAMS_UI.defaults ?? {};
	// values restored from storage / JSON are only kept if they exist in the dropdown
	const pick = (key, optionsKey) => {
		const value = current[key];
		if (options[optionsKey].some((o) => String(o) === String(value))) return value;
		return fallback[key] ?? options[optionsKey][0];
	};
	const frames = pick("renderFrames", "renderFrames");
	const paletteStart = pick("paletteStart", "paletteStarts");

	// Mutate the *same* object so any `const` alias (CURRENT_PARAMS) stays live.
	Object.assign(window.PARAMS_UI.resolved, {
		shape: pick("shape", "shapes"),
		angles: maps.symmetry[pick("symmetry", "symmetries")],
		posRange: maps.zoom[pick("zoom", "zooms")],
		noiseRange: maps.noiseRange[pick("noiseRange", "noiseRanges")],
		offPattern: maps.offPattern[pick("offPattern", "offPatterns")],
		offSpread: Number(pick("offSpread", "offSpreads")),
		noiseCosMap: pick("noiseCosMap", "noiseCosMaps"),
		offMap: pick("offMap", "offMaps"),
		oscFreq: Number(pick("oscFreq", "oscFreqs")),
		noiseCosFn: pick("noiseCosFn", "oscFns"),
		noiseCosFreq: Number(pick("noiseCosFreq", "noiseCosFreqs")),
		offCosFreq: Number(pick("offCosFreq", "offCosFreqs")),
		colorSource: pick("colorSource", "colorSources"),
		colorCosFn: pick("colorCosFn", "colorCosFns"),
		paletteStart: paletteStart === "random" ? null : Number(paletteStart),
		backdrop: pick("backdrop", "backdrops"),
		inkScale: maps.lineWidth[pick("lineWidth", "lineWidths")],
		particleBoost: Number(pick("particleBoost", "particleBoosts")),
		alphaScale: Number(pick("alphaScale", "alphaScales")),
		maxFrames: frames === "auto" ? null : Number(frames),
		pixelRatio: Number(pick("pixelRatio", "pixelRatios")),
	});
};

// Populate resolved on first load.
window.resolveParams();

const CURRENT_PARAMS = window.PARAMS_UI.resolved;
