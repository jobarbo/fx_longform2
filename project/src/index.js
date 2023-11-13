console.log(fxhash);

const sp = new URLSearchParams(window.location.search);
//console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {complexity, theme, composition, colormode, strokestyle, clampvalue} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters
// this is how to define parameters
//console.log(theme);
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
//console.log('Current param values:');

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
//console.log($fx.getParams());
