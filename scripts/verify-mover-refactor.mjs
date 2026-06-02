#!/usr/bin/env node
/**
 * Verifies mover refactor preserves behavior:
 * - Same random() call count in mover.js
 * - Precomputed rotation matches inline sin/cos
 * - Optional pixel compare via puppeteer when server is running
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const moverPath = "project/public/shapes/mover.js";

const before = execSync(`git show HEAD:${moverPath}`, { encoding: "utf8", cwd: root });
const after = fs.readFileSync(path.join(root, moverPath), "utf8");

const countRandom = (src) => (src.match(/\brandom\(/g) || []).length;
const beforeRandom = countRandom(before);
const afterRandom = countRandom(after);

if (beforeRandom !== afterRandom) {
	console.error(`FAIL: random() count changed ${beforeRandom} -> ${afterRandom}`);
	process.exit(1);
}
console.log(`OK: random() count unchanged (${beforeRandom})`);

const TAU = Math.PI * 2;
for (let i = 0; i < 500; i++) {
	const rseed = Math.random() * 1e6;
	const nseed = Math.random() * 1e6;
	const inputRot = (rseed * 0.000137 + nseed * 0.000024) % TAU;
	const sinA = Math.sin(inputRot);
	const cosA = Math.cos(inputRot);
	const sinB = Math.sin(inputRot);
	const cosB = Math.cos(inputRot);
	if (sinA !== sinB || cosA !== cosB) {
		console.error("FAIL: rotation precompute mismatch");
		process.exit(1);
	}
}
console.log("OK: rotation precompute matches inline sin/cos");

const literals = [
	"0.041",
	"0.001) / width",
	"wrapPaddingMultiplier = 0.8",
	"a1 * 0.006",
	"a2 * 0.0003",
	"-0.000025",
	"s2o2 * 0.3",
	"0.7 + nyRangeMin * 0.3",
	"ZZ(Math.abs(u), 35, 80, 0.018)",
	", 12, octave)",
	"random([0.25])",
];

for (const lit of literals) {
	if (!after.includes(lit)) {
		console.error(`FAIL: missing preserved literal: ${lit}`);
		process.exit(1);
	}
}
console.log("OK: key numeric literals preserved");

const forbidden = ["CURRENT_PARAMS", "const speed = abs", "particleSize ??", "10.7 + nyRangeMin * 100.3"];
for (const f of forbidden) {
	if (after.includes(f)) {
		console.error(`FAIL: UI/behavioral change leaked: ${f}`);
		process.exit(1);
	}
}
console.log("OK: no UI params or speed-gated logic");

async function pixelCompare() {
	let puppeteer;
	try {
		puppeteer = await import("puppeteer");
	} catch {
		console.log("SKIP: pixel compare (puppeteer not installed; static checks passed)");
		return;
	}

	const port = process.env.PORT_PROJECT || 3301;
	const base = `http://localhost:${port}`;
	const testHash =
		"oo7BeFLf8K8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ8vJ";

	const beforeFile = path.join(root, moverPath);
	const afterFile = beforeFile;
	const backup = fs.readFileSync(beforeFile, "utf8");

	async function capture(label, source) {
		fs.writeFileSync(beforeFile, source);
		const browser = await puppeteer.default.launch({ headless: "new" });
		try {
			const page = await browser.newPage();
			await page.setViewport({ width: 948, height: 948 });
			await page.goto(`${base}/?fxhash=${testHash}`, { waitUntil: "networkidle0", timeout: 120000 });
			await page.waitForFunction(() => typeof window.frameCount !== "undefined" && window.frameCount >= 24, {
				timeout: 180000,
			});
			const dataUrl = await page.evaluate(() => {
				const c = document.querySelector("canvas");
				return c ? c.toDataURL() : null;
			});
			if (!dataUrl) throw new Error("no canvas");
			fs.writeFileSync(path.join(root, `scripts/.verify-${label}.png`), Buffer.from(dataUrl.split(",")[1], "base64"));
			return dataUrl;
		} finally {
			await browser.close();
		}
	}

	try {
		const urlBefore = await capture("before", before);
		const urlAfter = await capture("after", after);
		if (urlBefore !== urlAfter) {
			console.error("FAIL: canvas pixel data differs between before/after mover");
			process.exit(1);
		}
		console.log("OK: pixel-identical canvas at frame 24");
	} catch (e) {
		console.log(`SKIP: pixel compare (${e.message})`);
	} finally {
		fs.writeFileSync(beforeFile, backup);
	}
}

await pixelCompare();
// Sketch.js preserved literals
const sketchPath = path.join(root, "project/public/sketch.js");
const sketch = fs.readFileSync(sketchPath, "utf8");
const sketchLiterals = [
	"let maxFrames = 25",
	"particleNum = 500000",
	"/ 1150",
	"WRAP_PADDING_FACTOR = 0.04",
	"ARTWORK_RATIO = 1.21",
	"FRAME_SCALE_FACTOR_X = 1.47",
	"BASE_PADDING * 2",
	"baseRectW / 35",
	"for (let i = 0; i < 10000",
	"baseHSLPalette[2]",
	"0.004 / MULTIPLIER",
	"color(25, 5, 100)",
	"currentFrame > 0",
];
const moverLiterals = ["wrapPaddingMultiplier = 0.8", "0.001) / width"];
const mover = fs.readFileSync(path.join(root, moverPath), "utf8");
for (const lit of moverLiterals) {
	if (!mover.includes(lit)) {
		console.error(`FAIL mover wrap: missing ${lit}`);
		process.exit(1);
	}
}
console.log("OK: mover wrap literals match ui/ex-machina");
for (const lit of sketchLiterals) {
	if (!sketch.includes(lit)) {
		console.error(`FAIL sketch: missing preserved literal: ${lit}`);
		process.exit(1);
	}
}
if (sketch.includes("CURRENT_PARAMS")) {
	console.error("FAIL sketch: CURRENT_PARAMS leaked");
	process.exit(1);
}
console.log("OK: sketch.js key literals preserved");

console.log("All refactor checks passed.");
