let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let graphicsArray = [];
let cols = 4;
let rows = 4;
let cellSize = 350;
let angleArray = [0,90,180,270];
let angle = 0;
let margin = 0;

function setup() {
	console.log(features);
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	//imageMode(CENTER)
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	angleMode(DEGREES);
	//rectMode(CENTER);


	INIT();
}


function INIT() {

	background(40, 10, 100);
	margin = width / 20;
	cellSize = (width - margin * 2) / 14;
	cols = int((width-margin) / cellSize);
	rows = int((height-margin) / cellSize);
	console.log(cols, rows)

	let letter = random(['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P', 'Q','R','S','T','U','V','W','X','Y','Z']);

	
	let index = 0;
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
		let angle_index = int(random(angleArray.length));
		console.log(angle_index);
		let x = (width - cols * cellSize) / 2 + i * cellSize + random(-cellSize/6, cellSize/6);
		let y = (height - rows * cellSize) / 2 + j * cellSize + random(-cellSize/6, cellSize/6);

		graphicsArray[index] = createGraphics(cellSize, cellSize);
		graphicsArray[index].angleMode(DEGREES);
		graphicsArray[index].displayDensity(2);
		graphicsArray[index].colorMode(HSB, 360, 100, 100, 100);
		graphicsArray[index].background(random(0, 360), 30, 95, 0);
		for (let k = 0; k < 60000; k++) {
			let x = random(graphicsArray[index].width);
			let y = random(graphicsArray[index].height);
			let w = 0.5;
			let h = 0.5;
			graphicsArray[index].noStroke();
			graphicsArray[index].fill(210, 50,30,50);
			graphicsArray[index].ellipse(x, y, w, h);
		}
		// Apply rotation directly to the graphics object before drawing the 'A'
		graphicsArray[index].push();
		graphicsArray[index].translate(cellSize / 2, cellSize / 2);
		graphicsArray[index].rotate(angleArray[angle_index]);
		graphicsArray[index].fill(210, 50,50,70);
		graphicsArray[index].noStroke();
		graphicsArray[index].textSize(graphicsArray[index].width*10);
		graphicsArray[index].textAlign(CENTER, CENTER);
		// create textured background in graphics object

		//graphicsArray[index].text(letter, 0, 0);
		graphicsArray[index].pop();

		image(graphicsArray[index], x, y, cellSize+1, cellSize+1);
		stroke(0);
		strokeWeight(0);
		noFill();
		rect(x, y, cellSize, cellSize);
		index++;
		}
	}


}
