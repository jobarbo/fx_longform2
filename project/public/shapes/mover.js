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
		const trackHeight = this.size * 4;
		const squareSize = this.size / 2;
		const maxTravel = trackHeight / 2 - squareSize / 2;
		const squareY = this.y + Math.sin(this.angle) * maxTravel;
		const reverseSquareY = this.y - Math.sin(this.angle) * maxTravel;
		const complementaryHue = (210 + 180) % 360;

		canvas.push();
		canvas.rectMode(CENTER);
		canvas.fill(40, 100, 90);
		canvas.rect(this.x, this.y, this.size, trackHeight);
		canvas.pop();

		canvas.push();
		canvas.rectMode(CENTER);
		canvas.fill(210, 100, 50, 100);
		canvas.rect(this.x, squareY, squareSize, squareSize);
		canvas.pop();

		canvas.push();
		canvas.rectMode(CENTER);
		canvas.fill(complementaryHue, 100, 50, 100);
		canvas.rect(this.x, reverseSquareY, squareSize, squareSize);
		canvas.pop();
	}

	move(frameCount) {
		this.angle += 0.018;
		this.colorIndex = Math.floor(frameCount * 0.05) % this.palette.length;
		this.currentColor = this.palette[this.colorIndex];
	}
}
