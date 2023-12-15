function weighted_choice(data) {
	let total = 0;
	for (let i = 0; i < data.length; ++i) {
		total += data[i][1];
	}
	const threshold = rand() * total;
	total = 0;
	for (let i = 0; i < data.length - 1; ++i) {
		total += data[i][1];
		if (total >= threshold) {
			return data[i][0];
		}
	}
	return data[data.length - 1][0];
}

let mapValue = (v, s, S, a, b) => (
	(v = Math.min(Math.max(v, s), S)), ((v - s) * (b - a)) / (S - s) + a
);
const pmap = (v, cl, cm, tl, th, c) =>
	c
		? Math.min(Math.max(((v - cl) / (cm - cl)) * (th - tl) + tl, tl), th)
		: ((v - cl) / (cm - cl)) * (th - tl) + tl;

let clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
let smoothstep = (a, b, x) =>
	((x -= a), (x /= b - a)) < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
let mix = (a, b, p) => a + p * (b - a);
let dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

let R = (a = 1) => Math.random() * a;
let L = (x, y) => (x * x + y * y) ** 0.5; // Elements by Euclid 300 BC
let k = (a, b) => (a > 0 && b > 0 ? L(a, b) : a > b ? a : b);

let dpi = (maxDPI = 3.0) => {
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

	// check if the page is loaded on a mobile device
	// not just iOS, Android as well

	if (window.screen.width < 800 || window.screen.height < 800) {
		let mobileDPI = maxDPI * 2;
		if (mobileDPI > 6) {
			mobileDPI = 6;
		}
		return mobileDPI;
	} else {
		return maxDPI;
	}
};
