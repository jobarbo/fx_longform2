let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

// Sketch based variables
let img;
let colors = [];
let sortMode = null;

let tileCount;
let rectSize;

function preload() {
	img = loadImage("assets/image20.png");
}

function setup() {
	features = $fx.getFeatures();

	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO);
	pg = createGraphics(DIM, DIM * RATIO);
	pixelDensity(dpi(4));
	//colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);

	INIT();
}

function INIT() {
	background(0);
	tileCount = floor(width / 10);
	rectSize = width / tileCount;
	noStroke();

	drawPixels();
}

function draw() {
	noLoop();
}

function drawPixels(){
	image(img, 0, 0,width,height);
	img.resize(width,height);
 	img.loadPixels();
	colors = [];

	for (let gridY = 0; gridY < tileCount; gridY++) {
		for (let gridX = 0; gridX < tileCount; gridX++) {
			let px = int(gridX * rectSize);
			let py = int(gridY * rectSize);
			let i = (py * img.width + px) * 4;
			let c = color(
				img.pixels[i],
				img.pixels[i + 1],
				img.pixels[i + 2],
				img.pixels[i + 3]
			);
			colors.push(c);
		}
	}

	gd.sortColors(colors, sortMode);

	let i = 0;
	for (let gridY = 0; gridY < tileCount; gridY++) {
		for (let gridX = 0; gridX < tileCount; gridX++) {
			let c = colors[i];
			fill(c);
			rect(gridX * rectSize, gridY * rectSize, rectSize+1, rectSize+1);
			i++;
		}
	} 


}

function keyReleased() {
	let prevSortMode = sortMode;
	if (key == "1") sortMode = gd.RED;
	if (key == "2") sortMode = gd.GREEN;
	if (key == "3") sortMode = gd.BLUE;
	if (key == "4") sortMode = gd.ALPHA;
	if (key == "5") sortMode = null;
	if (key == "6") sortMode = gd.HUE;
	if (key == "7") sortMode = gd.SATURATION;
	if (key == "8") sortMode = gd.BRIGHTNESS;
	if (key == "9") sortMode = gd.GRAYSCALE;

	// if sortMode is changed, redraw pixels
	if (prevSortMode != sortMode) {
		drawPixels();
	}
	
}
