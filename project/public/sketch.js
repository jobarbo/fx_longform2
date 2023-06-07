let features = '';

let bleed = 0;
let inc = 0.02;
let cells = [];
let w = Math.floor(25 * 100);
let h = Math.floor(12 * 100);
noiseCanvasWidth = w;
noiseCanvasHeight = h;
let p_d = 3;

let amp1 = 10;
let amp2 = 20;
let scale1 = 0;
let scale2 = 0;
let xoff = Math.random() * 10000;
let yoff = Math.random() * 10000;

let easeAng = 0,
	easeScalar2 = 200,
	cycleCount = 0,
	xi = 0,
	yi = 0,
	axoff = Math.random() * 10000,
	ayoff = Math.random() * 10000,
	sxoff = Math.random() * 10000,
	syoff = Math.random() * 10000;

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

	amp1 = random([1]);
	amp2 = random([2000, 3500, 5000]);
	scale1Arr = [0.0025, 0.005, 0.007, 0.01, 0.02];
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
	let draw_every = 600;

	let easing = radians(easeAng);

	/* 	scale1 += map(noise(sxoff, syoff), 0, 1, -0.00001, -0.00001, true);

	scale2 += map(noise(syoff, sxoff), 0, 1, -0.00001, -0.00001, true);

	amp1 += map(noise(axoff, ayoff), 0, 1, -1, 1, true);

	amp2 += map(noise(ayoff, axoff), 0, 1, -1, 1, true); */

	amplitude1 = amp1;
	amplitude2 = amp2;

	/* 	let amplitude1 = int(map(noise(axoff, ayoff), 0, 1, 0, amp1 * 2, true));
	let amplitude2 = int(map(noise(ayoff, axoff), 0, 1, 0, amp2 * 2, true)); */

	//angle1 = int(map(cos(easing), -1, 1, 0, 2000, true));
	xi += map(noise(xoff), 0, 1, -0, 0, true);
	yi += map(noise(yoff), 0, 1, -0, 0, true);

	for (let gridY = 0; gridY < cellCountY; gridY++) {
		for (let gridX = 0; gridX < cellCountX; gridX++) {
			let posX = cellWidth * gridX;
			let posY = cellHeight * gridY;
			let cell = new Cell(
				posX,
				posY,
				xi,
				yi,
				cellWidth,
				cellHeight,
				amplitude1,
				amplitude2,
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

			//xoff += inc;
			xoff += 0.03;
			if (count >= draw_every) {
				count = 0;
				yield;
			}
		}
		count++;
		yoff += 0.03;
		//yoff += inc;
	}
	easeAng += 0.000001;

	axoff += 0.001;
	ayoff += 0.001;
	sxoff += 0.01;
	syoff += 0.01;
}
