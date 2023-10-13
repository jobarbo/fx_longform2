//* PARAMS *//
// put global settings here if needed

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	['1', 20],
	['2', 70],
	['3', 5],
	['4', 2],
	['5', 2],
	['6', 1],
];

const themeArr = [
	['bright', 50],
	['dark', 50],
];

const compositionArr = [
	['semiconstrained', 33],
	['constrained', 33],
	['compressed', 33],
];

const colorModeArr = [
	['monochrome', 100],
	['fixed', 0],
	['dynamic', 0],
	['iridescent', 0],
];

const strokestyleArr = [
	['thin', 100],
	['regular', 0],
	['bold', 0],
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
