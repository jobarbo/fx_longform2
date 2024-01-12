let features = "";

let bleed = 0;
let inc = 0.02;
let cells = [];
let w = Math.floor(2080);
let h = Math.floor(2080);
noiseCanvasWidth = w;
noiseCanvasHeight = h;
let p_d = 3;

let amp1 = 10;
let amp2 = 20;
let scale1 = 0;
let scale2 = 0;

let animationFrameId;
let easeAng = 0,
	easeScalar = 0.26,
	cycleCount = 0,
	xi = 0,
	yi = 0,
	xoff = fxrand() * 1_000_000,
	yoff = fxrand() * 1_000_000,
	axoff = fxrand() * 1_000_000,
	ayoff = fxrand() * 1_000_000,
	sxoff = fxrand() * 1_000_000,
	syoff = fxrand() * 1_000_000;

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
		pixelDensity(1);
	}
	createCanvas(w, h);
	colorMode(HSB, 360, 100, 100, 100);
	background(10, 0, 10, 100);
	rectMode(CENTER);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	console.log(features.biomeColorList);
	let palette = features.biomeColorList;

	//let cellSize = features.cellSize;
	let cellSize = 20;

	// Calculate the number of cells that can fit in the screen according to cellSize
	let cellCountX = floor(width / cellSize);
	let cellCountY = floor(height / cellSize);

	// Adjust cellWidth and cellHeight to fit the cells perfectly within the canvas
	let cellWidth = width / cellCountX;
	let cellHeight = height / cellCountY;

	let margin = -1;

	amp1 = random([1, 3, 5, 10]);
	amp2 = random([1, 2, 3]);
	scale1Arr = [0.001, 0.0025];
	scale2Arr = [0.001, 0.0005, 0.0001, 0.00005, 0.00001];
	yoff = random(100000);
	xoff = random(100000);
	sclrdn1 = int(random(scale1Arr.length));
	scale1 = scale1Arr[sclrdn1];
	scale2 = scale2Arr[sclrdn1];

	// create a grid of cells that fill the sreen and is relative to the width and height of the screen
	//noiseDetail(5, 0.55);

	init(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette);
}

function init(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette) {
	cells = [];
	let framePassed = 0;
	let grid = drawNoise(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette);

	let interval = setInterval(() => {
		let result = grid.next();
		framePassed++;
		if (result.done) {
			clearInterval(interval);
			let cosIndex = cos(radians(easeAng));

			if (cosIndex >= 1) {
				cycleCount += 1;
			}
			if (cycleCount < 1) {
				init(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette);
			} else {
				noLoop();
			}
			// stop the interval
		}
	}, 0);
}

function* drawNoise(cellCountX, cellCountY, cellWidth, cellHeight, margin, inc, palette) {
	let count = 0;
	let draw_every = 1000;

	let easing = radians(easeAng);

	scale1 = mapValue(cos(easing), -1, 1, 0.00071, 0.0025, true);
	scale2 = mapValue(cos(easing), -1, 1, 0.0025, 0.00071, true);
	amplitude1 = parseInt(mapValue(cos(easing), -1, 1, 1200, 1, true));
	amplitude2 = parseInt(mapValue(cos(easing), -1, 1, 1, 1200, true));

	if (amp1 < 0) {
		amp1 = 0;
	} else if (amp1 > 1000) {
		amp1 = 1000;
	}
	if (amp2 < 0) {
		amp2 = 0;
	} else if (amp2 > 1000) {
		amp2 = 1000;
	}

	amplitude1 = amp1;
	amplitude2 = amp2;

	/* 	let amplitude1 = int(map(noise(axoff, ayoff), 0, 1, 0, amp1 * 2, true));
	let amplitude2 = int(map(noise(ayoff, axoff), 0, 1, 0, amp2 * 2, true)); */

	//angle1 = int(map(cos(easing), -1, 1, 0, 2000, true));
	//xi += map(noise(xoff), 0, 1, -1, 1, true);
	yi += 2;

	for (let gridY = 0; gridY < cellCountY; gridY++) {
		for (let gridX = 0; gridX < cellCountX; gridX++) {
			let posX = cellWidth * gridX;
			let posY = cellHeight * gridY;
			let cell = new Cell(posX, posY, xi, yi, cellWidth, cellHeight, amplitude1, amplitude2, scale1, scale2, margin, xoff, yoff, inc, palette);
			cells.push(cell);
			cell.display(inc);

			//xoff += inc;

			if (count >= draw_every) {
				count = 0;
				yield;
			}
		}
		count++;

		//yoff += inc;
	}
	easeAng += 0.1;
	xoff += 0.001;
	yoff += 0.001;
	axoff += 0.01;
	ayoff += 0.01;
	sxoff += 0.01;
	syoff += 0.01;
}

function draw() {}
