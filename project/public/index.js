(fx = $fx),
	(fxhash = $fx.hash),
	(fxrand = $fx.rand),
	(rand = fxrand),
	(seed = parseInt(1e7 * fxrand()));
let features = $fx.getFeatures();
const complexityArr = [
		["1", 40],
		["2", 35],
		["6", 25],
	],
	themeArr = [
		["bright", 55],
		["dark", 45],
	],
	colorModeArr = [
		["monochrome", 5],
		["duotone", 30],
		["fixed", 5],
		["dynamic", 30],
		["iridescent", 30],
	],
	scaleValueArr = [
		["0.0001, 0.0008", 25],
		["0.0008, 0.002", 25],
		["0.002, 0.005", 25],
		["0.005, 0.01", 25],
	],
	scaleValueNameArr = [
		["macro", 35],
		["close", 25],
		["mid", 25],
		["far", 15],
	],
	clampvalueArr = [
		["0.015,0.015,0.0015,0.0015", 30],
		["0.025,0.025,0.0000015,0.0000015", 20],
		["0.0015,0.0015,0.015,0.015", 30],
		["0.0000015,0.0000015,0.025,0.025", 20],
		["0.0000015,0.0000015,0.0000015,0.0000015", 10],
	],
	clampNameArr = [
		["original", 30],
		["drift", 5],
		["original-revert", 20],
		["drift-revert", 5],
		["stretch", 40],
	],
	particleBehaviorNameArr = [
		["420/69 gas station", 5],
		["chinati foundation", 5],
		["saint-george pool", 5],
		["el paisano", 5],
		["planet marfa", 5],
		["glitch gallery", 5],
		["the sentinel", 5],
		["aster's", 5],
		["the techno barn", 5],
		["planet marfa", 5],
		["marfa burritos", 5],
		["marfa spirits", 5],
		["prada marfa", 5],
		["art blocks gallery", 5],
		["thunderbird hotel", 5],
		["wrong store", 5],
		["the otherside", 5],
		["el cosmico", 5],
		["crowley theater", 5],
		["convenience west", 5],
		["love, marfa", 5],
	],
	particleBehaviorArr = [
		["4,4,20,20", 5],
		["5,5,5,5", 5],
		["5,5,10,10", 5],
		["5,5,15,15", 5],
		["5,5,20,20", 5],
		["7,7,7,7", 5],
		["7,7,10,10", 5],
		["7,7,15,15", 5],
		["7,7,20,20", 5],
		["10,10,5,5", 5],
		["10,10,10,10", 5],
		["10,10,15,15", 5],
		["10,10,20,20", 5],
		["15,15,5,5", 5],
		["15,15,10,10", 5],
		["15,15,15,15", 5],
		["15,15,20,20", 5],
		["20,20,5,5", 5],
		["20,20,10,10", 5],
		["20,20,15,15", 5],
		["20,20,20,20", 5],
	],
	amplitudeModeArr = [
		["none", 50],
		["low", 30],
		["high", 20],
	],
	amplitudeLockModeArr = [
		["true", 20],
		["false", 80],
	],
	vibrancyModeArr = [
		["low", 20],
		["high", 20],
		["full", 60],
	],
	lineModeArr = [
		["hairline", 10],
		["thin", 10],
		["fine", 10],
		["medium", 10],
		["thick", 10],
		["post", 10],
		["column", 10],
		["pillar", 10],
		["beam", 10],
		["wall", 10],
	],
	lineModeValueArr = [
		["1", 10],
		["3", 10],
		["5", 10],
		["10", 10],
		["15", 10],
		["25", 10],
		["50", 10],
		["75", 10],
		["100", 10],
		["125", 10],
	],
	jdlModeArr = [
		["true", 85],
		["false", 15],
	],
	bgModeArr = [
		["transparent", 17],
		["same", 16],
		["complementary", 40],
		["analogous", 25],
	],
	skipBreakfastArr = [
		[!0, 10],
		[!1, 90],
	];
function generate_composition_params(
	e,
	a,
	t,
	i,
	r,
	o,
	s,
	n,
	d,
	m,
	l,
	c,
	h,
	u,
	p,
	f,
	_
) {
	if (
		(void 0 === a && (a = weighted_choice(themeArr)),
		void 0 === t && (t = weighted_choice(colorModeArr)),
		void 0 === r)
	) {
		let e = weighted_choice(clampNameArr);
		r = e;
		let a = -1;
		for (let t = 0; t < clampNameArr.length; t++)
			if (JSON.stringify(clampNameArr[t][0]) === JSON.stringify(e)) {
				a = t;
				break;
			}
		-1 !== a && (i = clampvalueArr[a][0]);
	}
	if (void 0 === s) {
		let e = weighted_choice(scaleValueNameArr);
		s = e;
		let a = -1;
		for (let t = 0; t < scaleValueNameArr.length; t++)
			if (JSON.stringify(scaleValueNameArr[t][0]) === JSON.stringify(e)) {
				a = t;
				break;
			}
		-1 !== a && (o = scaleValueArr[a][0]);
	}
	if (void 0 === n) {
		let e = weighted_choice(particleBehaviorNameArr);
		n = e;
		let a = -1;
		for (let t = 0; t < particleBehaviorNameArr.length; t++)
			if (JSON.stringify(particleBehaviorNameArr[t][0]) === JSON.stringify(e)) {
				a = t;
				break;
			}
		-1 !== a && (d = particleBehaviorArr[a][0]);
	}
	if ((void 0 === e && (e = weighted_choice(complexityArr)), void 0 === m))
		if ("macro" === s) {
			m = weighted_choice([
				["none", 10],
				["low", 50],
				["high", 40],
			]);
		} else if ("close" === s) {
			m = weighted_choice([
				["none", 33],
				["low", 33],
				["high", 33],
			]);
		} else m = weighted_choice(amplitudeModeArr);
	if ((void 0 === c && (c = weighted_choice(vibrancyModeArr)), void 0 === h)) {
		let e = weighted_choice(lineModeArr);
		h = e;
		let a = -1;
		for (let t = 0; t < lineModeArr.length; t++)
			if (JSON.stringify(lineModeArr[t][0]) === JSON.stringify(e)) {
				a = t;
				break;
			}
		-1 !== a && (u = lineModeValueArr[a][0]);
	}
	return (
		void 0 === p && (p = weighted_choice(jdlModeArr)),
		void 0 === f && (f = weighted_choice(bgModeArr)),
		void 0 === l && (l = weighted_choice(amplitudeLockModeArr)),
		void 0 === _ && (_ = weighted_choice(skipBreakfastArr)),
		{
			complexity: e,
			theme: a,
			colormode: t,
			clampvalue: i,
			clampvalueArr: clampvalueArr,
			clampNameArr: clampNameArr,
			clampname: r,
			scalevalue: o,
			scaleValueArr: scaleValueArr,
			scaleValueNameArr: scaleValueNameArr,
			scalename: s,
			behaviorvalue: d,
			behaviorValueArr: particleBehaviorArr,
			behaviorNameArr: particleBehaviorNameArr,
			behaviorname: n,
			amplitudemode: m,
			amplitudelockmode: l,
			vibrancymode: c,
			linemode: u,
			linemodeName: h,
			jdlmode: p,
			bgmode: f,
			skipbreakfast: _,
		}
	);
}
function weighted_choice(e) {
	let a = 0;
	for (let t = 0; t < e.length; ++t) a += e[t][1];
	const t = rand() * a;
	a = 0;
	for (let i = 0; i < e.length - 1; ++i)
		if (((a += e[i][1]), a >= t)) return e[i][0];
	return e[e.length - 1][0];
}
let mapValue = (e, a, t, i, r) =>
	(((e = Math.min(Math.max(e, a), t)) - a) * (r - i)) / (t - a) + i;
const pmap = (e, a, t, i, r, o) =>
	o
		? Math.min(Math.max(((e - a) / (t - a)) * (r - i) + i, i), r)
		: ((e - a) / (t - a)) * (r - i) + i;
let clamp = (e, a, t) => (e < a ? a : e > t ? t : e),
	smoothstep = (e, a, t) => (
		(t -= e), (t /= a - e) < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t)
	),
	mix = (e, a, t) => e + t * (a - e),
	dot = (e, a) => e.x * a.x + e.y * a.y,
	R = (e = 1) => Math.random() * e,
	L = (e, a) => (e * e + a * a) ** 0.5,
	k = (e, a) => (e > 0 && a > 0 ? L(e, a) : e > a ? e : a),
	dpi = (e = 3) => {
		var a = window.navigator.userAgent,
			t = !!a.match(/iPad/i) || !!a.match(/iPhone/i),
			i = !!a.match(/WebKit/i);
		let r = 2 * e;
		return t && i && !a.match(/CriOS/i) ? (r > 6 && (r = 6), r) : e;
	},
	noiseCanvasWidth = 1,
	noiseCanvasHeight = 1;
function oct(e, a, t, i, r = 1) {
	let o = 0,
		s = 1;
	i *= r;
	for (let n = 0; n < r; n++) (o += n2(e, a, t * s, i + n) / s), (s *= 2);
	return o;
}
function saveCanvas(e) {
	if ("s" === e.key && (e.metaKey || e.ctrlKey))
		return saveArtwork(), e.preventDefault(), !1;
}
function saveArtwork() {
	var e = document.querySelector(".spin-container"),
		a = document.getElementById("defaultCanvas0"),
		t = new Date(),
		i =
			t.getDate() +
			"_" +
			`${t.getMonth() + 1}_` +
			t.getFullYear() +
			"_" +
			`${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
	console.log(a);
	var r = i + ".png";
	const o = a.toDataURL("image/png").replace("image/png", "image/octet-stream"),
		s = document.createElement("a");
	(s.href = o),
		s.setAttribute("download", r),
		s.click(),
		e.classList.remove("active"),
		console.log("saved " + r);
}
({sin: sin, cos: cos, imul: imul, PI: PI} = Math),
	(TAU = 2 * PI),
	(F = (e, a) => [...Array(e)].map((e, t) => a(t))),
	(S = Uint32Array.of(9, 7, 5, 3)),
	(R = (e = 1) =>
		e *
		((e = S[3]),
		(S[3] = S[2]),
		(S[2] = S[1]),
		(e ^= e << 11),
		(S[0] ^= e ^ (e >>> 8) ^ ((S[1] = S[0]) >>> 19)),
		S[0] / 2 ** 32)),
	[...(seed + "ThxPiter")].map((e) => R((S[3] ^= 23205 * e.charCodeAt()))),
	(KNUTH = 2654435761),
	(NSEED = R(2 ** 32)),
	(ri = (e, a, t) => (
		(e = imul(
			(((1023 & e) << 20) | ((1023 & a) << 10) | (1023 & (e ^ a ^ t))) ^ NSEED,
			KNUTH
		)),
		((e <<= 3 + (e >>> 29)) >>> 1) / 2 ** 31 - 0.5
	)),
	(no = F(99, (e) => R(1024))),
	(na = F(99, (e) => R(TAU))),
	(ns = na.map(sin)),
	(nc = na.map(cos)),
	(nox = F(99, (e) => R(1024))),
	(noy = F(99, (e) => R(1024))),
	(n2 = (
		e,
		a,
		t,
		i,
		r = nc[i] * t,
		o = ns[i] * t,
		s = floor(
			(([e, a] = [
				(e - noiseCanvasWidth / 2) * r +
					(a - 2 * noiseCanvasHeight) * o +
					nox[i],
				(a - 2 * noiseCanvasHeight) * r -
					(e - noiseCanvasWidth / 2) * o +
					noy[i],
			]),
			e)
		),
		n = floor(a)
	) => (
		(e -= s),
		(a -= n),
		(e *= e * (3 - 2 * e)),
		(a *= a * (3 - 2 * a)),
		ri(s, n, i) * (1 - e) * (1 - a) +
			ri(s, n + 1, i) * (1 - e) * a +
			ri(s + 1, n, i) * e * (1 - a) +
			ri(s + 1, n + 1, i) * e * a
	)),
	document.addEventListener("keydown", saveCanvas),
	console.log(fxhash);
let urlParams = new URLSearchParams(window.location.search).get("parameters"),
	composition_params,
	fxfeatures;
(urlParams = JSON.parse(urlParams)), urlParams || (urlParams = {});
let dpi_val = 1,
	movers = [],
	scl1,
	scl2,
	amp1,
	amp2,
	rseed,
	nseed,
	xMin,
	xMax,
	yMin,
	yMax,
	startTime,
	maxFrames = 10,
	frameIterator = 0,
	currentFrame = 0,
	MARGIN = 150,
	oldMARGIN = MARGIN,
	frameMargin,
	RATIO = 3,
	DEFAULT_SIZE = 4800 / RATIO,
	W = window.innerWidth,
	H = window.innerHeight,
	DIM,
	MULTIPLIER,
	elapsedTime = 0,
	renderStart = Date.now(),
	framesRendered = 0,
	totalElapsedTime = 0,
	particleNum = 4e5,
	drawing = !0,
	renderMode = 1,
	cycle = parseInt((maxFrames * particleNum) / 1170),
	hue,
	bgCol,
	bgHue,
	bgSat,
	animation,
	dom_margin,
	dom_particleNum,
	dom_frameNum,
	dom_dpi,
	dom_ratio,
	dom_tilt,
	dom_presentation,
	dom_radius,
	dom_dashboard,
	dom_hash,
	dom_spin,
	edits = 0,
	dashboard_mode = !1,
	rotation_mode = !1,
	border_mode = 0,
	presentation = !1,
	ratio_name = "Bookmark",
	dom_toggle = "",
	buttons = [];
function preload() {
	setupDomElements(), setupBundle();
}
function setupBundle() {
	composition_params = generate_composition_params();
	var {
		complexity: e,
		theme: a,
		colormode: t,
		clampvalue: i,
		clampvalueArr: r,
		clampNameArr: o,
		clampname: s,
		scalename: n,
		scalevalue: d,
		scaleValueArr: m,
		scaleValueNameArr: l,
		behaviorvalue: c,
		behaviorValueArr: h,
		behaviorNameArr: u,
		behaviorname: p,
		amplitudemode: f,
		amplitudelockmode: _,
		vibrancymode: g,
		linemode: M,
		linemodeName: x,
		jdlmode: v,
		bgmode: b,
		skipbreakfast: y,
	} = composition_params;
	let w = new URLSearchParams(window.location.search).get("parameters");
	if (w) {
		if (
			((w = JSON.parse(w)),
			w.complexity && (e = w.complexity),
			w.theme && (a = w.theme),
			w.colormode && (t = w.colormode),
			w.clampname)
		) {
			s = w.clampname;
			let e = -1;
			for (let a = 0; a < o.length; a++)
				if (JSON.stringify(o[a][0]) === JSON.stringify(s)) {
					e = a;
					break;
				}
			-1 !== e && (i = r[e][0]);
		}
		if (w.scalename) {
			n = w.scalename;
			let e = -1;
			for (let a = 0; a < l.length; a++)
				if (JSON.stringify(l[a][0]) === JSON.stringify(n)) {
					e = a;
					break;
				}
			-1 !== e && (d = m[e][0]);
		}
		if (w.location) {
			location = w.location;
			let e = -1;
			for (let a = 0; a < u.length; a++)
				if (JSON.stringify(u[a][0]) === JSON.stringify(location)) {
					e = a;
					break;
				}
			-1 !== e && (c = h[e][0]);
		}
		if (
			(w.amplitudemode && (f = w.amplitudemode),
			w.amplitudelockmode && (_ = w.amplitudelockmode),
			w.vibrancymode && (g = w.vibrancymode),
			w.linemode)
		) {
			lineMode = w.linemode;
			let e = -1;
			for (let a = 0; a < lineModeName.length; a++)
				if (JSON.stringify(lineModeName[a][0]) === JSON.stringify(lineMode)) {
					e = a;
					break;
				}
			-1 !== e && (lineMode = lineModeValueArr[e][0]);
		}
		w.jdlmode && (v = w.jdlmode),
			w.bgmode && (b = w.bgmode),
			w.skipbreakfast && (y = w.skipbreakfast);
	}
	$fx.features({
		complexity: e,
		theme: a,
		colormode: t,
		clampname: s,
		scalename: n,
		location: p,
		amplitudemode: f,
		amplitudelockmode: _,
		vibrancymode: g,
		lineMode: x,
		jdlmode: v,
		bgmode: b,
		skipbreakfast: y,
	}),
		(window.features = {
			complexity: e,
			theme: a,
			colormode: t,
			clampvalue: i,
			scalevalue: d,
			behaviorvalue: c,
			amplitudemode: f,
			amplitudelockmode: _,
			vibrancymode: g,
			lineModeValue: M,
			jdlmode: v,
			bgmode: b,
			skipbreakfast: y,
		});
}
function setup() {
	(fxfeatures = $fx.getFeatures()), (features = window.features), initSketch();
}
function initSketch() {
	(elapsedTime = 0),
		(framesRendered = 0),
		console.table(fxfeatures),
		(drawing = !0),
		$fx.rand.reset(),
		(fx = $fx),
		(fxhash = $fx.hash),
		(fxrand = $fx.rand),
		(rand = fxrand),
		animation && clearTimeout(animation),
		(movers = []),
		loadURLParams(),
		"Skateboard" == ratio_name && 0 == edits
			? ((MARGIN = 0),
			  (border_mode = 500),
			  (document.querySelector(
					"canvas"
			  ).style.borderRadius = `${border_mode}px`),
			  edits++)
			: "Skateboard" != ratio_name &&
			  ((border_mode = 0),
			  (document.querySelector(
					"canvas"
			  ).style.borderRadius = `${border_mode}px`)),
		(dom_margin.innerHTML = `${MARGIN}px`),
		(dom_particleNum.innerHTML = particleNum),
		(dom_frameNum.innerHTML = `${maxFrames} Frames`),
		(dom_dpi.innerHTML = dpi_val),
		(dom_ratio.innerHTML = ratio_name),
		(dom_tilt.innerHTML = rotation_mode ? "ON" : "OFF"),
		(dom_presentation.innerHTML = presentation ? "ON" : "OFF"),
		(dom_radius.innerHTML = `${border_mode}px`),
		(dom_dashboard.innerHTML = "Rendering..."),
		(dom_hash.innerHTML = fxhash),
		dom_spin.classList.add("active"),
		(DEFAULT_SIZE = 4800 / RATIO),
		(DIM = min(windowWidth, windowHeight)),
		(MULTIPLIER = DIM / DEFAULT_SIZE),
		(c = createCanvas(DIM, DIM * RATIO)),
		pixelDensity(dpi(dpi_val)),
		(frameMargin = MARGIN * MULTIPLIER),
		rectMode(CENTER),
		randomSeed(seed),
		noiseSeed(seed),
		colorMode(HSB, 360, 100, 100, 100),
		(startTime = frameCount);
	let e = [0, 45, 90, 135, 180, 225, 270, 315];
	(hue = e[parseInt(fxrand() * e.length)]),
		(bgHue =
			"complementary" == features.bgmode
				? (hue + 180) % 360
				: "analogous" == features.bgmode
				? (hue + 30) % 360
				: hue),
		(bgSat = "transparent" == features.bgmode ? 0 : random([2, 4, 6])),
		(bgCol = color(bgHue, bgSat, "bright" == features.theme ? 93 : 10, 100)),
		INIT_MOVERS(),
		(renderStart = Date.now());
	let a = drawGenerator();
	!(function e() {
		(animation = setTimeout(e, 0)), a.next();
	})();
}
function* drawGenerator() {
	let e = 0,
		a = 0,
		t = cycle;
	for (;;) {
		for (let a = 0; a < particleNum; a++) {
			const i = movers[a];
			features.lazymorning ? elapsedTime > 1 && i.show() : i.show(),
				i.move(),
				e > t && ((e = 0), yield),
				e++;
		}
		if (
			((elapsedTime = a - startTime),
			showLoadingBar(elapsedTime, maxFrames, renderStart),
			a++,
			elapsedTime > maxFrames && drawing)
		)
			return (drawing = !1), $fx.preview(), void (document.complete = !0);
	}
}
function INIT_MOVERS() {
	(movers = []),
		background(bgCol),
		drawTexture(bgHue),
		(sclVal = features.scalevalue.split(",").map(Number)),
		(scl1 = random(sclVal[0], sclVal[1])),
		(scl2 = random(sclVal[0], sclVal[1]));
	let e = features.amplitudelockmode,
		a = features.amplitudemode,
		t = fxfeatures.scalename,
		i = {
			macro: [
				"high" == features.amplitudemode ? 16e3 : 5e3,
				"high" == features.amplitudemode ? 5e3 : 1e3,
			],
			close: [
				"high" == features.amplitudemode ? 5e3 : 1e3,
				"high" == features.amplitudemode ? 1e3 : 500,
			],
			mid: [
				"high" == features.amplitudemode ? 1e3 : 500,
				"high" == features.amplitudemode ? 500 : 100,
			],
			far: [
				"high" == features.amplitudemode ? 500 : 100,
				"high" == features.amplitudemode ? 100 : 10,
			],
		},
		r = {
			macro: [1e-4, 8e-4],
			close: [8e-4, 0.002],
			mid: [0.002, 0.005],
			far: [0.005, 0.01],
		}[t],
		o = i[t],
		s = Math.floor(map(scl1, r[0], r[1], o[0], o[1], !0)),
		n = Math.floor(map(scl2, r[0], r[1], o[0], o[1], !0));
	(amp1rnd1 = Math.floor(fxrand() * s)),
		(amp1rnd2 = Math.floor(fxrand() * s)),
		(amp2rnd1 = Math.floor(fxrand() * n)),
		(amp2rnd2 = Math.floor(fxrand() * n));
	let d = Math.min(amp1rnd1, amp1rnd2),
		m = Math.min(amp2rnd1, amp2rnd2),
		l = Math.max(amp1rnd1, amp1rnd2),
		c = Math.max(amp2rnd1, amp2rnd2);
	"none" == a
		? ((amp1 = int(random(1, 5))), (amp2 = int(random(1, 5))))
		: "low" == a
		? "true" == e
			? ((amp1 = d), (amp2 = amp1))
			: ((amp1 = d), (amp2 = m))
		: "high" == a &&
		  ("true" == e ? ((amp1 = l), (amp2 = amp1)) : ((amp1 = l), (amp2 = c)));
	let h = random([0.08, 0.09, 0.1, 0.11, 0.12]),
		u = random([0.08, 0.09, 0.1, 0.11, 0.12]);
	(xMarg = frameMargin / width),
		(yMarg = frameMargin / height),
		(xMin = xMarg),
		(xMax = 1 - xMarg),
		(yMin = yMarg),
		(yMax = 1 - yMarg);
	for (let e = 0; e < particleNum; e++) {
		let e = random(xMin, xMax) * width,
			a = random(yMin, yMax) * height,
			t = hue;
		(t = t > 360 ? t - 360 : t < 0 ? t + 360 : t),
			movers.push(
				new Mover(
					e,
					a,
					t,
					scl1 / MULTIPLIER,
					scl2 / MULTIPLIER,
					amp1 * MULTIPLIER,
					amp2 * MULTIPLIER,
					xMin,
					xMax,
					yMin,
					yMax,
					h,
					u
				)
			);
	}
}
function loadURLParams() {
	!window.location.search.includes("population") ||
		(particleNum = parseInt(window.location.search.split("population=")[1])),
		window.location.search.includes("dpi") &&
			(dpi_val = parseInt(window.location.search.split("dpi=")[1])),
		window.location.search.includes("ratio=") &&
			(window.location.search.includes("ratio=a4") || "a4" == urlParams.ratio
				? ((RATIO = 1.414), (MARGIN = 250))
				: window.location.search.includes("ratio=skate") ||
				  "skate" == urlParams.ratio
				? ((RATIO = 3.888), (MARGIN = 0))
				: window.location.search.includes("ratio=square") ||
				  window.location.search.includes("ratio=1") ||
				  "square" == urlParams.ratio ||
				  "1" == urlParams.ratio
				? ((RATIO = 1), (MARGIN = 300))
				: window.location.search.includes("ratio=3") ||
				  window.location.search.includes("ratio=bookmark") ||
				  "bookmark" == urlParams.ratio
				? ((RATIO = 3), (MARGIN = 150))
				: ((RATIO = parseInt(window.location.search.split("ratio=")[1])),
				  (MARGIN = 200))),
		window.location.search.includes("margin") &&
			(MARGIN = parseInt(window.location.search.split("margin=")[1]));
}
function drawTexture(e) {
	for (let a = 0; a < 6e5; a++) {
		let a = fxrand() * width,
			t = fxrand() * height,
			i = 0.45 * MULTIPLIER,
			r = e + 2 * fxrand() - 1,
			o =
				"monochrome" != features.colormode
					? [0, 20, 40, 60, 80, 100][parseInt(6 * fxrand())]
					: 0,
			s = [0, 10, 10, 20, 20, 40, 60, 70, 90, 90, 100][parseInt(11 * fxrand())];
		(drawingContext.fillStyle = `hsla(${r}, ${o}%, ${s}%, 100%)`),
			drawingContext.fillRect(a, t, i, i);
	}
}
function showLoadingBar(e, a, t) {
	framesRendered++;
	let i = Date.now();
	totalElapsedTime = i - t;
	let r = (e / a) * 100;
	r > 100 && (r = 100);
	let o = (totalElapsedTime / framesRendered) * (a - framesRendered),
		s = Math.round(o / 1e3);
	(document.title = r.toFixed(0) + "%"),
		(dom_dashboard.innerHTML = r.toFixed(0) + "% - Time left : " + s + "s"),
		r.toFixed(0) >= 100 &&
			((dom_dashboard.innerHTML = "Done!"),
			dom_spin.classList.remove("active"));
}
class Mover {
	constructor(
		x,
		y,
		hue,
		scl1,
		scl2,
		amp1,
		amp2,
		xMin,
		xMax,
		yMin,
		yMax,
		xRandDivider,
		yRandDivider,
		bgColArr
	) {
		(this.x = x),
			(this.y = y),
			(this.initHue = hue),
			(this.initSat =
				"high" === features.vibrancymode
					? [60, 70, 80, 80, 90, 100][Math.floor(6 * fxrand())]
					: "low" === features.vibrancymode
					? [0, 10, 20, 20, 30, 40][Math.floor(6 * fxrand())]
					: [0, 10, 20, 30, 40, 40, 60, 80, 80, 90, 100][
							Math.floor(11 * fxrand())
					  ]),
			(this.initBri =
				"bright" === features.theme && "monochrome" !== features.colormode
					? [0, 10, 20, 20, 40, 40, 60, 70, 80, 90, 100][
							Math.floor(11 * fxrand())
					  ]
					: "bright" === features.theme && "monochrome" === features.colormode
					? [0, 0, 10, 20, 20, 30, 40, 60, 80][Math.floor(9 * fxrand())]
					: [40, 40, 60, 70, 70, 80, 80, 90, 100][Math.floor(9 * fxrand())]),
			(this.initAlpha = 50),
			(this.initS = 1 * MULTIPLIER),
			(this.hue = this.initHue),
			(this.sat =
				"monochrome" === features.colormode || "duotone" === features.colormode
					? 0
					: this.initSat),
			(this.bri = this.initBri),
			(this.a = this.initAlpha),
			(this.hueStep =
				"monochrome" === features.colormode || "fixed" === features.colormode
					? 1
					: "dynamic" === features.colormode || "duotone" === features.colormode
					? 10
					: 20),
			(this.satStep = "duotone" === features.colorMode ? 0.1 : 1),
			(this.briStep = 0),
			(this.s = this.initS),
			(this.scl1 = scl1),
			(this.scl2 = scl2),
			(this.amp1 = amp1),
			(this.amp2 = amp2),
			(this.xRandDivider = xRandDivider),
			(this.yRandDivider = yRandDivider),
			(this.xRandSkipper = 0),
			(this.yRandSkipper = 0),
			(this.xRandSkipperVal = 0),
			(this.yRandSkipperVal = 0),
			(this.xMin = xMin),
			(this.xMax = xMax),
			(this.yMin = yMin),
			(this.yMax = yMax),
			(this.oct = features.complexity),
			(this.centerX = width / 2),
			(this.centerY = height / 2),
			(this.borderX = width / 2),
			(this.borderY = height / 2.75),
			(this.clampvaluearray = features.clampvalue.split(",").map(Number)),
			(this.uvalueArr = features.behaviorvalue.split(",").map(Number)),
			(this.uvalue = Math.min(...this.uvalueArr)),
			(this.bgCol = bgColArr),
			(this.zombie = !1),
			(this.zombieAlpha = "true" === features.jdlmode ? this.initAlpha : 0),
			(this.lineWeight =
				"string" == typeof features.lineModeValue
					? eval(features.lineModeValue) * MULTIPLIER
					: features.lineModeValue * MULTIPLIER);
	}
	show() {
		(drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`),
			drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}
	move() {
		let e = superCurve(
			this.x,
			this.y,
			this.scl1,
			this.scl2,
			this.amp1,
			this.amp2,
			this.oct,
			this.clampvaluearray,
			this.uvalueArr
		);
		(this.xRandSkipper =
			fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) -
			this.xRandSkipperVal * MULTIPLIER),
			(this.yRandSkipper =
				fxrand() * (this.xRandSkipperVal * MULTIPLIER * 2) -
				this.xRandSkipperVal * MULTIPLIER),
			(this.x += (e.x * MULTIPLIER) / this.xRandDivider + this.xRandSkipper),
			(this.y += (e.y * MULTIPLIER) / this.yRandDivider + this.yRandSkipper);
		let a = e.x - e.y;
		(this.hue += mapValue(
			a,
			2 * -this.uvalue,
			2 * this.uvalue,
			-this.hueStep,
			this.hueStep,
			!0
		)),
			(this.hue = this.hue > 360 ? 0 : this.hue < 0 ? 360 : this.hue),
			(this.bri += mapValue(
				e.y,
				2 * -this.uvalue,
				2 * this.uvalue,
				-this.briStep,
				this.briStep,
				!0
			)),
			(this.bri = this.bri > 100 ? 0 : this.bri < 0 ? 100 : this.bri),
			(this.sat += mapValue(
				e.x,
				2 * -this.uvalue,
				2 * this.uvalue,
				-this.satStep,
				this.satStep,
				!0
			)),
			"monochrome" != features.colormode && "duotone" != features.colormode
				? (this.sat = this.sat > 100 ? 0 : this.sat < 0 ? 100 : this.sat)
				: "duotone" === features.colormode &&
				  (this.sat =
						this.sat > 1.5 * this.initSat
							? 0
							: this.sat < 0
							? 1.5 * this.initSat
							: this.sat),
			this.x < this.xMin * width ||
			this.x > this.xMax * width ||
			this.y < this.yMin * height ||
			this.y > this.yMax * height
				? ((this.a = 0), (this.zombie = !0))
				: (this.a = this.zombie ? this.zombieAlpha : this.initAlpha),
			this.x < this.xMin * width - this.lineWeight &&
				(this.x = this.xMax * width + fxrand() * this.lineWeight),
			this.x > this.xMax * width + this.lineWeight &&
				(this.x = this.xMin * width - fxrand() * this.lineWeight),
			this.y < this.yMin * height - this.lineWeight &&
				(this.y = this.yMax * height + fxrand() * this.lineWeight),
			this.y > this.yMax * height + this.lineWeight &&
				(this.y = this.yMin * height - fxrand() * this.lineWeight);
	}
}
function superCurve(e, a, t, i, r, o, s, n, d) {
	let m,
		l,
		c = e,
		h = a,
		u = r,
		p = o,
		f = t,
		_ = i;
	(m = oct(c, h, f, 0, s)),
		(l = oct(c, h, _, 2, s)),
		(c += m * u),
		(h += l * p),
		(m = oct(c, h, f, 1, s)),
		(l = oct(c, h, _, 3, s)),
		(c += m * u),
		(h += l * p),
		(m = oct(c, h, f, 1, s)),
		(l = oct(c, h, _, 2, s)),
		(c += m * u),
		(h += l * p);
	let g = oct(c, h, f, 3, s),
		M = oct(c, h, _, 2, s);
	return {
		x: mapValue(g, -n[0], n[1], -d[0], d[1], !0),
		y: mapValue(M, -n[2], n[3], -d[2], d[3], !0),
	};
}
function setupDomElements() {
	(dom_margin = document.querySelector(".kb-params.margin")),
		(dom_particleNum = document.querySelector(".kb-params.population")),
		(dom_frameNum = document.querySelector(".kb-params.exposure")),
		(dom_dpi = document.querySelector(".kb-params.dpi")),
		(dom_ratio = document.querySelector(".kb-params.ratio")),
		(dom_tilt = document.querySelector(".kb-params.tilt")),
		(dom_presentation = document.querySelector(".kb-params.presentation")),
		(dom_radius = document.querySelector(".kb-params.radius")),
		(dom_dashboard = document.querySelector(".kb-params.dashboard")),
		(dom_toggle = document.querySelector(".info-toggle")),
		(dom_hash = document.querySelector(".hash")),
		(dom_spin = document.querySelector(".spin-container")),
		"standalone" === $fx.context
			? dom_toggle.classList.contains("show") ||
			  dom_toggle.classList.add("show")
			: dom_toggle.classList.contains("show") &&
			  dom_toggle.classList.remove("show"),
		(buttons = document.querySelectorAll("[data-button]")),
		handleEvent();
}
function handleEvent() {
	dom_toggle &&
		dom_toggle.addEventListener("click", function (e) {
			dom_toggle.classList.contains("active")
				? (dom_toggle.classList.remove("active"),
				  document.querySelector(".container").classList.remove("show"),
				  document.querySelector(".info-wrapper").classList.remove("show"),
				  document.querySelector(".save-wrapper").classList.remove("show"),
				  document.querySelector(".button-wrapper").classList.remove("show"),
				  (document.querySelector(".icon").innerHTML = "i"))
				: (dom_toggle.classList.add("active"),
				  document.querySelector(".container").classList.add("show"),
				  document.querySelector(".info-wrapper").classList.add("show"),
				  document.querySelector(".save-wrapper").classList.add("show"),
				  document.querySelector(".button-wrapper").classList.add("show"),
				  (document.querySelector(".icon").innerHTML = "X"));
		}),
		buttons.forEach((e) => {
			e.addEventListener("click", function (a) {
				e.classList.contains("btn-radius") && mod_border_radius(),
					e.classList.contains("btn-presentation") && mod_pres_mode(),
					e.classList.contains("btn-info") && mod_info_mode(),
					e.classList.contains("btn-tilt") && mod_tilt_mode(),
					e.classList.contains("btn-margin") &&
						((dom_dashboard.innerHTML = "Please wait..."),
						dom_spin.classList.add("active"),
						mod_margin_mode()),
					e.classList.contains("btn-ratio") &&
						((dom_dashboard.innerHTML = "Please wait..."),
						dom_spin.classList.add("active"),
						mod_ratio_mode()),
					e.classList.contains("btn-population") &&
						((dom_dashboard.innerHTML = "Please wait..."),
						dom_spin.classList.add("active"),
						mod_particle_mode()),
					e.classList.contains("btn-exposure") &&
						((dom_dashboard.innerHTML = "Please wait..."),
						dom_spin.classList.add("active"),
						mod_exposure_mode()),
					e.classList.contains("btn-dpi") &&
						((dom_dashboard.innerHTML = "Please wait..."),
						dom_spin.classList.add("active"),
						mod_dpi_mode()),
					e.classList.contains("btn-save") &&
						(dom_spin.classList.add("active"), saveArtwork());
			});
		}),
		document.addEventListener("keydown", function (e) {
			"b" === e.key && mod_border_radius(),
				"v" === e.key && mod_pres_mode(),
				"i" === e.key && mod_info_mode(),
				"t" === e.key && mod_tilt_mode(),
				"m" === e.key && mod_margin_mode(),
				"r" === e.key && mod_ratio_mode(),
				"p" === e.key && mod_particle_mode(),
				"f" === e.key && mod_exposure_mode(),
				"d" === e.key && mod_dpi_mode();
		});
}
function mod_border_radius() {
	0 === border_mode
		? ((border_mode = 5),
		  (document.querySelector("canvas").style.borderRadius = "5px"))
		: 5 === border_mode
		? ((border_mode = 10),
		  (document.querySelector("canvas").style.borderRadius = "10px"))
		: 10 === border_mode
		? ((border_mode = 20),
		  (document.querySelector("canvas").style.borderRadius = "20px"))
		: 20 === border_mode
		? ((border_mode = 50),
		  (document.querySelector("canvas").style.borderRadius = "50px"))
		: 50 === border_mode
		? ((border_mode = 500),
		  (document.querySelector("canvas").style.borderRadius = "500px"))
		: 500 === border_mode &&
		  ((border_mode = 0),
		  (document.querySelector("canvas").style.borderRadius = "0px")),
		(dom_radius.innerHTML = `${border_mode}px`);
}
function mod_pres_mode() {
	presentation
		? ((presentation = !1),
		  document.querySelector("canvas").classList.remove("presentation"))
		: ((presentation = !0),
		  document.querySelector("canvas").classList.add("presentation")),
		(dom_presentation.innerHTML = presentation ? "ON" : "OFF");
}
function mod_info_mode() {
	dashboard_mode
		? ((dashboard_mode = !1),
		  document.querySelector(".info-wrapper").classList.remove("show"))
		: ((dashboard_mode = !0),
		  document.querySelector(".info-wrapper").classList.add("show")),
		(dom_dashboard.innerHTML = dashboard_mode ? "ON" : "OFF");
}
function mod_tilt_mode() {
	rotation_mode
		? ((rotation_mode = !1),
		  document.querySelector("canvas").classList.remove("horizontal"))
		: ((rotation_mode = !0),
		  document.querySelector("canvas").classList.add("horizontal")),
		(dom_tilt.innerHTML = rotation_mode ? "ON" : "OFF");
}
function mod_margin_mode() {
	(MARGIN += 50),
		MARGIN > 300 && (MARGIN = 0),
		(dom_dashboard.innerHTML = "Please wait..."),
		(dom_margin.innerHTML = `${MARGIN}px`),
		setTimeout(() => {
			initSketch();
		}, 10);
}
function mod_ratio_mode() {
	3 === RATIO
		? ((RATIO = 3.88), (ratio_name = "Skateboard"))
		: 3.88 === RATIO
		? ((RATIO = 1), (MARGIN = 300), (ratio_name = "Square"))
		: 1 === RATIO
		? ((RATIO = 1.414), (MARGIN = 250), (ratio_name = "A4"))
		: 1.414 === RATIO
		? ((RATIO = 2), (MARGIN = 250), (ratio_name = "Univisium"))
		: 2 === RATIO && ((RATIO = 3), (MARGIN = 150), (ratio_name = "Bookmark")),
		(dom_dashboard.innerHTML = "Please wait..."),
		(dom_ratio.innerHTML = ratio_name),
		setTimeout(() => {
			initSketch();
		}, 10);
}
function mod_particle_mode() {
	4e5 === particleNum
		? (particleNum = 8e5)
		: 8e5 === particleNum
		? (particleNum = 12e5)
		: 12e5 === particleNum
		? (particleNum = 2e5)
		: 2e5 === particleNum && (particleNum = 4e5),
		(dom_dashboard.innerHTML = "Please wait..."),
		(dom_particleNum.innerHTML = particleNum),
		setTimeout(() => {
			initSketch();
		}, 10);
}
function mod_exposure_mode() {
	10 === maxFrames
		? (maxFrames = 20)
		: 20 === maxFrames
		? (maxFrames = 30)
		: 30 === maxFrames && (maxFrames = 10),
		(dom_dashboard.innerHTML = "Please wait..."),
		(dom_frameNum.innerHTML = `${maxFrames} Frames`),
		setTimeout(() => {
			initSketch();
		}, 10);
}
function mod_dpi_mode() {
	1 === dpi_val
		? (dpi_val = 2)
		: 2 === dpi_val
		? (dpi_val = 3)
		: 3 === dpi_val
		? (dpi_val = 4)
		: 4 === dpi_val
		? (dpi_val = 5)
		: 5 === dpi_val && (dpi_val = 1),
		(dom_dashboard.innerHTML = "Please wait..."),
		(dom_dpi.innerHTML = dpi_val),
		setTimeout(() => {
			initSketch();
		}, 10);
}
