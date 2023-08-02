console.log(fxhash);
console.log(fxrand());

const sp = new URLSearchParams(window.location.search);
console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {hue_type, mode_type} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters
$fx.params([
	{
		id: 'hue_type',
		name: 'Type of',
		type: 'select',
		//default: Math.PI,
		options: {
			options: [0.001, 0.005, 0.01, 0.025],
		},
	},
	{
		id: 'mode_type',
		name: 'Type of',
		type: 'select',
		//default: Math.PI,
		options: {
			options: ['straight', 'moderate', 'crazy'],
		},
	},
]);
// this is how features can be defined
$fx.features({
	hue_type: $fx.getParam('hue_type'),
	mode_type: $fx.getParam('mode_type'),
});

// log the parameters, for debugging purposes, artists won't have to do that
console.log('Current param values:');

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
console.log($fx.getParams());
