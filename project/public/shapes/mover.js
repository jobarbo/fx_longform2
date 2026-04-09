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
		const drawingCtx = canvas ? canvas.drawingContext : drawingContext;
		const { h, s, l } = this.currentColor;

		drawingCtx.save();
		drawingCtx.translate(this.x, this.y);
		drawingCtx.rotate(this.angle);
		drawingCtx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
		drawingCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
		drawingCtx.restore();
	}

	move(frameCount, maxFrames) {
		this.angle += 0.02;
		this.colorIndex = Math.floor(frameCount * 0.5) % this.palette.length;
		this.currentColor = this.palette[this.colorIndex];
	}
}
