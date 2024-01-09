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

		this.oct = 2

		this.letter = '';

		this.createNoise();
	}
	display(inc) {
		// Module ready to be built

 		noStroke();
		fill(this.hue, this.sat, this.bright, 100);
		rect(this.x, this.y, this.w, this.h); 

		// draw a white letter in the middle of the cell
		fill(0, 0, 100, 100);
		textSize(this.w*1);
		textAlign(CENTER, CENTER);
		text(this.letter, this.x, this.y);


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

		let dx, dy;
		dx = oct(nx, ny, sc, 3, this.oct);
		dy = oct(ny, nx, sc2, 1, this.oct);
		nx += dx * a;
		ny += dy * a2;

		dx = oct(nx, ny, sc, 2, this.oct);
		dy = oct(ny, nx, sc2, 0, 2);
		nx += dx * a2;
		ny += dy * a2;

		dx = oct(nx, ny, sc, 1, this.oct);
		dy = oct(ny, nx, sc2, 2, this.oct);
		nx += dx * a;
		ny += dy * a2;

		let un = oct(nx, ny, sc, 1, this.oct);
		let vn = oct(nx, ny, sc2, 3, this.oct);

		let u = map(un, -0.5, 0.5, -0.5, 0.5);
		let v = map(vn, -0.5, 0.5, -0.5, 0.5);
		this.index = int(map(u + v, -1, 1, 0, this.biomes.length - 1, true));

/* 		this.hue = this.biomes[this.index][0];
		this.sat = this.biomes[this.index][1];
		this.bright = this.biomes[this.index][2]; */

		this.letter = this.biomes[this.index];
		
		this.hue = 0;
		this.sat = 0;
		this.bright = 0; 
	}
}
