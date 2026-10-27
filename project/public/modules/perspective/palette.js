// ============================================================================
// PALETTE — the colours laid on the paper under the graphite
// ============================================================================
// Tints are RGB, multiplied on the paper like coloured pencil: a light tint
// barely colours it. The graphite shading laid over them darkens them in turn.
// Picks are seeded by position (pencilRng), so colouring never draws on p5's
// random and never changes a composition.

const TINTS = {
	wall: {
		house: [
			[240, 218, 172],
			[230, 196, 164],
			[206, 216, 224],
			[216, 224, 196],
			[246, 240, 226],
			[234, 204, 194],
		],
		grid: [
			[208, 146, 116],
			[224, 188, 142],
			[216, 206, 190],
			[194, 126, 104],
			[226, 214, 186],
		],
		storefront: [
			[238, 208, 162],
			[214, 228, 214],
			[232, 192, 172],
			[214, 210, 228],
			[242, 228, 198],
		],
		ribbon: [
			[220, 216, 208],
			[208, 208, 212],
			[228, 220, 202],
		],
		curtain: [
			[172, 198, 236],
			[184, 206, 238],
			[196, 214, 236],
			[188, 214, 226],
		],
		industrial: [
			[206, 208, 206],
			[200, 164, 138],
			[192, 206, 198],
			[222, 214, 192],
		],
		chimney: [[198, 124, 100]],
		plain: [[204, 202, 198]],
	},
	roof: [
		[198, 114, 88],
		[152, 162, 178],
		[172, 134, 112],
		[188, 100, 84],
	],
	flatRoof: [[210, 207, 202]],
	glass: [198, 214, 236],
	crown: {
		round: [
			[170, 198, 122],
			[148, 186, 114],
			[186, 206, 130],
			[134, 172, 112],
		],
		conifer: [
			[122, 162, 122],
			[112, 152, 126],
		],
		shrub: [[178, 182, 132]],
	},
	trunk: [152, 120, 94],
	lamp: [114, 134, 130],
	bench: [196, 150, 110],
	silo: [216, 220, 224],
	awning: [
		[216, 96, 84],
		[96, 146, 124],
		[96, 126, 174],
		[232, 190, 96],
		[204, 114, 144],
	],
	// Terrain: [farthest layer, nearest layer]
	terrain: {
		mountain: [
			[178, 184, 214],
			[162, 180, 164],
		],
		hills: [
			[190, 206, 196],
			[174, 200, 144],
		],
		flank: [
			[186, 202, 192],
			[168, 194, 140],
		],
		scree: [
			[206, 198, 186],
			[198, 186, 168],
		],
		cliff: [
			[206, 198, 186],
			[198, 184, 164],
		],
		mesa: [
			[226, 180, 152],
			[222, 152, 114],
		],
		dune: [
			[238, 218, 176],
			[236, 206, 156],
		],
	},
	// Ground beyond the city, by foreground
	land: {
		plain: [214, 226, 172],
		valley: [202, 222, 164],
		desert: [238, 216, 172],
		ocean: [216, 224, 184],
		lake: [212, 224, 180],
	},
	ground: {
		street: [212, 210, 216],
		road: [212, 210, 214],
		sidewalk: [228, 224, 214],
		water: [166, 198, 238],
		marking: [246, 206, 72],
	},
	lot: {
		residential: [208, 224, 172],
		park: [182, 212, 142],
		commercial: [224, 218, 206],
		industrial: [212, 208, 198],
	},
	sky: [
		[184, 212, 252],
		[244, 242, 238],
	],
	sun: [252, 222, 130],
	sunHalo: [255, 226, 150],
	cloud: [255, 255, 255],
	cloudShade: [214, 218, 232],
	glint: [255, 250, 236],
};

/** One tint of a list, picked by a seed. */
function pickTint(list, ...seed) {
	return list[Math.floor(pencilRng(...seed, 41)() * list.length)];
}

function mixTint(c0, c1, t) {
	return c0.map((v, i) => v + (c1[i] - v) * t);
}

/** RGB of an HSB colour (h in degrees, s and b in percent). */
function hsbToRgb([h, s, b]) {
	const v = (b / 100) * 255;
	const c = v * (s / 100);
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const [r, g, bl] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	return [r + v - c, g + v - c, bl + v - c];
}

/** Tints of a box: walls (from its facade style), roof slopes, flat roof. Cached on it. */
function boxTints(bx) {
	if (!bx.tints) {
		const facade = bx.style.facade && TINTS.wall[bx.style.facade] ? bx.style.facade : "plain";
		bx.tints = {
			wall: pickTint(TINTS.wall[facade], bx.a, bx.b),
			roof: pickTint(TINTS.roof, bx.a, bx.b, 2),
			top: TINTS.flatRoof[0],
		};
	}
	return bx.tints;
}

/** Tint of one face of a box. */
function faceTint(bx, face) {
	const t = boxTints(bx);
	return face.kind === "slope" ? t.roof : face.kind === "top" ? t.top : t.wall;
}
