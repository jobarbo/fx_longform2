console.log(fxhash);
console.log(fxrand());

const sp = new URLSearchParams(window.location.search);
console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode} = composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters
$fx.params([
	{
		id: "shape_type",
		name: "Type of",
		type: "select",
		//default: Math.PI,
		options: {
			options: ["ellipse", "rectangle"],
		},
	},
]);
console.log($fx.getParam("shape_type"));
// this is how features can be defined
$fx.features({
	shape_type: $fx.getParam("shape_type"),
});

// log the parameters, for debugging purposes, artists won't have to do that
console.log("Current param values:");

// Added addtional transformation to the parameter for easier usage
// e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
console.log($fx.getParams());

// ============================================================================
// EXLIBRIS-style UI controller (dropdowns + Apply)
// ============================================================================

(() => {
	const getParams = () => window.PARAMS_UI;

	function formatPopulation(n) {
		if (n >= 1000000) {
			const m = n / 1000000;
			return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}m`;
		}
		if (n >= 1000) return `${Math.round(n / 1000)}k`;
		return String(n);
	}

	function setStatus(isWorking) {
		const spinner = document.querySelector(".spin-container");
		if (!spinner) return;
		if (isWorking) spinner.classList.add("active");
		else spinner.classList.remove("active");
	}

	function setText(selector, value) {
		const el = document.querySelector(selector);
		if (!el) return;
		el.textContent = value ?? "";
	}

	function ensureOption(select, value, label) {
		const opt = document.createElement("option");
		opt.value = String(value);
		opt.textContent = label ?? String(value);
		select.appendChild(opt);
	}

	function fillSelect(select, values, {formatter} = {}) {
		select.innerHTML = "";
		for (const v of values) {
			ensureOption(select, v, formatter ? formatter(v) : String(v));
		}
	}

	function setSelectValue(select, value) {
		select.value = String(value);
		if (select.value !== String(value)) {
			select.selectedIndex = 0;
		}
	}

	function applyPresentation(mode) {
		const canvas = document.querySelector("canvas.p5Canvas");
		const frame = document.querySelector(".frame");
		if (!canvas || !frame) return;

		const shouldPresent = mode === "on" || mode === "horizontal";
		const horizontal = mode === "horizontal";

		canvas.classList.toggle("presentation", shouldPresent);
		frame.classList.toggle("presentation", shouldPresent);
		canvas.classList.toggle("horizontal", horizontal);
		frame.classList.toggle("horizontal", horizontal);
	}

	function renderDashboard() {
		const p = getParams();
		if (!p) return;

		setText(".kb-params.hash", window.fxhash ?? window.$fx?.hash ?? "");
		setText(".kb-params.population", formatPopulation(p.current.population));
		setText(".kb-params.particleSize", String(p.current.particleSize));
		setText(".kb-params.palette", p.current.paletteName || "(random)");
		setText(".kb-params.dpi", String(p.current.printDPI));
		setText(".kb-params.exposure", String(p.current.exposure));
		setText(".kb-params.presentation", p.current.presentation);
		setText(".kb-params.dashboard", p.lockedSeeds ? "seed locked" : "seed unlocked");
	}

	function initUI() {
		const p = getParams();
		if (!p) return;

		const toggle = document.querySelector(".info-toggle");
		const container = document.querySelector(".container");
		if (toggle && container) {
			toggle.classList.add("show");
			toggle.addEventListener("click", () => {
				container.classList.toggle("show");
			});
		}

		const selPopulation = document.getElementById("param-population");
		const selParticleSize = document.getElementById("param-particle-size");
		const selPalette = document.getElementById("param-palette");
		const selDpi = document.getElementById("param-dpi");
		const selExposure = document.getElementById("param-exposure");
		const selPresentation = document.getElementById("param-presentation");
		const selExternalFrame = document.getElementById("param-external-frame");
		const selSwirlIndex = document.getElementById("param-swirl-index");
		const selZigzag = document.getElementById("param-zigzag");
		const selNoiseScale2 = document.getElementById("param-noise-scale-2");
		const selHorizontalSpeed = document.getElementById("param-horizontal-speed");
		const selVerticalSpeed = document.getElementById("param-vertical-speed");
		const selInnerFlow = document.getElementById("param-inner-flow");
		const selOuterFlow = document.getElementById("param-outer-flow");
		const btnApply = document.getElementById("param-apply");
		const btnDownload = document.getElementById("param-download");

		if (
			!selPopulation ||
			!selParticleSize ||
			!selPalette ||
			!selDpi ||
			!selExposure ||
			!selPresentation ||
			!selExternalFrame ||
			!selSwirlIndex ||
			!selZigzag ||
			!selNoiseScale2 ||
			!selHorizontalSpeed ||
			!selVerticalSpeed ||
			!selInnerFlow ||
			!selOuterFlow ||
			!btnApply
		)
			return;

		fillSelect(selPopulation, p.options.populations, {formatter: formatPopulation});
		fillSelect(selParticleSize, p.options.particleSizes);
		const formatSpeedLabel = (key) => key.replace(/([A-Z])/g, " $1").toLowerCase();
		fillSelect(selHorizontalSpeed, p.options.horizontalSpeeds, {formatter: formatSpeedLabel});
		fillSelect(selVerticalSpeed, p.options.verticalSpeeds, {formatter: formatSpeedLabel});
		const formatFlowLabel = (key) => key; // low / standard / medium / high already friendly
		fillSelect(selInnerFlow, p.options.innerFlowLevels, {formatter: formatFlowLabel});
		fillSelect(selOuterFlow, p.options.outerFlowLevels, {formatter: formatFlowLabel});
		fillSelect(selDpi, p.options.printDPIs);
		fillSelect(selExposure, p.options.exposures);
		fillSelect(selPresentation, p.options.presentations);
		fillSelect(selExternalFrame, p.options.externalFrame);
		fillSelect(selSwirlIndex, p.options.swirlIndex);
		fillSelect(selZigzag, p.options.zigzag);
		fillSelect(selNoiseScale2, p.options.noiseScale2);

		// Palette select is filled once swatches are ready
		fillSelect(selPalette, ["(random)"]);

		setSelectValue(selPopulation, p.current.population);
		setSelectValue(selParticleSize, p.current.particleSize);
		setSelectValue(selHorizontalSpeed, p.current.horizontalSpeed);
		setSelectValue(selVerticalSpeed, p.current.verticalSpeed);
		setSelectValue(selInnerFlow, p.current.innerFlowLevel);
		setSelectValue(selOuterFlow, p.current.outerFlowLevel);
		setSelectValue(selDpi, p.current.printDPI);
		setSelectValue(selExposure, p.current.exposure);
		setSelectValue(selPresentation, p.current.presentation);
		setSelectValue(selExternalFrame, p.current.externalFrame);
		setSelectValue(selSwirlIndex, p.current.swirlIndex);
		setSelectValue(selZigzag, p.current.zigzag);
		setSelectValue(selNoiseScale2, p.current.noiseScale2);
		if (p.current.paletteName) setSelectValue(selPalette, p.current.paletteName);

		selPresentation.addEventListener("change", () => {
			p.current.presentation = selPresentation.value;
			applyPresentation(p.current.presentation);
			renderDashboard();
		});

		btnApply.addEventListener("click", async () => {
			setStatus(true);
			setText(".kb-params.dashboard", "rendering…");
			try {
				p.current.population = parseInt(selPopulation.value, 10);
				p.current.particleSize = parseFloat(selParticleSize.value);
				p.current.printDPI = parseInt(selDpi.value, 10);
				p.current.exposure = parseInt(selExposure.value, 10);
				p.current.presentation = selPresentation.value;
				p.current.externalFrame = selExternalFrame.value;
				p.current.swirlIndex = selSwirlIndex.value;
				p.current.zigzag = selZigzag.value;
				p.current.noiseScale2 = selNoiseScale2.value;
				p.current.horizontalSpeed = selHorizontalSpeed.value;
				p.current.verticalSpeed = selVerticalSpeed.value;
				p.current.innerFlowLevel = selInnerFlow.value;
				p.current.outerFlowLevel = selOuterFlow.value;

				const paletteVal = selPalette.value;
				p.current.paletteName = paletteVal === "(random)" ? "" : paletteVal;

				// Re-resolve numeric values before notifying the sketch
				if (typeof window.resolveParams === "function") window.resolveParams();

				applyPresentation(p.current.presentation);
				renderDashboard();

				if (typeof window.applyGenerativeSettings === "function") {
					await window.applyGenerativeSettings({...p.current});
				} else {
					setText(".kb-params.dashboard", "sketch not ready");
				}
			} finally {
				// Rendering continues asynchronously; completion will flip status off.
			}
		});

		if (btnDownload) {
			btnDownload.addEventListener("click", () => {
				if (typeof window.saveArtwork === "function") {
					window.saveArtwork();
				} else {
					setText(".kb-params.dashboard", "download not ready");
				}
			});
		}

		window.addEventListener("swatches:ready", (e) => {
			const names = e?.detail?.names;
			if (!Array.isArray(names)) return;
			p.options.palettes = names;

			selPalette.innerHTML = "";
			for (const name of names) ensureOption(selPalette, name, name);
			// Keep random as last option (still available)
			ensureOption(selPalette, "(random)", "(random)");

			const selected = e?.detail?.selected || p.current.paletteName;
			if (selected) {
				setSelectValue(selPalette, selected);
			} else if (names.length > 0) {
				setSelectValue(selPalette, names[0]);
			}
		});

		// Listen to sketch lifecycle events to drive spinner + status text.
		window.addEventListener("render:started", () => {
			setStatus(true);
			setText(".kb-params.dashboard", "rendering…");
		});
		window.addEventListener("render:completed", () => {
			setStatus(false);
			setText(".kb-params.dashboard", "complete");
		});

		renderDashboard();
		applyPresentation(p.current.presentation);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initUI);
	} else {
		initUI();
	}
})();
