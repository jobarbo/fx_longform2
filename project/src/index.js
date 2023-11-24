console.log(fxhash);

const sp = new URLSearchParams(window.location.search);
//console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {seed} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters
// this is how to define parameters
//console.log(theme);
// this is how features can be defined
$fx.features(composition_params);

$fx.params([
	{
		id: 'number_id',
		name: 'A number/float64',
		type: 'number',
		//default: Math.PI,
		options: {
			min: 1,
			max: 10,
			step: 0.0001,
		},
	},
]);

//FXHASH random function for specific implimentation
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;

const Hour = 3_600_000;
// set timeout to restart the animation after 10 seconds
setTimeout(() => {
	console.log('Trigger a reload');
	document.querySelector('canvas').classList.add('unload');
	document.querySelector('canvas').classList.remove('load');
	setTimeout(() => {
		location.reload();
	}, 100);
	//FIXME set this back to Hour for release
}, 10_000 /* Hour */);
