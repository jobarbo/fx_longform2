let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let flock;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(2));
	imageMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rectMode(CENTER);
	let spacingX = width / 60; // Cette variable détermine la taille des cellules de notre grille
	let spacingY = height / 60; // Cette variable détermine la taille des cellules de notre grille
	let margin = width / 15 - spacingY; // Cette variable détermine la marge de notre grille
	let pass = 3; // This variable determines the number of passes
	blendMode(BLEND);
	for (i = 0; i < pass; i++) {
		for (let x = margin; x < width - margin; x += spacingX) {
			// loop through x
			for (let y = margin; y < height - margin; y += spacingY) {
				// loop through y
				let rand = random(1); // get a random number between 0 and 1
				if (rand < 0.75) {
					// make a blue line for baseline
					strokeWeight(2);
					stroke(220, 80, 60, 50);
					line(x, y + spacingY, x + spacingX, y + spacingY);
				} else if (rand > 0.75) {
					// make a blue line for baseline
					strokeWeight(2);
					stroke(220, 80, 60, 50);
					line(x, y + spacingY, x + spacingX, y + spacingY);

					// set random bezier control points
					let xanchor1 = random(-spacingX * 4, spacingX * 4);
					let yanchor1 = random(-spacingY * 4, spacingY * 4);
					let xanchor2 = random(-spacingX / 4, spacingX / 4);
					let yanchor2 = random(-spacingY / 4, spacingY / 4);

					// make a bezier curve
					stroke(0, 0, 20, 100);
					strokeWeight(random(1, 2));
					noFill();
					bezier(x, y + spacingY, x + xanchor1, y + yanchor1, x + xanchor2, y + yanchor2, x + spacingX, y + spacingY);

					// if random number is between 0.75 and 0.85
					if (rand > 0.75 && rand < 0.8) {
						// draw a line
						line(x, y + spacingY / 2, x + spacingX, y + spacingY / 2);
					}
					// if random number is between 0.8 and 0.85
					if (rand > 0.8 && rand < 0.85) {
						// draw two dots
						strokeWeight(5);
						point(x, y + spacingY / 2);
						point(x + spacingX, y + spacingY / 2);
					}
				}
			}
		}
	}
}

function draw() {
	// create a 10_print-like pattern
}
