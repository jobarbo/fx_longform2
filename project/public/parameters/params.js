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
// Same controls as retro-futura, as multipliers on the active config ("config" = keep the config value).
window.PARAMS_UI = window.PARAMS_UI ?? {
	// ---- Available options (drives the UI dropdowns) ----
	options: {
		configs: Object.keys(LIGNIS_CONFIGS),
		reentryModes: ["degrade", "ligne"],
		populations: ["config", 100000, 300000, 500000, 1000000, 1500000, 2500000, 3500000],
		particleSizes: ["config", 0.25, 0.35, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
		horizontalSpeeds: ["veryFast", "fast", "standard", "slow", "snail"],
		verticalSpeeds: ["veryFast", "fast", "standard", "slow", "snail"],
		innerFlowLevels: ["low", "standard", "medium", "high"],
		outerFlowLevels: ["low", "standard", "medium", "high"],
		horizontalPatternIntensities: ["low", "normal", "high", "intense", "extreme"],
		verticalPatternIntensities: ["low", "normal", "high", "intense", "extreme"],
		octaveLevels: ["config", 1, 2, 3, 4, 5],
		printDPIs: [1, 2, 3, 4, 5],
		exposures: ["config", 5, 10, 15, 20, 25, 30, 35],
		presentations: ["off", "on", "horizontal"],
		externalFrame: ["on", "off"],
		swirlIndex: ["none", "low", "medium", "high", "veryHigh", "extreme"],
		zigzag: ["hairline", "fine", "normal", "large", "XL"],
		noiseScale: ["low", "medium", "high", "intense", "extreme"],
		palettes: [],
		paletteDirections: ["default", "reversed"],
	},

	// ---- Lookup maps (enum → multiplier) ----
	maps: {
		swirl: {none: 1, low: 2, medium: 5, high: 10, veryHigh: 25, extreme: 50},
		zigzag: {hairline: 0.36, fine: 0.6, normal: 1, large: 1.4, XL: 1.8},
		noiseScale: {low: 1, medium: 2, high: 4, intense: 6, extreme: 8},
		patternIntensity: {low: 0.5, normal: 1, high: 1.5, intense: 2, extreme: 4},
		speed: {veryFast: 0.33, fast: 0.56, standard: 1, slow: 1.67, snail: 11.1},
		innerFlow: {low: 0.5, standard: 1, medium: 2, high: 5},
		outerFlow: {low: 0.5, standard: 1, medium: 2, high: 5},
	},

	// ---- Current selections (string keys or plain numbers) ----
	current: {
		config: DEFAULT_CONFIG_ID,
		reentry: "degrade",
		population: "config",
		particleSize: "config",
		horizontalSpeed: "standard",
		verticalSpeed: "standard",
		innerFlowLevel: "standard",
		outerFlowLevel: "standard",
		horizontalPatternIntensity: "normal",
		verticalPatternIntensity: "normal",
		octaveLevel: "config",
		paletteName: "",
		paletteDirection: "default",
		printDPI: 2,
		exposure: "config",
		presentation: "off",
		externalFrame: "off",
		swirlIndex: "none",
		horizontalZigzag: "normal",
		verticalZigzag: "normal",
		noiseScale1: "low",
		noiseScale2: "low",
		noiseScale3: "low",
		noiseScale4: "low",
	},

	// ---- UI metadata (drives ParamsPanel control generation) ----
	ui: [
		{
			key: "config",
			id: "param-config",
			label: "Config",
			optionsKey: "configs",
			format: (id) => configLabel(id),
		},
		{
			key: "reentry",
			id: "param-reentry",
			label: "Re-entry",
			optionsKey: "reentryModes",
			format: (mode) => (mode === "degrade" ? "dégradé" : mode),
		},
		{
			key: "paletteName",
			id: "param-palette",
			label: "Palette",
			optionsKey: "palettes",
			kind: "palette",
		},
		{
			key: "paletteDirection",
			id: "param-palette-direction",
			label: "Palette direction",
			optionsKey: "paletteDirections",
			section: "palette",
		},
		{
			key: "exposure",
			id: "param-exposure",
			label: "Exposure time (in frames)",
			optionsKey: "exposures",
		},
		{
			key: "population",
			id: "param-population",
			label: "Particle population",
			optionsKey: "populations",
			format: "compactNumber",
		},
		{
			key: "particleSize",
			id: "param-particle-size",
			label: "Particle size",
			optionsKey: "particleSizes",
		},
		{
			key: "horizontalSpeed",
			id: "param-horizontal-speed",
			label: "Horizontal speed",
			optionsKey: "horizontalSpeeds",
			format: "camelToWords",
		},
		{
			key: "verticalSpeed",
			id: "param-vertical-speed",
			label: "Vertical speed",
			optionsKey: "verticalSpeeds",
			format: "camelToWords",
		},
		{
			key: "horizontalZigzag",
			id: "param-horizontal-zigzag",
			label: "Horizontal line pattern thickness",
			optionsKey: "zigzag",
		},
		{
			key: "verticalZigzag",
			id: "param-vertical-zigzag",
			label: "Vertical line pattern thickness",
			optionsKey: "zigzag",
		},
		{
			key: "horizontalPatternIntensity",
			id: "param-horizontal-pattern-intensity",
			label: "Horizontal line pattern intensity",
			optionsKey: "horizontalPatternIntensities",
		},
		{
			key: "verticalPatternIntensity",
			id: "param-vertical-pattern-intensity",
			label: "Vertical line pattern intensity",
			optionsKey: "verticalPatternIntensities",
		},

		{
			key: "innerFlowLevel",
			id: "param-inner-flow",
			label: "Inner flow strength",
			optionsKey: "innerFlowLevels",
		},
		{
			key: "outerFlowLevel",
			id: "param-outer-flow",
			label: "Outer flow strength",
			optionsKey: "outerFlowLevels",
		},

		{
			key: "swirlIndex",
			id: "param-swirl-index",
			label: "Swirl intensity",
			optionsKey: "swirlIndex",
		},
		{
			key: "noiseScale1",
			id: "param-noise-scale-1",
			label: "1",
			optionsKey: "noiseScale",
		},
		{
			key: "noiseScale2",
			id: "param-noise-scale-2",
			label: "2",
			optionsKey: "noiseScale",
		},
		{
			key: "noiseScale3",
			id: "param-noise-scale-3",
			label: "3",
			optionsKey: "noiseScale",
		},
		{
			key: "noiseScale4",
			id: "param-noise-scale-4",
			label: "4",
			optionsKey: "noiseScale",
		},
		{
			key: "octaveLevel",
			id: "param-octave-level",
			label: "Octave",
			optionsKey: "octaveLevels",
		},
		{
			key: "printDPI",
			id: "param-dpi",
			label: "Print DPI",
			optionsKey: "printDPIs",
		},
		{
			key: "externalFrame",
			id: "param-external-frame",
			label: "External frame",
			optionsKey: "externalFrame",
		},
		{
			key: "presentation",
			id: "param-presentation",
			label: "Presentation mode",
			optionsKey: "presentations",
			kind: "presentation",
		},
	],

	// ---- Resolved values ----
	resolved: {},

	lockedSeeds: null,
};

function configLabel(id) {
	const cfg = LIGNIS_CONFIGS[id];
	return cfg ? `${cfg.family} · ${cfg.label}` : id;
}

function configOverride(value, fallback) {
	const num = Number(value);
	return value === "config" || !Number.isFinite(num) ? fallback : num;
}

// Read by Mover / INIT, mutated in place
const ACTIVE_CONFIG = {};

function resolveActiveConfig(current, maps) {
	const base = LIGNIS_CONFIGS[current.config] ?? LIGNIS_CONFIGS[DEFAULT_CONFIG_ID];
	const speedX = maps.speed[current.horizontalSpeed] ?? 1;
	const speedY = maps.speed[current.verticalSpeed] ?? 1;
	const swirl = maps.swirl[current.swirlIndex] ?? 1;
	const intensityU = maps.patternIntensity[current.horizontalPatternIntensity] ?? 1;
	const intensityV = maps.patternIntensity[current.verticalPatternIntensity] ?? 1;
	const zigzagU = maps.zigzag[current.horizontalZigzag] ?? 1;
	const zigzagV = maps.zigzag[current.verticalZigzag] ?? 1;
	const noiseScales = [current.noiseScale1, current.noiseScale2, current.noiseScale3, current.noiseScale4].map((level) => maps.noiseScale[level] ?? 1);
	const scaleRange = ([lo, hi], k) => [lo * k, hi * k];
	// dégradé = OG re-entry, ligne = the config's own
	const reentry = current.reentry === "ligne" ? base : LIGNIS_CONFIGS.og;

	const resolved = defineConfig(base, {
		flow: {
			octave: configOverride(current.octaveLevel, base.flow.octave),
			a1: base.flow.a1 * swirl,
			a2: base.flow.a2 * swirl,
		},
		noise: {noiseScale: base.noise.noiseScale.map((ns, i) => ns * noiseScales[i])},
		bounds: {
			maxU: scaleRange(base.bounds.maxU, intensityU),
			minU: scaleRange(base.bounds.minU, intensityU),
			maxV: scaleRange(base.bounds.maxV, intensityV),
			minV: scaleRange(base.bounds.minV, intensityV),
		},
		uv: {
			inner: base.uv.inner * (maps.innerFlow[current.innerFlowLevel] ?? 1),
			span: base.uv.span * (maps.outerFlow[current.outerFlowLevel] ?? 1),
		},
		zz: {ku: base.zz.ku * zigzagU, kv: base.zz.kv * zigzagV, kNeg: base.zz.kNeg === null ? null : base.zz.kNeg * zigzagU},
		motion: {xDiv: base.motion.xDiv * speedX, yDiv: base.motion.yDiv * speedY, reentryDecay: reentry.motion.reentryDecay},
		wrap: {reentry: reentry.wrap.reentry},
		render: {
			particleSize: configOverride(current.particleSize, base.render.particleSize),
			particleNum: configOverride(current.population, base.render.particleNum),
			maxFrames: configOverride(current.exposure, base.render.maxFrames),
		},
	});

	for (const key of Object.keys(ACTIVE_CONFIG)) delete ACTIVE_CONFIG[key];
	Object.assign(ACTIVE_CONFIG, resolved, {id: LIGNIS_CONFIGS[current.config] ? current.config : DEFAULT_CONFIG_ID});
}

window.resolveParams = function resolveParams() {
	const {current, maps} = window.PARAMS_UI;
	Object.assign(window.PARAMS_UI.resolved, {
		config: current.config,
		reentry: current.reentry,
		paletteName: current.paletteName,
		paletteDirection: current.paletteDirection ?? "default",
		printDPI: configOverride(current.printDPI, 2),
		presentation: current.presentation,
		showExternalFrame: current.externalFrame === "on",
	});
	resolveActiveConfig(current, maps);
};

window.resolveParams();

window.groupNoiseScaleControls = function groupNoiseScaleControls() {
	const form = document.querySelector(".controls-form");
	if (!form || form.querySelector(".noise-scale-group")) return;

	const rows = ["param-noise-scale-1", "param-noise-scale-2", "param-noise-scale-3", "param-noise-scale-4"]
		.map((id) => document.getElementById(id)?.closest(".select-row"))
		.filter(Boolean);

	if (rows.length !== 4) return;

	const group = document.createElement("div");
	group.className = "noise-scale-group";

	const title = document.createElement("div");
	title.className = "noise-scale-group__title";
	title.textContent = "Noise scale";

	const controls = document.createElement("div");
	controls.className = "noise-scale-group__controls";

	group.append(title, controls);
	form.insertBefore(group, rows[0]);
	rows.forEach((row) => controls.appendChild(row));
};

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
