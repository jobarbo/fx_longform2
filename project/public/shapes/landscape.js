// Independent random stream and noise lattice for each building. Neither
// particle order in other buildings nor the global noise tables affect it.
function createBuildingField(seed) {
	let state = Math.floor(seed * 104729) >>> 0;
	const random = () => {
		state = (state + 0x6D2B79F5) >>> 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const between = (a, b) => a + random() * (b - a);
	const noiseSeed = (random() * 0xffffffff) >>> 0;
	const lattice = (x, y, index) => {
		let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(index + 1, 1442695041) ^ noiseSeed;
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return ((h ^ (h >>> 16)) >>> 0) / 4294967296 - 0.5;
	};
	const rotations = Array.from({length: 128}, () => {
		const angle = between(0, Math.PI * 2);
		return {c: Math.cos(angle), s: Math.sin(angle), x: between(0, 1000), y: between(0, 1000)};
	});
	const oct = (x, y, scale, index, octaves = 1) => {
		let value = 0, frequency = 1;
		for (let o = 0; o < octaves; o++) {
			const n = index * octaves + o, r = rotations[n % rotations.length];
			const nx = (x * r.c - y * r.s) * scale * frequency + r.x;
			const ny = (y * r.c + x * r.s) * scale * frequency + r.y;
			const ix = Math.floor(nx), iy = Math.floor(ny);
			let u = nx - ix, v = ny - iy;
			u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
			const a = lattice(ix, iy, n), b = lattice(ix + 1, iy, n);
			const c = lattice(ix, iy + 1, n), d = lattice(ix + 1, iy + 1, n);
			value += ((a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v) / frequency;
			frequency *= 2;
		}
		return value;
	};
	return {
		seed, noiseSeed, random, oct,
		scale: [between(0.45, 2.8), between(0.45, 2.8), between(0.6, 2.4)],
		amplitude: [between(0.4, 3), between(0.4, 3)],
		params: {
			...CURRENT_PARAMS,
			horizontalPatternIntensity: (CURRENT_PARAMS.horizontalPatternIntensity ?? 10) * between(0.25, 2),
			verticalPatternIntensity: (CURRENT_PARAMS.verticalPatternIntensity ?? 10) * between(0.25, 2),
			noiseScale1: (CURRENT_PARAMS.noiseScale1 ?? 2) * between(0.5, 2),
			noiseScale2: (CURRENT_PARAMS.noiseScale2 ?? 1) * between(0.5, 2),
			noiseScale3: (CURRENT_PARAMS.noiseScale3 ?? 2) * between(0.5, 2),
			noiseScale4: (CURRENT_PARAMS.noiseScale4 ?? 3) * between(0.5, 2),
		},
	};
}

// A face is a small virtual canvas. Its two axes project local strokes onto
// a parallelogram; the same transform is used for seeding, drawing and bounds.
function createArchitecturalFace(origin, axisU, axisV, localWidth, localHeight, field) {
	const det = axisU.x * axisV.y - axisU.y * axisV.x;
	if (Math.abs(det) < 1e-8) throw new Error("Degenerate architectural face");
	const face = {
		origin, axisU, axisV, localWidth, localHeight, field, seed: field.seed,
		projectedScale: Math.sqrt(Math.abs(det) / (localWidth * localHeight)),
		project(x, y) {
			return {x: origin.x + axisU.x * x / localWidth + axisV.x * y / localHeight,
				y: origin.y + axisU.y * x / localWidth + axisV.y * y / localHeight};
		},
		unproject(x, y) {
			const dx = x - origin.x, dy = y - origin.y;
			return {x: (dx * axisV.y - dy * axisV.x) / det * localWidth,
				y: (dy * axisU.x - dx * axisU.y) / det * localHeight};
		},
		contains(x, y) {
			return x >= 0 && x < localWidth && y >= 0 && y < localHeight;
		},
		applyTransform(ctx) {
			ctx.transform(axisU.x / localWidth, axisU.y / localWidth,
				axisV.x / localHeight, axisV.y / localHeight, origin.x, origin.y);
		},
	};
	face.vertices = [face.project(0, 0), face.project(localWidth, 0),
		face.project(localWidth, localHeight), face.project(0, localHeight)];
	face.path = new Path2D();
	face.vertices.forEach((p, i) => i ? face.path.lineTo(p.x, p.y) : face.path.moveTo(p.x, p.y));
	face.path.closePath();
	return face;
}

function createLandscape() {
	const columns = 1024;
	const left = xMin * width, right = xMax * width, bottom = yMax * height;
	const span = right - left, tall = (yMax - yMin) * height, step = span / columns;
	const count = CURRENT_PARAMS.landscapeLayers ?? 5;
	const horizon = CURRENT_PARAMS.landscapeHorizon ?? 0.32;
	const architecture = CURRENT_PARAMS.architectureScale ?? 1;
	const haze = CURRENT_PARAMS.landscapeHaze ?? 0.65;
	const source = baseHSLPalette[baseHSLPalette.length - 1];
	const sky = {h: source.h, s: Math.min(source.s * 0.22, 18), l: 94};
	const regions = [];
	const css = c => `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
	const atmosphere = (c, depth, shade = 0) => {
		const fog = Math.pow(1 - depth, 1.3) * haze;
		return {h: c.h, s: c.s * (1 - fog * 0.85), l: (c.l + shade) * (1 - fog) + sky.l * fog};
	};
	const addRegion = (top, floor, depth, pigment, shade = 0, face = null) => {
		const fill = atmosphere(pigment, depth, shade);
		const region = {top, floor, depth, fill, face, ink: {...fill, l: Math.max(3, fill.l - 12 * depth - 3)}};
		if (!face) {
			// One opaque silhouette avoids antialiasing seams between column fills.
			region.path = new Path2D();
			region.path.moveTo(left, bottom);
			for (let j = 0; j < columns; j++) {
				region.path.lineTo(left + j * step, top[j]);
				region.path.lineTo(left + (j + 1) * step, top[j]);
			}
			region.path.lineTo(right, bottom);
			region.path.closePath();
		}
		region.columnAt = x => Math.max(0, Math.min(columns - 1, Math.floor((x - left) / step)));
		region.contains = (x, y) => x >= left && x < right && region.visible[region.columnAt(x)].some(([a, b]) => y >= a && y < b);
		region.bottomAt = (x, y) => region.visible[region.columnAt(x)].find(([a, b]) => y >= a && y < b)?.[1] ?? y;
		regions.push(region);
		return region;
	};
	const addFace = (face, depth, pigment, shade) => {
		const top = new Float64Array(columns).fill(bottom);
		const floor = new Float64Array(columns).fill(bottom);
		for (let j = 0; j < columns; j++) {
			const x = left + (j + 0.5) * step;
			const hits = [];
			for (let e = 0; e < 4; e++) {
				const a = face.vertices[e], b = face.vertices[(e + 1) % 4];
				if (x >= Math.min(a.x, b.x) && x < Math.max(a.x, b.x)) {
					hits.push(a.y + (x - a.x) / (b.x - a.x) * (b.y - a.y));
				}
			}
			if (hits.length >= 2) {
				top[j] = Math.max(yMin * height, Math.min(...hits));
				floor[j] = Math.min(bottom, Math.max(...hits));
			}
		}
		addRegion(top, floor, depth, pigment, shade, face);
	};

	for (let layer = 0; layer < count; layer++) {
		const depth = (layer + 1) / count;
		const groundY = yMin * height + tall * (horizon + (0.90 - horizon) * Math.pow(layer / count, 1.35));
		const pigment = baseHSLPalette[Math.floor((0.18 + depth * 0.66) * (baseHSLPalette.length - 1))];
		const ground = new Float64Array(columns);
		for (let j = 0; j < columns; j++) {
			const u = (j + 0.5) / columns;
			ground[j] = groundY + tall * (0.025 + depth * 0.045) * (
				Math.sin(u * 5.5 + layer * 1.8 + rseed) + 0.5 * Math.sin(u * 13 + nseed + layer));
		}
		const groundAt = x => ground[Math.max(0, Math.min(columns - 1, Math.floor((x - left) / step)))];
		const foundations = [];
		const buildings = Math.max(2, Math.round(7 - depth * 4));
		for (let b = 0; b < buildings; b++) {
			const center = left + span * ((b + random(0.2, 0.8)) / buildings);
			const w = span * random(0.055, 0.12) * (0.5 + depth) * architecture;
			const h = tall * random(0.10, 0.22) * (0.35 + depth * 0.8) * architecture;
			const origin = {x: center - w / 2, y: 0};
			const u = {x: w, y: random(-0.09, 0.09) * w};
			const v = {x: random(-0.07, 0.07) * h, y: h};
			const extrusion = {x: w * random(0.25, 0.45), y: -h * random(0.15, 0.3)};
			// Follow the relief across the whole footprint, including the rear edge.
			const footX = origin.x + v.x;
			let base = -Infinity;
			for (let k = 0; k <= 32; k++) {
				const t = k / 32;
				base = Math.max(base,
					groundAt(footX + u.x * t) - u.y * t,
					groundAt(footX + u.x * t + extrusion.x) - u.y * t - extrusion.y,
					groundAt(footX + extrusion.x * t) - extrusion.y * t,
					groundAt(footX + u.x + extrusion.x * t) - u.y - extrusion.y * t);
			}
			base += h * 0.035;
			origin.y = base - h;
			const field = createBuildingField(rseed + layer * 913 + b * 137);
			const footprint = [
				{x: footX, y: groundAt(footX)},
				{x: footX + u.x, y: groundAt(footX + u.x)},
				{x: footX + u.x + extrusion.x, y: groundAt(footX + u.x + extrusion.x)},
				{x: footX + extrusion.x, y: groundAt(footX + extrusion.x)},
			];
			foundations.push({footprint, center, height: h, width: w});
			const lightX = (CURRENT_PARAMS.terrainLightX ?? -1) - (center - left) / span * 2 + 1;
			const lightZ = CURRENT_PARAMS.terrainLightHeight ?? 1;
			const lightLength = Math.hypot(lightX, 1, lightZ);
			const frontShade = -23 + 28 * Math.max(0, (1 + u.y / w * lightX) / lightLength);
			const sideShade = -23 + 28 * Math.max(0, (lightX + u.y / w) / lightLength);
			const roofShade = -8 + 24 * lightZ / lightLength;
			const localW = 420 * MULTIPLIER;
			const localH = localW * h / w;
			// The three faces share this building's independent generation.
			addFace(createArchitecturalFace({x: origin.x + extrusion.x, y: origin.y + extrusion.y},
				u, {x: -extrusion.x, y: -extrusion.y}, localW, localW * 0.45, field), depth, pigment, roofShade);
			addFace(createArchitecturalFace({x: origin.x + u.x, y: origin.y + u.y},
				extrusion, v, localW * 0.45, localH, field), depth, pigment, sideShade);
			addFace(createArchitecturalFace(origin, u, v, localW, localH, field), depth, pigment, frontShade);
		}
		// Draw the supporting terrain in front of the foundations. This same
		// region also masks the particle textures, so the terrain stays clean.
		const terrain = addRegion(ground, new Float64Array(columns).fill(bottom), depth, pigment, 5);
		terrain.foundations = foundations;
	}

	// Finite face intervals can hide only part of a terrain column. Subtract their
	// union rather than hiding everything below the roof (which would cut holes).
	const cover = Array.from({length: columns}, () => []);
	for (let i = regions.length - 1; i >= 0; i--) {
		const r = regions[i];
		r.visible = Array.from({length: columns}, () => []);
		r.visiblePath = new Path2D();
		r.cumulative = new Float64Array(columns);
		let area = 0;
		for (let j = 0; j < columns; j++) {
			const a = r.top[j], b = r.floor[j];
			let cursor = a;
			for (const [c, d] of cover[j]) {
				if (d <= cursor || c >= b) continue;
				if (c > cursor) r.visible[j].push([cursor, Math.min(c, b)]);
				cursor = Math.max(cursor, d);
				if (cursor >= b) break;
			}
			if (cursor < b) r.visible[j].push([cursor, b]);
			for (const [c, d] of r.visible[j]) {
				area += d - c;
				r.visiblePath.rect(left + j * step, c, step, d - c);
			}
			r.cumulative[j] = area;
			if (a < b) {
				const intervals = [...cover[j], [a, b]].sort((x, y) => x[0] - y[0]);
				const merged = [];
				for (const interval of intervals) {
					const last = merged[merged.length - 1];
					if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1]);
					else merged.push([...interval]);
				}
				cover[j] = merged;
			}
		}
		r.area = area;
		r.sample = (rng = r.face ? r.face.field.random : random) => {
			const target = rng() * r.area;
			let lo = 0, hi = columns - 1;
			while (lo < hi) {
				const mid = (lo + hi) >>> 1;
				if (r.cumulative[mid] <= target) lo = mid + 1;
				else hi = mid;
			}
			let offset = target - (lo ? r.cumulative[lo - 1] : 0);
			for (const [a, b] of r.visible[lo]) {
				if (offset < b - a) {
					// Sampling at the scanline center is exactly inside the face polygon.
					const x = left + (lo + (r.face ? 0.5 : rng())) * step;
					return {x, y: a + offset};
				}
				offset -= b - a;
			}
			throw new Error("Cannot sample an empty landscape region");
		};
	}
	for (let i = 0; i < regions.length; i++) {
		const region = regions[i];
		if (!region.face && region.area > 0 && (CURRENT_PARAMS.terrainShading ?? 1) > 0) {
			region.lighting = createTerrainLighting(region, {left, right, top: yMin * height, bottom, step}, rseed + i * 137);
		}
	}
	return {
		regions: regions.filter(r => r.area > 0),
		paint(canvas) {
			const ctx = canvas.drawingContext;
			ctx.save();
			ctx.beginPath();
			ctx.rect(left, yMin * height, span, tall);
			ctx.clip();
			const gradient = ctx.createLinearGradient(0, yMin * height, 0, bottom);
			gradient.addColorStop(0, css({...sky, l: 88}));
			gradient.addColorStop(horizon, css(sky));
			gradient.addColorStop(1, css({...sky, l: 84}));
			ctx.fillStyle = gradient;
			ctx.fillRect(left, yMin * height, span, tall);
			for (let i = 0; i < regions.length; i++) {
				const r = regions[i];
				ctx.fillStyle = css(r.fill);
				ctx.fill(r.face ? r.face.path : r.path);
			}
			ctx.restore();
		},
	};
}
