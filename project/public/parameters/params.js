//* PARAMS *//
// put global settings here if needed
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
	["ellipse", 50],
	["rectangle", 50],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(shape_type) {
	// SET DEFAULTS IF NOT PASSED IN
	if (shape_type === undefined) {
		shape_type = weighted_choice(shapeArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		shape_type: shape_type,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
