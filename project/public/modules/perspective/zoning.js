// ============================================================================
// ZONING — districts, zone archetypes and the zone map of the city
// ============================================================================
// All sizes are in metres; composition.js converts them with frame.metre.

const ZONE_NAMES = ["residential", "commercial", "industrial", "park"];

// Mix of zones and density bias for each kind of city (the "District" feature)
const DISTRICTS = {
	downtown: {weights: {residential: 0.9, commercial: 1.35, industrial: 0.1, park: 0.4}, densityBias: 0.3, centreBoost: 0.35},
	mixed: {weights: {residential: 1, commercial: 0.85, industrial: 0.55, park: 0.5}, densityBias: 0, centreBoost: 0.25},
	suburb: {weights: {residential: 1.45, commercial: 0.45, industrial: 0.12, park: 0.7}, densityBias: -0.3, centreBoost: 0.15},
	industrial: {weights: {residential: 0.35, commercial: 0.5, industrial: 1.45, park: 0.25}, densityBias: -0.05, centreBoost: 0.2},
};

/**
 * Archetypes, per zone and density. Ranges are [min, max].
 *   floors, floorH   storeys and storey height
 *   plot             residential houses: plot size (each plot holds one house)
 *   parts, gap       buildings side by side along the street, and the gap between them
 *   inset            setback from the lot edge
 *   depthFill        share of the lot depth that is built
 *   facade           facade style drawn by render.js
 *   gable            chance of a pitched roof
 *   roofBlock        chance of a roof block (stairs, tanks)
 *   podium, tiers    high-rise: a base podium, then stepped tiers
 *   chimneys, silos  industrial extras (counts)
 *   trees            trees per lot (yards) or tree spacing (parks)
 */
const ZONES = {
	residential: {
		low: {floors: [1, 2], floorH: [2.8, 3.2], plot: [13, 19], house: [7.5, 11], inset: [3, 5], facade: "house", gable: 0.85, roofBlock: 0, yardTrees: [0, 2]},
		medium: {floors: [3, 6], floorH: [3, 3.3], parts: [2, 5], gap: [0, 0], inset: [0, 1.5], depthFill: [0.45, 0.8], facade: "grid", gable: 0.15, roofBlock: 0.3},
		high: {floors: [10, 30], floorH: [2.9, 3.2], parts: [1, 1], inset: [1, 3], depthFill: [0.8, 1], podium: [2, 3], towerShare: [0.4, 0.6], facade: "grid", roofBlock: 0.6},
	},
	commercial: {
		low: {floors: [1, 2], floorH: [3.6, 4.2], parts: [2, 6], gap: [0, 0], inset: [0, 1], depthFill: [0.5, 0.8], facade: "storefront", roofBlock: 0.25},
		medium: {floors: [5, 12], floorH: [3.4, 3.8], parts: [1, 2], gap: [0, 3], inset: [0.5, 2], depthFill: [0.7, 1], facade: "ribbon", roofBlock: 0.5},
		high: {floors: [20, 60], floorH: [3.6, 4], parts: [1, 1], inset: [2, 5], depthFill: [0.8, 1], tiers: [1, 3], facade: "curtain", roofBlock: 0.7},
	},
	industrial: {
		low: {floors: [1, 1], floorH: [6, 9], parts: [1, 2], gap: [4, 10], inset: [2, 6], depthFill: [0.6, 0.9], facade: "industrial", roofBlock: 0.2},
		medium: {floors: [1, 1], floorH: [8, 14], parts: [1, 2], gap: [4, 10], inset: [2, 5], depthFill: [0.55, 0.8], facade: "industrial", roofBlock: 0.4, chimneys: [1, 2]},
		high: {floors: [1, 1], floorH: [10, 18], parts: [1, 1], inset: [2, 4], depthFill: [0.5, 0.65], facade: "industrial", roofBlock: 0.5, chimneys: [1, 3], silos: [2, 6]},
	},
	park: {
		low: {treeSpacing: 15, paths: 1},
		medium: {treeSpacing: 10, paths: 2},
		high: {treeSpacing: 6.5, paths: 1},
	},
};

/**
 * Zone map over grid coordinates (x, y): one noise field per zone, weighted by
 * the district, so neighbouring lots fall in the same quarter. Density rises
 * toward `centre`.
 */
function makeZoneMap(district, centre) {
	const d = DISTRICTS[district];
	const offsets = ZONE_NAMES.map(() => [random(1000), random(1000)]);
	const densityOffset = [random(1000), random(1000)];

	return function zoneAt(x, y) {
		let best = null;
		let bestScore = -Infinity;
		ZONE_NAMES.forEach((zone, k) => {
			// Parks come in smaller patches than the other zones
			const f = zone === "park" ? 0.42 : 0.16;
			const score = noise(x * f + offsets[k][0], y * f + offsets[k][1]) * d.weights[zone];
			if (score > bestScore) {
				bestScore = score;
				best = zone;
			}
		});

		const dist = Math.hypot(x - centre.x, y - centre.y);
		const v = noise(x * 0.22 + densityOffset[0], y * 0.22 + densityOffset[1]) + d.densityBias + d.centreBoost * Math.exp(-(dist * dist) / 18);
		const density = v < 0.45 ? "low" : v < 0.62 ? "medium" : "high";
		return {zone: best, density};
	};
}
