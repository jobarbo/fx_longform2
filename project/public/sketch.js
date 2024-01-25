let features = "";

let maxDPI = 3;
let RATIO = 1;

let W = window.innerWidth;
let H = window.innerHeight;

let CM = 1;
let DEFAULT_SIZE = window.innerWidth;
let DIM;
let MULTIPLIER;

let palette = ["#2c695a", "#4ad6af", "#7facc6", "#4e93cc", "#f6684f", "#ffd300"];
let ocean_palette = ["#023e8a", "#0077b6", "#0096c7", "#00b4d8", "#48cae4", "#90e0ef", "#ade8f4", "#caf0f8", "#E6FBFF", "#fff"];
let sun_palette = [
	"#ff4800",
	"#ff5400",
	"#ff6000",
	"#ff6d00",
	"#ff7900",
	"#ff8500",
	"#ff9100",
	"#ff9e00",
	"#ffaa00",
	"#ffb600",
	"#FF5457",
	"#FF7C7E",
	"#FFD3E4",
	"#FFD877",
	"#FFE6BD",
	"#fff",
	"#ffc971",
	"#fff",
];
let sky_palette = ["#0096c7", "#94d2bd", "#ffc971", "#ffb627", "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226"];
let reflexion_palette = ["#FF7C7E", "#ffb600", "#FFD3E4", "#FFD877", "#FFE6BD", "#fff"];
let available_brushes = [];

let r_l = 0;
let r_l_step = 0.001;
let r_w = 100;
let r_w_step = 0.001;
let r_y = 0;
let r_y_step = 0.1;

let s_y = 0;

let t_y = 0;
let t_y_step = 0.1;

let o_y = 0;
let o_y_step = 0.01;
let o_w = 1;
let o_w_step = 0.0001;

let ocean_done = false;
function setup() {
	// canvas setup
	DIM = min(windowWidth * CM, windowHeight * CM);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	c = createCanvas(DIM, DIM * RATIO, WEBGL);
	pixelDensity(dpi(2));
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	//rectMode(CENTER);
	angleMode(DEGREES);
	background("#fffceb");

	s_y = -height / 2;
	t_y = 0;
	o_y = height / 10;
	r_l = width / 4;

	console.log(brush);
	// brush.box() returns an array with available brushes
	brush.add("watercolor", {
		type: "image",
		weight: 10,
		vibration: 2,
		opacity: 30,
		spacing: 1.5,
		blend: true,
		pressure: {
			type: "custom",
			min_max: [0.0, 1.2],
			// This formula implies that the pressure changes in a linear distribution through the whole length of the line.
			// Minimum pressure at the start, maximum pressure at the end.
			curve: (x) => 1 - x,
		},
		image: {
			src: "./assets/brush.jpg",
		},
		rotate: "random",
	});
	brush.add("ocean", {
		type: "image",
		weight: 10,
		vibration: 0.5,
		opacity: 30,
		spacing: 1.5,
		blend: true,
		pressure: {
			type: "custom",
			min_max: [1.2, 1.2],
			// This formula implies that the pressure changes in a linear distribution through the whole length of the line.
			// Minimum pressure at the start, maximum pressure at the end.
			curve: (x) => 1 - x,
		},
		image: {
			src: "./assets/larapuna.png",
		},
		rotate: "natural",
	});
	brush.add("reflection", {
		type: "image",
		weight: 7,
		vibration: 0.5,
		opacity: 60,
		spacing: 1.5,
		blend: true,
		pressure: {
			type: "custom",
			min_max: [1.2, 1.2],
			// This formula implies that the pressure changes in a linear distribution through the whole length of the line.
			// Minimum pressure at the start, maximum pressure at the end.
			curve: (x) => 1 - x,
		},
		image: {
			src: "./assets/brush.jpg",
		},
		rotate: "random",
	});
	available_brushes = ["watercolor", "ocean", "reflection"];
	console.log(brush.box());
	console.log(brush);
	brush.scaleBrushes(1);

	brush.addField("new_wave", function (t, field) {
		let sinrange = random(10, 15) + 5 * sin(t);
		let cosrange = cos(t);
		let baseAngle = 1;
		for (let column = 0; column < field.length; column++) {
			for (let row = 0; row < field[0].length; row++) {
				let angle = sin(sinrange * column) * (baseAngle * cos(row * cosrange)) + random(-3, 3);
				field[column][row] = angle;
			}
		}
		return field;
	});
}

function draw() {
	translate(0, 0);

	// createTerrain();
	// for 10 frames run createSun();
	if (frameCount < 60) {
		createSky();
	}

	if (frameCount > 60 && frameCount < 120) {
		createSun();
	} else if (frameCount > 120 && !ocean_done) {
		createOcean();
	} else if (frameCount > 120 && ocean_done) {
		createReflexion();
	}
}

function createSky() {
	// You set a brush like this: brush.set(name_brush, color, weight)
	// set the stroke to a random brush, color and weight
	brush.field("new_wave");

	let map_color = int(map(s_y, -height / 2, 0, 0, sky_palette.length - 1, true));
	let brush_color = sky_palette[floor(map_color)];
	let brush_alpha = 40;

	brush.set(available_brushes[0], brush_color, 2);
	brush.noStroke();
	brush.noHatch();
	brush.fill(brush_color, brush_alpha);
	brush.rect(-width / 50, s_y, width * 1.1, 50, CENTER);
	s_y += 15;
}

function createSun() {
	// You set a brush like this: brush.set(name_brush, color, weight)
	// set the stroke to a random brush, color and weight
	brush.field("new_wave");
	let brush_color = random(sun_palette);
	let brush_alpha = random(50, 100);
	let radius = random([150, 155, 160, 165, 170, 175]);

	//brush.set(random(available_brushes), brush_color, 2);
	brush.set(available_brushes[0], brush_color, o_w);
	brush.noStroke();
	brush.noHatch();
	brush.fill(brush_color, brush_alpha);
	brush.circle(random(-width / 5 - width / 40, -width / 5 + width / 40), random(-radius / 13, radius / 13), radius, true);
}

function createOcean() {
	// You set a brush like this: brush.set(name_brush, color, weight)
	// set the stroke to a random brush, color and weight
	brush.field("new_wave");
	let brush_color = color(random(ocean_palette));

	brush.set(available_brushes[1], brush_color, o_w * 2);
	let loc = {
		x: [-width / 2, width / 2],
		a: [0, 180],
	};
	let r_loc = random([0, 1]);

	let brush_alpha = 100;

	brush.flowLine(random(-width / 2, width / 2), t_y + random(-o_w, o_w), random(width * 2), loc.a[r_loc]);
	t_y += t_y_step;
	t_y_step *= 1.001;
	o_w += o_w_step;
	o_w_step *= 1.001;

	if (t_y > height / 2) {
		ocean_done = true;
	}
}

function createReflexion() {
	// You set a brush like this: brush.set(name_brush, color, weight)
	// set the stroke to a random brush, color and weight
	let brush_color = color(random(reflexion_palette));
	let brush_alpha = random(70, 100);
	let rd_x = random(-width / 5 - r_l, -width / 5 + r_l);
	let rd_y = random(r_y - 16, r_y - 8);
	let rd_a = random([180]);

	brush.set(available_brushes[0], brush_color, 2);
	brush.noStroke();
	brush.noHatch();
	brush.fill("#fff", brush_alpha);
	brush.rect(rd_x, rd_y, r_w, 4, CENTER);
	brush.fill(brush_color, brush_alpha);
	brush.rect(rd_x, rd_y, r_w, 4, CENTER);

	s_y += 15;
	r_y += r_y_step;
	r_y_step *= 1.001;
	r_l -= r_l_step;
	r_l_step *= 1.002;
	r_w -= r_w_step;
	r_w_step *= 1.0001;

	if (r_w < 0) {
		r_w = 0;
	}

	if (r_l < 10) {
		r_l = 10;
	}
}
