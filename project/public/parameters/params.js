//* PARAMS *//
// put global settings here if needed

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	['1 octaves', 20],
	['2 octaves', 70],
	['3 octaves', 5],
	['4 octaves', 2],
	['5 octaves', 2],
	['6 octaves', 1],
];

const themeArr = [
	['bright', 50],
	['dark', 50],
];

const compositionArr = [
	['semiconstrained', 33],
	['constrained', 33],
	['compresed', 33],
];

const colorModeArr = [
	['monochrome', 25],
	['fixed', 25],
	['dynamic', 25],
	['iridescent', 25],
];

const strokestyleArr = [
	['thin', 33],
	['regular', 33],
	['bold', 33],
];

const clampvalueArr = [
	['0.0000015,0.25,0.25,0.0000015', 50],
	['0.0000015,0.025,0.025,0.0000015', 50],
	['0.00015,0.015,0.015,0.00015', 50],
	['0.15,0.00000015,0.15,0.0000015', 50],
	['0.0015,0.000015,0.0015,0.000015', 50],
	['0.05,0.05,0.05,0.05', 50],
	['0.15,0.15,0.15,0.15', 50],
	['0.015,0.015,0.015,0.015', 50],
	['0.0015,0.0015,0.0015,0.0015', 50],
	['0.0000015,0.0000015,0.0000015,0.0000015', 50],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(complexity, theme, composition, colorMode, strokestyle, clampvalue) {
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

	if (colorMode === undefined) {
		colorMode = weighted_choice(colorModeArr);
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
		colorMode: colorMode,
		strokestyle: strokestyle,
		clampvalue: clampvalue,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
