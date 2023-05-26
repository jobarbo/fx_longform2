console.log(fxhash);
console.log(fxrand());

const sp = new URLSearchParams(window.location.search);
console.log(sp);

let composition_params;

composition_params = generate_composition_params();

var {palette_type, cell_type, octave_type} = composition_params; // unpacking parameters we need in main.js and turning them into globals
console.log(cell_type);

// this is how to define parameters
$fx.params([
	{
		id: 'palette_type',
		name: 'Type of',
		type: 'select',
		//default: Math.PI,
		options: {
			options: [
				'temperate broadleaf',
				'barren rocky',
				'blackwhite',
				'redblack',
				'blueyellow',
				'pastel',
				'bluepink',
				'hunt',
				'france',
			],
		},
	},
]);

// this is how features can be defined
$fx.features({
	biome: palette_type,
	biomeColorList: Object.values(palettes[palette_type]),
	cellSize: cell_type,
	octaves: octave_type,
});

console.log($fx.getFeatures());
// log the parameters, for debugging purposes, artists won't have to do that
//console.log('Current param values:');

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
//console.log($fx.getParams());
