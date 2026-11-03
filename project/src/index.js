console.log(fxhash);

const sp = new URLSearchParams(window.location.search);
console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {shape_type, line_type, noise_range, zoom_level} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type);
// this is how to define parameters
/* $fx.params([
	{
		id: "shape_type",
		name: "Type of",
		type: "select",
		//default: Math.PI,
		options: {
			options: ["ellipse", "rectangle"],
		},
	},
]); */
//console.log($fx.getParam("shape_type"));
// this is how features can be defined
$fx.features({
	shape_type: shape_type,
	line_type: line_type,
	noise_range: noise_range,
	zoom_level: zoom_level,
});

// log the parameters, for debugging purposes, artists won't have to do that
//console.log("Current param values:");

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
//console.log($fx.getParams());
