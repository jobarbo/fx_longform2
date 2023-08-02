//* PARAMS *//
// put global settings here if needed

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const hueArr = [
	// name, probability(0-100)
	[0.001, 25],
	[0.005, 25],
	[0.01, 25],
	[0.05, 25],
];

const modeArr = [
	['straight', 50],
	['moderate', 25],
	['crazy', 25],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(hue_type, mode_type) {
	// SET DEFAULTS IF NOT PASSED IN
	if (hue_type === undefined) {
		hue_type = weighted_choice(hueArr);
	}

	if (mode_type === undefined) {
		mode_type = weighted_choice(modeArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		hue_type: hue_type,
		mode_type: mode_type,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
