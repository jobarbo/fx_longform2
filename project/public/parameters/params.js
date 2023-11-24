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

const seedArr = [
	['-1', 100],
	['ooEyaG5QTXgfkTVUHdMxCCoj6VDMGCrgS23bGdii8mBr7HBQmPn', 100],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(seed) {
	// SET DEFAULTS IF NOT PASSED IN
	if (seed === undefined) {
		seed = weighted_choice(seedArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		seed: seed,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}
