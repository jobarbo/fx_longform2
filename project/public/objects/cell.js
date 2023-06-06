class Cell {
	constructor(x, y, xi, yi, w, h, amp1, amp2, scale1, scale2, margin, xoff, yoff, inc, palette) {
		this.features = $fx.getFeatures();

		// Module ready to be built
		this.x = x + w / 2;
		this.y = y + h / 2;
		this.xi = xi;
		this.yi = yi;
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

		noStroke();
		fill(this.hue, this.sat, this.bright, 100);
		rect(this.x, this.y, this.w, this.h);

		/* 		this.xoff += inc;
		this.yoff += inc; */
	}

	createNoise() {
		let nx = this.x + this.xi;
		let ny = this.y + this.yi;
		let a = this.amp1;
		let a2 = this.amp2;
		let sc = this.scale1;
		let sc2 = this.scale2;

		let oct = oct1;
		switch (this.oct) {
			case 1:
				oct = oct1;
				break;
			case 2:
				oct = oct2;
				break;
			case 3:
				oct = oct3;
				break;
			case 4:
				oct = oct4;
				break;
			case 5:
				oct = oct5;
				break;
			case 6:
				oct = oct6;
				break;
		}

		let dx, dy;
		dx = oct(nx, ny, sc, 3) * a + oct(nx, ny, sc, 2) * a2 + oct(nx, ny, sc, 1) * a;
		dy = oct(ny, nx, sc2, 1) * a + oct(ny, nx, sc2, 0) * a2 + oct(ny, nx, sc2, 2) * a2;

		nx += dx;
		ny += dy;

		let un = oct(nx, ny, sc, 1);
		let vn = oct(nx, ny, sc2, 3);

		let u = map(un, -0.5, 0.5, -0.5, 0.5);
		let v = map(vn, -0.5, 0.5, -0.5, 0.5);

		this.index = int(map(u + v, -1, 1, 0, this.biomes.length - 1, true));

		this.hue = this.biomes[this.index][0];
		this.sat = this.biomes[this.index][1];
		this.bright = this.biomes[this.index][2];
	}
}
