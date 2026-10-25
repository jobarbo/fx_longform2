//* PARAMS *//
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;
seed = parseInt(fxrand() * 10000000);

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const perspectiveArr = [
	// name, probability(0-100)
	["1pt", 45],
	["2pt", 55],
];

const horizonArr = [
	["low", 30],
	["mid", 40],
	["high", 30],
];

const horizonFrac = {low: 0.72, mid: 0.64, high: 0.55};

const vpSpreadArr = [
	["narrow", 40],
	["wide", 60],
];

const lightArr = [
	["left", 50],
	["right", 50],
];

const districtArr = [
	["downtown", 25],
	["mixed", 35],
	["suburb", 25],
	["industrial", 15],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(perspective_type, horizon, vp_spread, light, district) {
	// SET DEFAULTS IF NOT PASSED IN
	if (perspective_type === undefined) perspective_type = weighted_choice(perspectiveArr);
	if (horizon === undefined) horizon = weighted_choice(horizonArr);
	if (vp_spread === undefined) vp_spread = weighted_choice(vpSpreadArr);
	if (light === undefined) light = weighted_choice(lightArr);
	if (district === undefined) district = weighted_choice(districtArr);

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		perspective_type: perspective_type,
		horizon: horizon,
		horizon_frac: horizonFrac[horizon],
		vp_spread: vp_spread,
		light: light,
		district: district,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
