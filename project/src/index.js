let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {complexity, theme, colormode, strokestyle, clampvalue} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters

// this is how features can be defined
$fx.features({
	complexity: complexity,
	theme: theme,
	colormode: colormode,
	strokestyle: strokestyle,
	clampvalue: clampvalue,
});
