console.log(fxhash);
console.log(fxrand());

const sp = new URLSearchParams(window.location.search);
console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {complexity, theme, composition, colormode, strokestyle, clampvalue} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters
// this is how to define parameters
console.log(theme);
/* $fx.params([
	{
		id: 'complexity',
		name: 'Complexity',
		type: 'number',
		//default: Math.PI,
		options: {
			min: 1,
			max: 6,
			step: 1,
		},
	},
	{
		id: 'theme',
		name: 'Theme',
		type: 'select',
		//default: Math.PI,
		options: {
			options: ['bright', 'dark'],
		},
	},
	{
		id: 'composition',
		name: 'Composition',
		type: 'select',
		//default: Math.PI,
		options: {
			options: ['semiconstrained', 'constrained', 'compressed'],
		},
	},
	{
		id: 'colormode',
		name: 'Color Mode',
		type: 'select',
		//default: Math.PI,
		options: {
			options: ['monochrome', 'fixed', 'dynamic', 'iridescent'],
		},
	},
	{
		id: 'strokestyle',
		name: 'Stroke Style',
		type: 'select',
		//default: Math.PI,
		options: {
			options: ['thin', 'regular', 'bold'],
		},
	},
	{
		id: 'clampvalue',
		name: 'Clamp Value',
		type: 'select',
		//default: Math.PI,
		options: {
			options: [
				'0.0000015,0.25,0.25,0.0000015',
				'0.0000015,0.025,0.025,0.0000015',
				'0.00015,0.015,0.015,0.00015',
				'0.15,0.00000015,0.15,0.0000015',
				'0.0015,0.000015,0.0015,0.000015',
				'0.05,0.05,0.05,0.05',
				'0.15,0.15,0.15,0.15',
				'0.015,0.015,0.015,0.015',
				'0.0015,0.0015,0.0015,0.0015',
				'0.0000015,0.0000015,0.0000015,0.0000015',
			],
		},
	},
]); */
// this is how features can be defined
$fx.features({
	complexity: complexity,
	theme: theme,
	composition: composition,
	colormode: colormode,
	strokestyle: strokestyle,
	clampvalue: clampvalue,
});

// log the parameters, for debugging purposes, artists won't have to do that
console.log('Current param values:');

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
console.log($fx.getParams());
