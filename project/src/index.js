// Wait for library manager to load fxhash before using it
async function initWithFxhash() {
	// Make sure libManager exists and fxhash is loaded
	if (typeof window.libManager !== "undefined") {
		await window.libManager.loadModule("logs"); // Load logger first
		await window.libManager.loadModule("fxhash");
		await window.libManager.loadModule("params");
	}

	// Get logger reference
	const logger = window.Logger || console;

	// Now we can safely use fxhash
	logger.info ? logger.info("FX Hash: " + fxhash) : logger.log("FX Hash:", fxhash);
	logger.info ? logger.info("FX Random: " + fxrand()) : logger.log("FX Random:", fxrand());

	const sp = new URLSearchParams(window.location.search);
	logger.debug ? logger.debug("URL Search Params: " + sp.toString()) : logger.log("URL Search Params:", sp);

	let composition_params;

	composition_params = generate_composition_params();
	logger.debug ? logger.debug("Composition params: " + JSON.stringify(composition_params)) : logger.log("Composition params:", composition_params);

	var {shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode} = composition_params; // unpacking parameters we need in main.js and turning them into globals

	logger.debug
		? logger.debug("Unpacked params: " + JSON.stringify({shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode}))
		: logger.log("Unpacked params:", {shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode});
	// this is how to define parameters
	$fx.params([
		{
			id: "shape_type",
			name: "Type of",
			type: "select",
			//default: Math.PI,
			options: {
				options: ["ellipse", "rectangle"],
			},
		},
	]);
	logger.info ? logger.info("Shape type param: " + $fx.getParam("shape_type")) : logger.log("Shape type param:", $fx.getParam("shape_type"));
	// this is how features can be defined
	$fx.features({
		shape_type: $fx.getParam("shape_type"),
	});

	// log the parameters, for debugging purposes, artists won't have to do that
	logger.info ? logger.info("Current param values:") : logger.log("Current param values:");

	// Added addtional transformation to the parameter for easier usage
	// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
	logger.table ? logger.table("FX Parameters", $fx.getParams()) : logger.log("FX Parameters:", $fx.getParams());
}

// Initialize when DOM is ready or immediately if already loaded
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initWithFxhash);
} else {
	// Add a small delay to ensure libManager is available
	setTimeout(initWithFxhash, 100);
}
