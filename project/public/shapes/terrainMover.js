// Convex silhouette of a building footprint swept away from a point light.
function terrainShadowHull(points) {
	const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
	const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
	const half = (list) => {
		const hull = [];
		for (const p of list) {
			while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop();
			hull.push(p);
		}
		hull.pop();
		return hull;
	};
	return [...half(sorted), ...half([...sorted].reverse())];
}

function createTerrainLighting(region, bounds, seed) {
	const {left, right, top, bottom, step} = bounds;
	let state = Math.floor(seed * 104729) >>> 0;
	const random = () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 4294967296;
	};
	const lightX = CURRENT_PARAMS.terrainLightX ?? -1;
	const elevation = CURRENT_PARAMS.terrainLightHeight ?? 1;
	const shadows = region.foundations.map((building) => {
		const worldX = ((building.center - left) / (right - left)) * 2 - 1;
		const dx = ((worldX - lightX) * building.height * 1.4) / elevation;
		const dy = (building.height * (0.55 + region.depth * 0.3)) / elevation;
		const hull = terrainShadowHull([...building.footprint, ...building.footprint.map((p) => ({x: p.x + dx, y: p.y + dy}))]);
		const origin = {x: building.footprint.reduce((sum, p) => sum + p.x, 0) / building.footprint.length, y: building.footprint.reduce((sum, p) => sum + p.y, 0) / building.footprint.length};
		return {hull, dx, dy, origin, softness: Math.max(4 * MULTIPLIER, building.width * (0.25 + (1 - region.depth) * 0.25))};
	});
	const cols = 160,
		rows = 100;
	const values = new Float32Array(cols * rows);
	const vx = new Float32Array(cols * rows),
		vy = new Float32Array(cols * rows);
	for (let row = 0; row < rows; row++)
		for (let col = 0; col < cols; col++) {
			const x = left + (col / (cols - 1)) * (right - left),
				y = top + (row / (rows - 1)) * (bottom - top);
			const j = region.columnAt(x),
				a = Math.max(0, j - 3),
				b = Math.min(region.top.length - 1, j + 3);
			const slope = (region.top[b] - region.top[a]) / ((b - a) * step);
			const roll = Math.exp(-Math.max(0, y - region.top[j]) / ((bottom - top) * 0.2));
			const nx = -slope * roll * 1.6,
				ny = -roll,
				nz = 1;
			const lx = lightX - ((x - left) / (right - left)) * 12 + 1,
				ly = -1;
			const diffuse = Math.max(0, (nx * lx + ny * ly + nz * elevation) / (Math.hypot(nx, ny, nz) * Math.hypot(lx, ly, elevation)));
			let shadow = 0,
				directionX = -lightX,
				directionY = 0.6;
			for (const source of shadows) {
				let edgeDistance = Infinity;
				for (let i = 0; i < source.hull.length; i++) {
					const p = source.hull[i],
						q = source.hull[(i + 1) % source.hull.length];
					const ex = q.x - p.x,
						ey = q.y - p.y;
					edgeDistance = Math.min(edgeDistance, (ex * (y - p.y) - ey * (x - p.x)) / Math.hypot(ex, ey));
				}
				const length = Math.hypot(source.dx, source.dy);
				const travel = Math.max(0, ((x - source.origin.x) * source.dx + (y - source.origin.y) * source.dy) / (length * length));
				// A widening penumbra and a fading tail avoid a constant dark plateau.
				const softness = source.softness + travel * length * 0.22;
				const coverage = (1 / (1 + Math.exp(-edgeDistance / softness))) * Math.exp(-travel * 1.1);
				shadow = 1 - (1 - shadow) * (1 - coverage * 0.8);
				directionX += (source.dx / length) * coverage;
				directionY += (source.dy / length) * coverage;
			}
			const index = row * cols + col;
			values[index] = Math.min(1, shadow * 0.95 + (0.62 - diffuse) * 0.35 - 0.12);
			const directionLength = Math.hypot(directionX, directionY);
			vx[index] = directionX / directionLength;
			vy[index] = directionY / directionLength + ((slope * directionX) / directionLength) * 0.25;
		}
	const sample = (x, y) => {
		const u = Math.max(0, Math.min(cols - 1.001, ((x - left) / (right - left)) * (cols - 1)));
		const v = Math.max(0, Math.min(rows - 1.001, ((y - top) / (bottom - top)) * (rows - 1)));
		const j = Math.floor(u),
			k = Math.floor(v),
			fx = u - j,
			fy = v - k,
			i = k * cols + j;
		const mix = (data) => (data[i] * (1 - fx) + data[i + 1] * fx) * (1 - fy) + (data[i + cols] * (1 - fx) + data[i + cols + 1] * fx) * fy;
		return {shade: mix(values), x: mix(vx), y: mix(vy)};
	};
	const padding = MULTIPLIER * (8 + region.depth * 8);
	const ridgeAt = (x) => region.top[region.columnAt(x)];
	return {
		random,
		sample,
		shadows,
		padding,
		spawn() {
			// Uniform area coverage, plus an upstream band feeding the entire ridge.
			if (random() < 0.02) {
				const x = left + random() * (right - left);
				return {x, y: ridgeAt(x) - random() * padding};
			}
			return region.sample(random);
		},
		containsSimulation(x, y) {
			return x >= left - padding && x <= right + padding && y >= ridgeAt(x) - padding * 1.5 && y <= bottom + padding;
		},
	};
}

// Same show/move lifecycle as Mover, but advection follows projected light and
// terrain tangents. Every stroke is accumulated by the existing render generator.
class TerrainMover {
	constructor(region) {
		this.landscape = region;
		this.lighting = region.lighting;
		this.s = (0.155 + region.depth * 0.185) * MULTIPLIER * (CURRENT_PARAMS.particleSize ?? 0.75);
		this.phase = this.lighting.random() * Math.PI * 2;
		this.age = 0;
		this.reset();
	}
	reset() {
		const p = this.lighting.spawn();
		this.x = p.x;
		this.y = p.y;
		this.age = 0;
		this.lifetime = 124 + Math.floor(this.lighting.random() * 24);
		const flow = this.lighting.sample(this.x, this.y);
		// Start strokes upstream; the visible terrain mask trims them at the ridge.
		this.previousX = this.x - flow.x * MULTIPLIER * 3;
		this.previousY = this.y - flow.y * MULTIPLIER * 3;
	}

	show(canvas) {
		const ctx = canvas.drawingContext;
		const shade = this.lighting.sample(this.x, this.y).shade;
		const strength = CURRENT_PARAMS.terrainShading ?? 1;
		// Every particle leaves a trace, including the illuminated terrain.
		const opacity = Math.min(0.92, strength * (0.1 + this.landscape.depth * 0.1));
		const c = this.landscape.fill;
		const contrast = 1.25 + this.landscape.depth * 0.75;
		const tone = (4 - shade * 42 + Math.sin(this.phase) * 2) * contrast;
		const lightness = Math.max(3, Math.min(76, c.l + tone));
		ctx.strokeStyle = `hsla(${c.h}, ${c.s * 0.8}%, ${lightness}%, ${opacity})`;
		ctx.lineWidth = this.s;
		ctx.beginPath();
		ctx.moveTo(this.previousX, this.previousY);
		ctx.lineTo(this.x, this.y);
		ctx.stroke();
	}
	move() {
		this.previousX = this.x;
		this.previousY = this.y;
		const flow = this.lighting.sample(this.x, this.y);
		const speed = MULTIPLIER * (0.8 + this.landscape.depth * 31.8);
		const bend = Math.sin(this.phase + this.age++ * 0.12) * 0.13;
		this.x += (flow.x - flow.y * bend) * speed;
		this.y += (flow.y + flow.x * bend) * speed;
		if (!this.lighting.containsSimulation(this.x, this.y) || this.age >= this.lifetime) this.reset();
	}
}
