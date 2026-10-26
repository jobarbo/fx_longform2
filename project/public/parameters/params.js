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

// Landscape beyond the city: a foreground (just past the city) and a compatible background
const foregroundArr = [
	["plain", 25],
	["ocean", 20],
	["lake", 20],
	["desert", 15],
	["valley", 20],
];

const LANDSCAPE_PAIRS = {
	ocean: [
		["mountains", 3],
		["cliff", 3],
		["hills", 2],
		["none", 4],
	],
	lake: [
		["mountains", 4],
		["hills", 4],
		["cliff", 2],
		["mesas", 1],
	],
	plain: [
		["hills", 4],
		["mountains", 3],
		["cliff", 1],
		["none", 2],
	],
	desert: [
		["mesas", 5],
		["cliff", 3],
		["mountains", 2],
		["none", 1],
	],
	valley: [
		["mountains", 5],
		["cliff", 2],
		["hills", 2],
	],
};

const citySizeArr = [
	["small", 30],
	["medium", 45],
	["large", 25],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(perspective_type, horizon, vp_spread, light, district, foreground, background, city_size) {
	// SET DEFAULTS IF NOT PASSED IN
	if (perspective_type === undefined) perspective_type = weighted_choice(perspectiveArr);
	if (horizon === undefined) horizon = weighted_choice(horizonArr);
	if (vp_spread === undefined) vp_spread = weighted_choice(vpSpreadArr);
	if (light === undefined) light = weighted_choice(lightArr);
	if (district === undefined) district = weighted_choice(districtArr);
	if (foreground === undefined) foreground = weighted_choice(foregroundArr);
	if (background === undefined) background = weighted_choice(LANDSCAPE_PAIRS[foreground]);
	if (city_size === undefined) city_size = weighted_choice(citySizeArr);

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		perspective_type: perspective_type,
		horizon: horizon,
		horizon_frac: horizonFrac[horizon],
		vp_spread: vp_spread,
		light: light,
		district: district,
		foreground: foreground,
		background: background,
		city_size: city_size,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
