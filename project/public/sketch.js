let features = "";

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
	let cellSize = 1;

	// Calculate the number of cells that can fit in the screen according to cellSize
	let cellCountX = floor(width / cellSize);
	let cellCountY = floor(height / cellSize);

	// Adjust cellWidth and cellHeight to fit the cells perfectly within the canvas
	let cellWidth = width / cellCountX;
	let cellHeight = height / cellCountY;

	let margin = -1;

	amp1 = random([200, 250, 300, 350, 400, 450, 500]);
	amp2 = random([2000, 3500, 5000]);
	scale1 = 0.003;
	scale2 = 0.001;
	yoff = random(100000);
	xoff = random(100000);

	console.log(amp1, amp2, scale1, scale2);

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
			console.log("done");
			// stop the interval
			clearInterval(interval);
			init(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette);
		}
	}, 0);
}

function* drawNoise(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette) {
	let count = 0;
	let draw_every = 600;

	for (let gridY = 0; gridY < cellCountY; gridY++) {
		for (let gridX = 0; gridX < cellCountX; gridX++) {
			let posX = cellWidth * gridX;
			let posY = cellHeight * gridY;
			let cell = new Cell(posX, posY, cellWidth, cellHeight, amp1, amp2, scale1, scale2, margin, xoff, yoff, inc, palette);
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
