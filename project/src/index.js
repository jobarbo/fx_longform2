// Parameters are generated once here, before p5 runs setup() in sketch.js
const composition_params = generate_composition_params();
window.composition_params = composition_params;

// this is how features can be defined
$fx.features({
	Perspective: composition_params.perspective_type === "1pt" ? "1 point" : "2 points",
	Horizon: composition_params.horizon,
	"Vanishing spread": composition_params.perspective_type === "2pt" ? composition_params.vp_spread : "none",
	Light: composition_params.light,
	Density: composition_params.density_name,
});

console.log("features", $fx.getFeatures());
