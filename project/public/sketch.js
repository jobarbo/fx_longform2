let features = '';
let landMinY = 0;
let landMaxY = 0;
let landYoff = 0.0;
let landAlpha = 10;
let landSaturation = 10;
let landBrightness = 85;
let landStrokeSaturation = 30;
let landStrokeBrightness = 100;
let landStrokeAlpha = 5;
let landStrokeWeight = 40;
let landXoffIter = 0.01;
let landDone = false;
let isReverted = false;

let waterMinY = 0;
let waterMaxY = 0;
let waterYoff = 0.0;
let waterSaturation = 70;
let waterBrightness = 80;
let strokeHueValue = 1;
let waterStrokeSaturation = 60;
let waterStrokeAlpha = 100;
let waterFillAlpha = 5;
let waterStrokeWeight = 10;
let waveStrokeWeight = 1;
let waveStrokeAlpha = 10;
let waveStrokeBrightness = 100;
let waveStrokeSaturation = 30;
let waveIsReverted = false;

let skyMinY = 0;
let skyMaxY = 0;
let skyYoff = 0.0;
let skyDone = false;
let bgHue = '';

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	let formatMode = features.format_mode;
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// if Safari mobile or any smartphone browser, use pixelDensity(0.5) to make the canvas bigger, else use pixelDensity(3.0)
	if (iOSSafari || (iOS && !iOSSafari) || (!iOS && !ua.match(/iPad/i) && ua.match(/Mobile/i))) {
		pixelDensity(1);
	} else {
		pixelDensity(1);
	}
	createCanvas((22 * 300) / 1.5, (16 * 300) / 1.5);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	colorMode(HSB, 360, 100, 100, 100);

	bgHue = random([10, 30, 50, 180, 200]);
	background(bgHue, 23, 0);
	landMinY = height / 3.9;
	landMaxY = height / 1.9;
	landYoff = 0.0;
	landAlpha = 10;
	landSaturation = 10;
	landBrightness = 85;
	landStrokeSaturation = 30;
	landStrokeBrightness = 100;
	landStrokeAlpha = 5;
	landStrokeWeight = 40;
	landXoffIter = 0.01;
	landDone = false;
	isReverted = false;

	waterMinY = height / 3.5;
	waterMaxY = height / 3.2;
	waterYoff = 0.0;
	waterSaturation = 70;
	waterBrightness = 80;
	strokeHueValue = 1;
	waterStrokeSaturation = 60;
	waterStrokeAlpha = 100;
	waterFillAlpha = 5;
	waterStrokeWeight = 10;
	waveStrokeWeight = 1;
	waveStrokeAlpha = 10;
	waveStrokeBrightness = 100;
	waveStrokeSaturation = 30;
	waveIsReverted = false;

	skyMinY = height / 3;
	skyMaxY = height / 2;
	skyYoff = 0.0;
	skyDone = false;
	/*
	while (skyDone != true) {
		createSky();
	}

 	if (skyDone) {
		console.log("Sky Done");
		while (landDone != true) {
			createLand();
			createOcean();
		}
	} */
}

function draw() {
	// put drawing code here
	createSky();

	if (skyDone) {
		createLand();
		createOcean();
	}
}

function createLand() {
	// LAND

	// We are going to draw a polygon out of the wave points
	beginShape();
	noFill();

	let landXoff = 0; // Option #1: 2D Noise
	//let landXoff = landYoff; // Option #2: 1D Noise
	if (skyDone) {
		// Iterate over horizontal pixels
		for (let x = -300; x <= width + 300; x += 100) {
			// Calculate a y value according to noise, map to

			// Option #1: 2D Noise
			let y = map(noise(landXoff, landYoff), 0, 1, landMinY, landMaxY);
			let h = map(noise(landXoff, landYoff), 0, 1, 43, 47);
			let s = map(noise(landXoff, landYoff), 0, 1, 60, 100);
			let b = map(noise(landXoff, landYoff), 0, 1, 75, 85);

			// Option #2: 1D Noise
			// let y = map(noise(landXoff), 0, 1, 200,300);
			strokeWeight(landStrokeWeight);
			stroke(h, s - 20, b + 20, landStrokeAlpha);
			fill(h, s, b, landAlpha);
			// Set the vertex

			if (landMinY < height) {
				curveVertex(x, y);
				landXoff += landXoffIter;
				landMinY += 0.0205;
				landMaxY += 0.0205;
				landXoffIter = map(y, height / 2, height, 0.02, 0.006, true);
				if (landSaturation < 80) {
					landSaturation *= 1.0003;
				}
				if (landBrightness > 60) {
					landBrightness -= 0.001;
				}
				landAlpha = map(y, height / 3, height / 2, 0, 10, true);
				landStrokeAlpha = map(y, height / 3, height / 2, 0, 10, true);
				/* 		if (landStrokeAlpha > 2 && isReverted == false) {
					landStrokeAlpha -= 0.000001;
				} */
				if (landStrokeWeight > 6) {
					landStrokeWeight -= 0.00045;
				} else {
					isReverted = true;
				}

				if (isReverted) {
					landStrokeWeight += 0.004;
					//landStrokeAlpha += 0.00001;
				}
				if (landStrokeSaturation > 0) {
					landStrokeSaturation -= 0.00015;
				}
				if (landStrokeBrightness > 95) {
					landStrokeBrightness -= 0.0001;
				}
			} else {
				landDone = true;
			}

			// Increment x dimension for noise
		}
		// increment y dimension for noise
		landYoff += 0.002;
		vertex(width + 100, height + 100);
		vertex(-100, height + 100);
		endShape(CLOSE);
	}
}

function createOcean() {
	// Water

	// We are going to draw a polygon out of the wave points
	beginShape();
	noFill();

	let waterXoff = 0.01; // Option #1: 2D Noise
	//let landXoff = landYoff; // Option #2: 1D Noise
	if (skyDone) {
		// Iterate over horizontal pixels
		for (let x = -300; x <= width + 300; x += 100) {
			// Calculate a y value according to noise, map to

			// Option #1: 2D Noise
			let y = map(noise(waterXoff, waterYoff), 0, 1, waterMinY, waterMaxY);
			let h = map(noise(waterXoff, waterYoff), 0, 1, 175, 200);

			let s = map(noise(waterXoff, waterYoff), 0, 1, 15, 60);
			let b = map(noise(waterXoff, waterYoff), 0, 1, 85, 100);
			let water_color = color(h, waterSaturation, waterBrightness);
			let water_hex = '#' + water_color.toString('#rrggbb').substring(1);

			let background_color = color(bgHue, 50, 100);
			let background_hex = '#' + background_color.toString('#rrggbb').substring(1);

			// once every three times, change the water color
			if (int(random(100)) % 21 == 0) {
				if (waveStrokeAlpha > 2 && waveIsReverted == false) {
					//waveStrokeAlpha -= 0.000001;
				}
				if (waveStrokeWeight > 3) {
					waveStrokeWeight -= 0.004;
				} else {
					waveIsReverted = true;
				}

				if (waveIsReverted) {
					waveStrokeWeight += 0.003;
					//waveStrokeAlpha += 0.00001;
				}
				if (waveStrokeSaturation > 0) {
					waveStrokeSaturation -= 0.00015;
				}
				if (waveStrokeBrightness > 95) {
					waveStrokeBrightness -= 0.00001;
				}
				strokeWeight(waveStrokeWeight);
				stroke(bgHue, random(0, waveStrokeSaturation + 20), 100, waveStrokeAlpha);
				let lineStart = random(width);
				line(lineStart - random(0, 300), y, lineStart + random(0, 300), y);
			}
			strokeHueValue = constrain(strokeHueValue, 0, 1);
			let strokeH = color(spectral.mix(water_hex, background_hex, strokeHueValue));
			strokeH.setAlpha(waterStrokeAlpha);
			let fillH = color(spectral.mix(water_hex, background_hex, strokeHueValue));
			fillH.setAlpha(waterFillAlpha);

			noStroke();
			/* 				strokeWeight(waterStrokeWeight);
			stroke(bgHue, waveStrokeSaturation, waveStrokeBrightness, waterStrokeAlpha); */

			fill(fillH);

			// Set the vertex
			if (waterMinY < height) {
				curveVertex(x, y);
				waterXoff += 0.003;
				waterMinY += 0.025;
				waterMaxY += 0.025;
				strokeHueValue -= 0.00003;
				if (waterSaturation < 70) {
					waterSaturation += 0.005;
				}
				/* 					if (waterFillAlpha < 30) {
					waterFillAlpha *= 1.002;
				} */

				waterFillAlpha = map(y, height / 3, height / 2.95, 0, 5, true);
				waveStrokeAlpha = map(y, height / 3, height / 2.95, 0, 10, true);

				if (waterBrightness > 100) {
					waterBrightness -= 0.002;
				}
				if (waterStrokeWeight > 3) {
					waterStrokeWeight -= 0.001;
				}
				if (waterStrokeAlpha > 3) {
					waterStrokeAlpha -= 0.000001;
				}
				waterStrokeSaturation -= 0.001;
			}
			// Increment x dimension for noise
		}
		// increment y dimension for noise
		waterYoff += 0.0005;
		vertex(width + 100, height + 100);
		vertex(-100, height + 100);
		endShape(CLOSE);
	}
}
function createSky() {
	// SKY
	strokeWeight(20);
	// We are going to draw a polygon out of the wave points
	beginShape();
	noFill();

	//let skyXoff = 0; // Option #1: 2D Noise
	let skyXoff = skyYoff; // Option #2: 1D Noise

	// Iterate over horizontal pixels
	for (let x = -100; x <= width + 100; x += 100) {
		// Calculate a y value according to noise, map to

		// Option #1: 2D Noise
		let y = map(noise(skyXoff, skyYoff), 0, 1, skyMinY, skyMaxY);
		let h = map(noise(skyXoff, skyYoff), 0, 1, bgHue - 40, bgHue + 40, true);
		let s = map(noise(skyXoff, skyYoff), 0.2, 0.8, 20, 60);
		let b = map(noise(skyXoff, skyYoff), 0, 1, 90, 100);

		// Option #2: 1D Noise
		// let y = map(noise(skyXoff), 0, 1, 200,300);
		stroke(h, s, b, 50);
		strokeWeight(20);
		fill(h, s, b, 50);

		// Set the vertex
		if (skyMaxY > 100) {
			curveVertex(x, y);
			skyXoff += 0.025;
			skyMinY -= 0.075;
			skyMaxY -= 0.075;
		} else {
			skyDone = true;
		}

		// Increment x dimension for noise
	}
	// increment y dimension for noise
	skyYoff += 0.02;
	vertex(width + 100, -100);
	vertex(-100, -100);
	endShape(CLOSE);
}
