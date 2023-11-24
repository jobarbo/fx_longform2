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
$fx.features({
	seed: seed,
});

console.log($fx.getFeatures());
//FXHASH random function for specific implimentation
fx = $fx;
fxhash = $fx.hash;
fxrand = $fx.rand;
rand = fxrand;

// check current date and time and at each hour change the seed
let date = new Date();
let hour = date.getHours();
let minute = date.getMinutes();
let day = date.getDay();
let month = date.getMonth();
let year = date.getFullYear();

// when the hour changes, change the seed

// set timeout to restart the animation after 10 seconds
setTimeout(() => {
	// fade in the canvas by adding the class 'unload' to the canvas element
	// this class has a transition in the css file
	let new_hour = new Date().getHours();
	if (new_hour != hour) {
		hour = new_hour;
		document.querySelector('canvas').classList.add('unload');
		document.querySelector('canvas').classList.remove('load');
		setTimeout(() => {
			location.reload();
		}, 100);
	}

	//document.querySelector('canvas').classList.add('unload');
	// reload the page
	//location.reload();
}, 3600000);
if (seed == -1) {
	seed = parseInt(fxrand() * 10000000);
}
console.log(seed);
