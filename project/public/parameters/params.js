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
