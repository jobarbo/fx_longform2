let scl1,
	scl2,
	ang1,
	ang2,
	rseed,
	nseed,
	xMin,
	xMax,
	yMin,
	yMax,
	features = '',
	movers = [],
	isBordered = !1;
function setup() {
	console.log(features), (features = $fx.getFeatures()), features.format_mode;
	var e = window.navigator.userAgent,
		n = !!e.match(/iPad/i) || !!e.match(/iPhone/i),
		a = !!e.match(/WebKit/i);
	n && a && e.match(/CriOS/i),
		pixelDensity(1),
		createCanvas(3600, 3600),
		colorMode(HSB, 360, 100, 100, 100),
		(seed = random(1e7)),
		randomSeed(seed),
		INIT(seed);
}
function draw() {
	for (let e = 0; e < movers.length; e++) for (let n = 0; n < 1; n++) movers[e].show(), movers[e].move();
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight), INIT(seed);
}
function INIT(e) {
	(movers = []),
		(scl1 = random(1e-5, 0.01)),
		(scl2 = random(1e-5, 0.008)),
		(scl3 = random(1e-5, 0.01)),
		(ang1 = int(random(1e3))),
		(ang2 = int(random(1e3))),
		(xMin = 0.2),
		(xMax = 0.8),
		(yMin = 0.2),
		(yMax = 0.8);
	let n = random(360);
	for (let a = 0; a < 1e4; a++) {
		let a = random(xMin, xMax) * width,
			o = random(yMin, yMax) * height,
			r = n + random(-20, 20);
		(r = r > 360 ? r - 360 : r < 0 ? r + 360 : r),
			movers.push(new Mover(a, o, r, scl1, scl2, scl3, ang1, ang2, xMin, xMax, yMin, yMax, isBordered, e));
	}
	let a = spectral.mix('#000', '#faedcd', 0.938);
	background(a);
}
