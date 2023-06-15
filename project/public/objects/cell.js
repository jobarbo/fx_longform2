class Cell {
	constructor(x, y, w, h, amp1, amp2, scale1, scale2, margin, xoff, yoff, inc, palette) {
		this.features = $fx.getFeatures();

		// Module ready to be built
		this.x = x + w / 2;
		this.y = y + h / 2;
		//this.margin = w * random([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
		this.margin = margin;
		this.w = w - this.margin;
		this.h = h - this.margin;

		this.xoff = xoff;
		this.yoff = yoff;

		this.biomes = palette;
		this.index = 0;
		this.hue = 0;
		this.sat = 0;
		this.bright = 0;

		this.scale1 = scale1;
		this.scale2 = scale2;
		this.amp1 = amp1;
		this.amp2 = amp2;

		this.oct = this.features.octaves;

		this.createNoise();
	}
	display(inc) {
		// Module ready to be built

		this.createNoise();

		noStroke();
		fill(this.hue, this.sat, this.bright, 100);
		rect(this.x, this.y, this.w, this.h);

		//this.xoff += inc;
		//this.yoff += inc;
	}

	createNoise() {
		let nx = this.x,
			ny = this.y,
			a = this.amp1,
			a2 = this.amp2,
			sc = this.scale1,
			sc2 = this.scale2,
			dx,
			dy;

		dx = oct(nx, ny, sc, 3, 1);
		dy = oct(ny, nx, sc2, 1, 1);
		nx += dx * a;
		ny += dy * a2;

		dx = oct(nx, ny, sc, 2, 1);
		dy = oct(ny, nx, sc2, 0, 1);
		nx += dx * a2;
		ny += dy * a2;

		dx = oct(nx, ny, sc, 1, 1);
		dy = oct(ny, nx, sc2, 2, 1);
		nx += dx * a;
		ny += dy * a2;

		let un = oct(nx, ny, sc, 1, 1);
		let vn = oct(nx, ny, sc2, 3, 1);

		let u = map(un, -0.5, 0.5, -0.5, 0.5);
		let v = map(vn, -0.5, 0.5, -0.5, 0.5);

		this.index = int(map(u + v, -1, 1, 0, this.biomes.length - 1, true));

		this.hue = this.biomes[this.index][0];
		this.sat = this.biomes[this.index][1];
		this.bright = this.biomes[this.index][2];
	}
}
