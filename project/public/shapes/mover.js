class Mover {
	constructor(x, y, size, palette) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.palette = palette;
		this.colorIndex = 0;
		this.currentColor = this.palette[this.colorIndex];
		this.angle = 0;
	}

	show(canvas) {
		const {h, s, l} = this.currentColor;
		canvas.colorMode(HSL);

		canvas.rectMode(CENTER);

		canvas.translate(width / 2, height / 2);
		//canvas.rotate(this.angle / 4);
		canvas.fill(30, 100, 100);
		canvas.rect(0, 0, this.size, this.size * 4);
		canvas.resetMatrix();

		canvas.translate(width / 2, height / 2);
		//canvas.rotate(this.angle / 12);
		canvas.fill(0, 100, 50, 100);
		canvas.rect(0, 0, this.size / 2, this.size / 2);
		canvas.resetMatrix();
	}

	move(frameCount) {
		this.angle += 0.2;
		this.colorIndex = Math.floor(frameCount * 0.05) % this.palette.length;
		this.currentColor = this.palette[this.colorIndex];
	}
}
