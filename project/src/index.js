console.log(fxhash);
console.log(fxrand());

const sp = new URLSearchParams(window.location.search);
console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {complexity, theme, composition, colorMode, strokestyle, clampvalue} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters
// this is how to define parameters
$fx.params([
	{
		id: 'number_id',
		name: 'A number/float64',
		type: 'number',
		//default: Math.PI,
		options: {
			min: 1,
			max: 10,
			step: 0.00000000000001,
		},
	},
	{
		id: 'bigint_id',
		name: 'A bigint',
		type: 'bigint',
		//default: BigInt(Number.MAX_SAFE_INTEGER * 2),
		options: {
			min: Number.MIN_SAFE_INTEGER * 4,
			max: Number.MAX_SAFE_INTEGER * 4,
			step: 1,
		},
	},
	{
		id: 'select_id',
		name: 'A selection',
		type: 'select',
		//default: "pear",
		options: {
			options: ['apple', 'orange', 'pear'],
		},
	},
	{
		id: 'color_id',
		name: 'A color',
		type: 'color',
		//default: "ff0000",
	},
	{
		id: 'boolean_id',
		name: 'A boolean',
		type: 'boolean',
		//default: true,
	},
	{
		id: 'string_id',
		name: 'A string',
		type: 'string',
		//default: "hello",
		options: {
			minLength: 1,
			maxLength: 64,
		},
	},
]);
// this is how features can be defined
$fx.features({
	complexity: $fx.getParam('complexity'),
	theme: $fx.getParam('theme'),
	composition: $fx.getParam('composition'),
	colorMode: $fx.getParam('colorMode'),
	strokestyle: $fx.getParam('strokestyle'),
	clampvalue: $fx.getParam('clampvalue'),
});

// log the parameters, for debugging purposes, artists won't have to do that
console.log('Current param values:');

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
console.log($fx.getParams());
