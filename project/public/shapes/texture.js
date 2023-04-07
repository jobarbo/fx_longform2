class Texture {
	constructor(rotation, shapeX, shapeY, shapeW, shapeH, rdnX, rdnY, w1, color, mask) {
		this.mask = mask;
		this.rdnX = rdnX;
		this.rdnY = rdnY;
		this.rdnW1 = w1;
		this.shapeX = shapeX;
		this.shapeY = shapeY;
		this.shapeW = shapeW;
		this.shapeH = shapeH;
		this.rotation = rotation;
		this.mapXLow = this.shapeX - this.shapeW * 2;
		this.mapXHigh = this.shapeX + this.shapeW * 2;
		this.mapYLow = this.shapeY - this.shapeH * 2;
		this.mapYHigh = this.shapeY + this.shapeH * 2;
		this.hue = hue(color);
		this.sat = saturation(color);
		this.bri = 100;
		this.alpha = 20;

		const randomMax = 1000000;
		this.xoff = random(randomMax);
		this.yoff = random(randomMax);
		this.woff1 = random(randomMax);
		this.aoff = random(randomMax);

		this.aoffInc = width / 100000000;
		this.xoffInc = width / 300000;
		this.yoffInc = width / 400000;
		this.woff1Inc = width / 100;

		this.maxWidth = height / 550;
		this.minWidth = height / 1000;

		this.maxAlpha = map(this.shapeW, 0, width, 20, 60, true);

		this.x = rdnX;
		this.y = rdnY;
		this.w = map(noise(this.woff1), 0.6, 1, this.minWidth, this.maxWidth, true);

		this.offset = this.w / 2;
	}

	display() {
		this.xoff += this.xoffInc;
		this.yoff += this.yoffInc;
		this.woff1 += this.woff1Inc;
		this.aoff += this.aoffInc;

		this.w = map(noise(this.woff1), 0.6, 1, this.minWidth, this.maxWidth, true);
		this.x = map(noise(this.xoff), 0, 1, this.mapXHigh, this.mapXLow, true);
		this.y = map(noise(this.yoff), 0, 1, this.mapYHigh, this.mapYLow, true);
		this.alpha = map(noise(this.woff1), 0.6, 1, 1, this.maxAlpha, true);

		this.offset = this.w / 2;
		this.mask.noStroke();
		this.mask.fill(this.hue, 0, 0, this.alpha / 2);
		this.mask.ellipse(this.x - this.offset, this.y - this.offset, this.w, this.w);
		this.mask.fill(0, 100, this.bri, this.alpha);
		this.mask.ellipse(this.x - this.offset, this.y + this.offset, this.w, this.w);
		this.mask.fill(200, 100, this.bri, this.alpha);
		this.mask.ellipse(this.x + this.offset, this.y - this.offset, this.w, this.w);
		this.mask.fill(this.hue, 0, this.bri, this.alpha + 10);
		this.mask.ellipse(this.x + this.offset, this.y + this.offset, this.w * 1.25, this.w * 1.25);
	}
}
