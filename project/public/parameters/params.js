//* PARAMS *//
// put global settings here if needed
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;
features = $fx.getFeatures();
seed = parseInt(fxrand() * 10_000_000);

// COMPOSITION TYPE DEFINITION
// declare functions to generate random values for each key
// main choices are weighted_choice(choices) and rand()

const paramTable = {
	seed: () => Math.floor(10_000_000 * rand()),
	x_rand_divider: () =>
		weighted_choice([
			[0.025, 50],
			[0.027123, 50],
		]),
	y_rand_divider: () =>
		weighted_choice([
			[0.025, 50],
			[0.027123, 50],
		]),
	background_color_hue: () =>
		weighted_choice([
			[0, 50],
			[100, 50],
		]),
	// TODO add all parameters that need to be randomized
};

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(params) {
	const randomizedParams = Object.fromEntries(Object.keys(paramTable).map((key) => [key, paramTable[key]()]));
	console.log('Randomized params', randomizedParams);
	params !== undefined && console.log('Override params', params);

	return {
		max_scale: 0.0025,
		min_scale: 0.00071,
		max_amp: 1200,
		min_amp: 1,
		ease_scalar: 0.25,
		...randomizedParams, // randomized on the table
		...params, // explicit overrides
	};
}
