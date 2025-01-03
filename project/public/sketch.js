function setup() {
	createCanvas(DIM, DIM * RATIO);
	pixelDensity(dpi(maxDPI));
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	background(45, 5, 100);
	xi = random(1e12);
	yi = random(1e12);
	pos_range_x = width * 0.35;
	pos_range_y = height * 0.35;
}
function draw() {
	if (frameCount > MAX_FRAMES) noLoop();
	translate(width / 2, height / 2);
	rotate(int(random([45])));
	paint(xoff, yoff, particle_num, xi, yi);
}
function paint(xoff, yoff, particle_num, xi, yi) {
	let xoff_l_high = mapValue(abs(sin(frameCount * 40)), 0, 1, offValues_h[0].low, offValues_h[0].high, 1),
		xoff_l_low = mapValue(abs(sin(frameCount * 40)), 0, 1, offValues_l[0].low, offValues_l[0].high, 1),
		xoff_l = mapValue(cos(frameCount * 12), -1, 0, xoff_l_high, xoff_l_low, 1),
		yoff_l = mapValue(cos(frameCount * 12), 0, 1, xoff_l_low, xoff_l_high, 1);
	for (let s = 0; s < particle_num; s++) {
		xoff = random(xoff_l, xoff_l_high + 1e-6);
		yoff = random(yoff_l, xoff_l_high + 1e-6);
		noiseDetail(6, 0.5);
		let x = map(noise(xoff, cos(frameCount * 20), random([yoff, yoff, xi])), n_range_min, n_range_max, -pos_range_x, pos_range_x, 1),
			y = map(noise(yoff, cos(frameCount * 20), random([xoff, xoff, xi])), n_range_min, n_range_max, -pos_range_y, pos_range_y, 1),
			elW = mapValue(abs(cos(frameCount * 12)), 0, 1, 0.1, 0.05, 1) * MULTIPLIER,
			ab_x = constrain(x, -width, width) * MULTIPLIER,
			ab_y = constrain(y, -height, height) * MULTIPLIER,
			bri_min = mapValue(frameCount, MAX_FRAMES / 1.21, MAX_FRAMES / 1.2, 0, 100, 1),
			bri_max = mapValue(frameCount, MAX_FRAMES / 1.21, MAX_FRAMES / 1.2, 0, 0, 1),
			bri = mapValue(abs(cos(frameCount * 12)), 0.9, 1, 20 - bri_max, 20 - bri_min, 1),
			alpha = mapValue(abs(cos(frameCount * 12)), 0, 1, 50, 100, 1);
		drawingContext.fillStyle = `hsla(0, 0%, ${bri}%, ${alpha}%)`;
		drawingContext.fillRect(ab_x, ab_y, elW, elW);
		xi += 1e-17;
		yi += 1e-17;
	}
}
// ! LE FIN
