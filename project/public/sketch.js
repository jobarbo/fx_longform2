let features = '';

let bleed = 0;
let inc = 0.02;
let cells = [];
let w = Math.floor(16 * 100);
let h = Math.floor(16 * 100);
let p_d = 3;

let amp1 = 0;
let amp2 = 0;
let scale1 = 0;
let scale2 = 0;
let yoff = 0;
let xoff = 110;

function setup() {
	//console.log(features);
	features = $fx.getFeatures();

	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if Safari mobile or any smartphone browser, use pixelDensity(0.5) to make the canvas bigger, else use pixelDensity(3.0)
	if (iOSSafari || (iOS && !iOSSafari) || (!iOS && !ua.match(/iPad/i) && ua.match(/Mobile/i))) {
		pixelDensity(2);
	} else {
		pixelDensity(3);
	}
	createCanvas(w, h);
	noLoop();
	colorMode(HSB, 360, 100, 100, 100);
	background(10, 0, 10, 100);
	rectMode(CENTER);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	console.log(features.biomeColorList);
	let palette = features.biomeColorList;

	//let cellSize = features.cellSize;
	let cellSize = 10;

	// Calculate the number of cells that can fit in the screen according to cellSize
	let cellCountX = floor(width / cellSize);
	let cellCountY = floor(height / cellSize);

	// Adjust cellWidth and cellHeight to fit the cells perfectly within the canvas
	let cellWidth = width / cellCountX;
	let cellHeight = height / cellCountY;

	let margin = -1;

	amp1 = random([1, 2, 3, 4, 5, 10]);
	amp2 = random([1000, 1500, 2000]);
	scale1 = random([0.0025, 0.005, 0.007, 0.01]);
	scale2 = random([0.001, 0.0005, 0.0001, 0.00005, 0.00001]);
	yoff = random(100000);
	xoff = random(100000);

	// create a grid of cells that fill the sreen and is relative to the width and height of the screen
	//noiseDetail(5, 0.55);

	init(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette);
}

function init(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette) {
	let framePassed = 0;
	let grid = drawNoise(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette);

	let interval = setInterval(() => {
		let result = grid.next();
		framePassed++;
		if (result.done) {
			console.log('done');
			// stop the interval
			clearInterval(interval);
			init(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette);
		}
	}, 0);
}

function* drawNoise(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette) {
	let count = 0;
	let draw_every = 600;

	amp1 += 0.1;
	amp2 -= 1;

	for (let gridY = 0; gridY < cellCountY; gridY++) {
		for (let gridX = 0; gridX < cellCountX; gridX++) {
			let posX = cellWidth * gridX;
			let posY = cellHeight * gridY;
			let cell = new Cell(
				posX,
				posY,
				cellWidth,
				cellHeight,
				amp1,
				amp2,
				scale1,
				scale2,
				margin,
				xoff,
				yoff,
				inc,
				palette
			);
			cells.push(cell);
			cell.display(inc);

			xoff += inc;
			if (count >= draw_every) {
				count = 0;
				yield;
			}
		}
		count++;
		yoff += inc;
	}
}

function draw() {
	/* 	inc = 0.002;

	for (let i = 0; i < cells.length; i++) {
		cells[i].display(inc);
	} */

	noLoop();
}
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

		dx = oct(nx, ny, sc, 3);
		dy = oct(ny, nx, sc2, 1);
		nx += dx * a;
		ny += dy * a2;

		dx = oct(nx, ny, sc, 2);
		dy = oct(ny, nx, sc2, 0);
		nx += dx * a2;
		ny += dy * a2;

		dx = oct(nx, ny, sc, 1);
		dy = oct(ny, nx, sc2, 2);
		nx += dx * a;
		ny += dy * a2;

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
