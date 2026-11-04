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
	["simple block", 7.7],
	["block rect", 7.7],
	["block rect 2", 7.7],
	["drapery yin/yang", 7.7],
	["drapery equilibrium", 7.7],
	["hybrid drapery/blocks", 7.7],
	["electron microscope", 7.7],
	["jellyfish", 7.7],
	["astral beings", 7.7],
	["astral beings 2", 7.7],
	["astral beings 3", 7.7],
	["astral beings 4", 7.7],
	["complex organism", 7.7],
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

const noiseRangeArr = [
	["micro", 16],
	["very small", 16],
	["small", 16],
	["medium", 16],
	["large", 16],
	["macro", 16],
];
const zoomLevelArr = [
	["close", 33],
	["medium", 33],
	["far", 33],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(shape_type, line_type, noise_range, zoom_level) {
	// SET DEFAULTS IF NOT PASSED IN
	if (shape_type === undefined) {
		shape_type = weighted_choice(shapeArr);
	}

	if (line_type === undefined) {
		line_type = weighted_choice(lineWidthArr);
	}

	if (noise_range === undefined) {
		noise_range = weighted_choice(noiseRangeArr);
	}

	if (zoom_level === undefined) {
		zoom_level = weighted_choice(zoomLevelArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		shape_type: shape_type,
		line_type: line_type,
		noise_range: noise_range,
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
const angleRange = (from, to, step) => Array.from({length: Math.floor((to - from) / step) + 1}, (_, i) => from + i * step);

// display-only labels; option values stay short and stable for storage / JSON export
const SHAPE_LABELS = {
	"simple block": "Simple Block",
	"electron microscope": "Electron Microscope",
	"electron microscope oct": "Electron Microscope (octaves)",
	"block rect": "Block Rect",
	"block rect 2": "Block Rect 2",
	"drapery yin/yang": "Drapery Yin Yang",
	"drapery equilibrium": "Drapery Equilibrium",
	"hybrid drapery/blocks": "Hybrid Drapery Blocks",
	jellyfish: "Jellyfish",
	"jellyfish 2": "Jellyfish 2",
	"jellyfish 3": "Jellyfish 3",
	"astral beings": "Astral Beings",
	"astral beings 2": "Astral Beings 2",
	"astral beings 3": "Astral Beings 3",
	"astral beings 4": "Astral Beings 4",
	"astral beings asym": "Astral Beings Asymmetrical",
	"complex organism": "Complex Organism (aliens)",
};

const labelFrom = (labels) => (v) => labels[v] ?? String(v);

// per-frame oscillators in drawGenerator: name = fn(generator_frameCount * freq)
// fn / freq are the values hardcoded before the panel; drives = what reads the value
const WAVES = [
	{key: "cos", name: "cos_val", fn: "cos", freq: 50, drives: "ink, sweep"},
	{key: "sin", name: "sin_val", fn: "sin", freq: 50, drives: "bri / col"},
	{key: "noise", name: "noise_cos", fn: "sin", freq: 40, drives: "pattern"},
	{key: "off", name: "off_cos", fn: "sin", freq: 800, drives: "sweep"},
	{key: "col", name: "col_cos", fn: "cos", freq: 50, drives: "color"},
];

window.PARAMS_UI = window.PARAMS_UI ?? {
	// ---- Available options (drives the UI dropdowns) ----
	options: {
		shapes: Object.keys(SHAPE_LABELS),
		symmetries: [
			"1 copy, 225°",
			"1 copy, 45°",
			"2 copies, 225° / 45°",
			"2 copies, 90° / 270°",
			"2 copies, 180° / 270°",
			"3 copies, 0° / 45° / 90°",
			"3 copies, 180° / 225° / 270°",
			"3 copies, 0° / 90° / 270°",
			"4 copies, diagonals",
			"4 copies, cross",
			"6 copies, every 60°",
			"8 copies, every 45°",
			"8 copies, Y-asymmetric",
			"16 copies, every 22.5°",
			"18 copies, every 20°",
			"36 copies, every 10°",
			"37 copies, fan 315° to 135°",
		],
		zooms: ["close", "medium", "far"],
		lineWidths: ["hairline", "very thin", "thin", "normal", "medium", "semibold", "bold", "black"],
		offPatterns: ["original", "inverted", "eidolons"],
		offSpreads: [0.00001, 0.001, 0.0025, 0.005, 0.007, 0.01, 0.025, 0.05, 0.07],
		noiseRanges: ["standard [0,1]", "custom [-1,1]"],
		noiseCosMaps: ["abs", "signed", "signed crossed"],
		offMaps: ["cos", "cos split", "off_cos"],
		noiseOctaves: [1, 2, 3, 4, 5, 6, 7, 8],
		noiseFalloffs: [0.25, 0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.9],
		waveFns: ["sin", "cos", "tan"],
		// union of the values noted in the sketch comments over time
		waveFreqs: [2, 5, 6, 8, 9, 10, 11, 12, 15, 18, 20, 25, 26, 30, 35, 36, 40, 45, 48, 50, 54, 60, 70, 75, 80, 90, 100, 150, 200, 250, 500, 800, 1250, 1500],
		colorSources: ["col_cos", "noise_cos", "sin_val"],
		briSources: ["cos_val", "sin_val"],
		paletteStarts: ["random", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
		particleBoosts: [1, 2, 3, 4],
		alphaScales: [0.25, 0.5, 0.75, 1],
		renderFrames: ["auto", "500", "700", "1000", "1400", "2000"],
		pixelRatios: [1, 2, 3, 4],
	},

	// ---- Lookup maps (single source of truth for every enum -> value) ----
	maps: {
		symmetry: {
			"1 copy, 225°": [225],
			"1 copy, 45°": [45],
			"2 copies, 225° / 45°": [225, 45],
			"2 copies, 90° / 270°": [90, 270],
			"2 copies, 180° / 270°": [180, 270],
			"3 copies, 0° / 45° / 90°": [0, 45, 90],
			"3 copies, 180° / 225° / 270°": [180, 225, 270],
			"3 copies, 0° / 90° / 270°": [0, 90, 270],
			"4 copies, diagonals": [45, 135, 225, 315],
			"4 copies, cross": [0, 90, 180, 270],
			"6 copies, every 60°": [45, 105, 165, 225, 285, 345],
			"8 copies, every 45°": angleRange(0, 315, 45),
			"8 copies, Y-asymmetric": [85, 105, 125, 145, 305, 325, 345, 5],
			"16 copies, every 22.5°": angleRange(0, 337.5, 22.5),
			"18 copies, every 20°": angleRange(5, 345, 20),
			"36 copies, every 10°": angleRange(0, 350, 10),
			"37 copies, fan 315° to 135°": [...angleRange(0, 135, 5), ...angleRange(315, 355, 5)],
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
		lineWidth: {hairline: 0.1, "very thin": 0.25, thin: 0.5, normal: 1, medium: 1.25, semibold: 1.5, bold: 1.8, black: 2.2},
	},

	// ---- Current selections (defaults = the config hardcoded in sketch.js before the panel) ----
	current: {
		shape: "jellyfish 3",
		symmetry: "1 copy, 225°",
		zoom: "medium",
		lineWidth: "hairline",
		offPattern: "original",
		offSpread: 0.001,
		noiseCosMap: "abs",
		offMap: "cos",
		noiseRange: "standard [0,1]",
		noiseOctaves: 4,
		noiseFalloff: 0.6,
		...Object.fromEntries(
			WAVES.flatMap((w) => [
				[`${w.key}Fn`, w.fn],
				[`${w.key}Freq`, w.freq],
			]),
		),
		colorSource: "col_cos",
		briSource: "cos_val",
		paletteStart: "random",
		particleBoost: 2,
		alphaScale: 0.5,
		renderFrames: "auto",
		pixelRatio: 2,
	},

	// ---- UI metadata (drives ParamsPanel control generation) ----
	// group: section title inserted above the first control of each group (see groupPanelControls)
	ui: [
		{key: "shape", group: "Shape", label: "Formula", optionsKey: "shapes", format: labelFrom(SHAPE_LABELS)},
		{key: "symmetry", group: "Shape", label: "Symmetry", optionsKey: "symmetries"},
		{key: "zoom", group: "Shape", label: "Zoom", optionsKey: "zooms", format: labelFrom({close: "Close (75%)", medium: "Medium (60%)", far: "Far (45%)"})},
		{
			key: "lineWidth",
			group: "Shape",
			label: "Line width",
			optionsKey: "lineWidths",
			format: (v) => `${v[0].toUpperCase()}${v.slice(1)} (×${window.PARAMS_UI.maps.lineWidth[v]})`,
		},

		{
			key: "offPattern",
			group: "Particle path",
			label: "Offset pattern",
			optionsKey: "offPatterns",
			format: labelFrom({original: "Original", inverted: "Inverted", eidolons: "Eidolons (stepped)"}),
		},
		{key: "offSpread", group: "Particle path", label: "Spread (xoff_h - xoff_l)", optionsKey: "offSpreads"},
		{
			key: "noiseCosMap",
			group: "Particle path",
			label: "noise_cos mapping",
			optionsKey: "noiseCosMaps",
			format: labelFrom({abs: "Folded |noise_cos|", signed: "Full noise_cos", "signed crossed": "Full, low/high swapped"}),
		},
		{
			key: "offMap",
			group: "Particle path",
			label: "x/y offset sweep",
			optionsKey: "offMaps",
			format: labelFrom({cos: "cos_val, full", "cos split": "cos_val, halves", off_cos: "off_cos"}),
		},

		{
			key: "noiseRange",
			group: "Noise",
			label: "Noise to position",
			optionsKey: "noiseRanges",
			format: labelFrom({"standard [0,1]": "Standard (0 to 1)", "custom [-1,1]": "Offset (-1 to 1)"}),
		},
		{key: "noiseOctaves", group: "Noise", label: "noiseDetail octaves", optionsKey: "noiseOctaves"},
		{key: "noiseFalloff", group: "Noise", label: "noiseDetail falloff", optionsKey: "noiseFalloffs"},

		// one row per oscillator: value = fn(frame × frequency)
		...WAVES.flatMap((w) => [
			{key: `${w.key}Fn`, group: "Waves: fn(frame × frequency)", label: `${w.name} (${w.drives})`, optionsKey: "waveFns"},
			{key: `${w.key}Freq`, group: "Waves: fn(frame × frequency)", label: `${w.name} frequency`, optionsKey: "waveFreqs"},
		]),

		{
			key: "paletteStart",
			group: "Color",
			label: "Palette first color",
			optionsKey: "paletteStarts",
			// basePalette lives in sketch.js, which is loaded by the time the panel builds its selects
			format: (v) => (v === "random" ? "Random" : `${basePalette[v].name} #${basePalette[v].hex}`),
		},
		{
			key: "colorSource",
			group: "Color",
			label: "Color follows",
			optionsKey: "colorSources",
		},
		{
			key: "briSource",
			group: "Color",
			label: "Brightness follows",
			optionsKey: "briSources",
		},

		{key: "particleBoost", group: "Render", label: "Particle density", optionsKey: "particleBoosts", format: (v) => `×${v}`},
		{key: "alphaScale", group: "Render", label: "Ink opacity", optionsKey: "alphaScales", format: (v) => `${v * 100}%`},
		{
			key: "renderFrames",
			group: "Render",
			label: "Render length (frames)",
			optionsKey: "renderFrames",
			format: (v) => (v === "auto" ? "Auto (by symmetry)" : v),
		},
		{key: "pixelRatio", group: "Render", label: "Pixel density", optionsKey: "pixelRatios", format: (v) => `${v}×`},
	],

	resolved: {},

	lockedSeeds: null,
};

// Derives resolved values from current selections.
// Call this once after any change to PARAMS_UI.current.
window.resolveParams = function resolveParams() {
	const {current, options, maps} = window.PARAMS_UI;
	const fallback = window.PARAMS_UI.defaults ?? {};
	// values restored from storage / JSON are only kept if they exist in the dropdown,
	// otherwise the default is written back so the select shows what is rendered
	const pick = (key, optionsKey) => {
		const value = current[key];
		if (options[optionsKey].some((o) => String(o) === String(value))) return value;
		current[key] = fallback[key] ?? options[optionsKey][0];
		return current[key];
	};
	const frames = pick("renderFrames", "renderFrames");
	const paletteStart = pick("paletteStart", "paletteStarts");

	// Mutate the *same* object so any `const` alias (CURRENT_PARAMS) stays live.
	Object.assign(window.PARAMS_UI.resolved, {
		shape: pick("shape", "shapes"),
		angles: maps.symmetry[pick("symmetry", "symmetries")],
		posRange: maps.zoom[pick("zoom", "zooms")],
		inkScale: maps.lineWidth[pick("lineWidth", "lineWidths")],
		offPattern: maps.offPattern[pick("offPattern", "offPatterns")],
		offSpread: Number(pick("offSpread", "offSpreads")),
		noiseCosMap: pick("noiseCosMap", "noiseCosMaps"),
		offMap: pick("offMap", "offMaps"),
		noiseRange: maps.noiseRange[pick("noiseRange", "noiseRanges")],
		noiseOctaves: Number(pick("noiseOctaves", "noiseOctaves")),
		noiseFalloff: Number(pick("noiseFalloff", "noiseFalloffs")),
		// waves.cos = {fn: "cos", freq: 50}, waves.noise = ...
		waves: Object.fromEntries(WAVES.map((w) => [w.key, {fn: pick(`${w.key}Fn`, "waveFns"), freq: Number(pick(`${w.key}Freq`, "waveFreqs"))}])),
		colorSource: pick("colorSource", "colorSources"),
		briSource: pick("briSource", "briSources"),
		paletteStart: paletteStart === "random" ? null : Number(paletteStart),
		particleBoost: Number(pick("particleBoost", "particleBoosts")),
		alphaScale: Number(pick("alphaScale", "alphaScales")),
		maxFrames: frames === "auto" ? null : Number(frames),
		pixelRatio: Number(pick("pixelRatio", "pixelRatios")),
	});
};

// Inserts a title above the first control of each `group` (the panel renders a flat grid).
window.groupPanelControls = function groupPanelControls() {
	const form = document.querySelector(".controls-form");
	if (!form || form.querySelector(".controls-group-title")) return;

	let previous;
	for (const def of window.PARAMS_UI.ui) {
		if (!def.group || def.group === previous) continue;
		previous = def.group;
		const row = document.getElementById(def.id || `param-${def.key}`)?.closest(".select-row");
		if (!row) continue;
		const title = document.createElement("div");
		title.className = "controls-group-title";
		title.textContent = def.group;
		form.insertBefore(title, row);
	}
};

// Populate resolved on first load.
window.resolveParams();

const CURRENT_PARAMS = window.PARAMS_UI.resolved;
