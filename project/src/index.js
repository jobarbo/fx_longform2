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

	// ---- Custom palette creation (persisted in localStorage, merged by sketch.js) ----
	const USER_PALETTES_KEY = "fx_longform2:userPalettes";

	function readUserPalettes() {
		try {
			return JSON.parse(localStorage.getItem(USER_PALETTES_KEY)) || {};
		} catch {
			return {};
		}
	}

	function writeUserPalettes(map) {
		localStorage.setItem(USER_PALETTES_KEY, JSON.stringify(map));
	}

	// Accepts a pasted JS/JSON array (obumbratta style), or hexes separated by
	// commas / spaces / newlines, with or without leading '#'
	function parseColorsInput(text) {
		const tokens = String(text)
			.replace(/[\[\]{}'"`]/g, " ")
			.split(/[\s,;]+/)
			.filter(Boolean);
		const colors = [];
		const invalid = [];
		for (const token of tokens) {
			const candidate = token.startsWith("#") ? token : `#${token}`;
			if (window.chroma && window.chroma.valid(candidate)) {
				colors.push(window.chroma(candidate).hex());
			} else {
				invalid.push(token);
			}
		}
		return {colors, invalid};
	}

	function paletteCodeSnippet(name, def) {
		const colorList = def.colors.map((c) => `"${c}"`).join(", ");
		const extras = [];
		if (def.mode && def.mode !== "oklch") extras.push(`mode: "${def.mode}"`);
		if (def.steps && def.steps !== 256) extras.push(`steps: ${def.steps}`);
		if (def.discrete) extras.push("discrete: true");
		const extraStr = extras.length ? `, ${extras.join(", ")}` : "";
		return `"${name}": { colors: [${colorList}]${extraStr} },`;
	}

	function initPaletteCreator(p, selPalette, paletteOptionsApi) {
		const form = document.querySelector(".controls-form");
		if (!form) return;

		const fieldset = document.createElement("fieldset");
		fieldset.className = "palette-creator";

		const legend = document.createElement("legend");
		legend.textContent = "Custom palette generator";
		fieldset.appendChild(legend);

		const palettePreview = document.createElement("div");
		palettePreview.className = "palette-preview";
		fieldset.appendChild(palettePreview);

		function updatePreview() {
			const manager = window.paletteManager;
			if (!manager || !(selPalette instanceof HTMLSelectElement)) return;
			const name = selPalette.value === "(random)" ? p.current.paletteName : selPalette.value;
			const hexes = name ? manager.getHexPalette(name) : null;
			if (!hexes || hexes.length === 0) {
				palettePreview.style.background = "";
				return;
			}
			// Downsample to <=32 stops so the CSS gradient stays light
			const step = Math.max(1, Math.floor(hexes.length / 32));
			const stops = hexes.filter((_, i) => i % step === 0);
			if (stops[stops.length - 1] !== hexes[hexes.length - 1]) stops.push(hexes[hexes.length - 1]);
			const discrete = manager.getConfig(name)?.discrete;
			if (discrete) {
				const bandWidth = 100 / stops.length;
				const bands = stops.map((c, i) => `${c} ${i * bandWidth}% ${(i + 1) * bandWidth}%`);
				palettePreview.style.background = `linear-gradient(to right, ${bands.join(", ")})`;
			} else {
				palettePreview.style.background = `linear-gradient(to right, ${stops.join(", ")})`;
			}
		}

		if (selPalette instanceof HTMLSelectElement) {
			selPalette.addEventListener("change", updatePreview);
		}

		const nameInput = document.createElement("input");
		nameInput.type = "text";
		nameInput.placeholder = "palette name";

		const colorsInput = document.createElement("textarea");
		colorsInput.rows = 3;
		colorsInput.placeholder = "['#ffffe0', '#ffebb9', …] or ffcfa2 ffb1ab …";

		const modeSelect = document.createElement("select");
		const modes = Array.isArray(p.options.paletteModes) ? p.options.paletteModes : ["oklch", "oklab", "lch", "lab", "hsl", "rgb", "lrgb"];
		for (const mode of modes) ensureOption(modeSelect, mode, mode);

		const stepsInput = document.createElement("input");
		stepsInput.type = "number";
		stepsInput.min = "2";
		stepsInput.max = "1024";
		stepsInput.value = "256";
		stepsInput.title = "gradient steps";

		const discreteLabel = document.createElement("label");
		discreteLabel.className = "palette-discrete-label";
		const discreteInput = document.createElement("input");
		discreteInput.type = "checkbox";
		discreteLabel.append(discreteInput, document.createTextNode("discrete (no interpolation)"));

		const configRow = document.createElement("div");
		configRow.className = "palette-config-row";
		configRow.append(modeSelect, stepsInput, discreteLabel);

		const status = document.createElement("div");
		status.className = "palette-status";

		const buttonRow = document.createElement("div");
		buttonRow.className = "palette-actions";
		const makeButton = (label, variant) => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = variant ? `button ${variant}` : "button";
			const span = document.createElement("span");
			span.textContent = label;
			btn.appendChild(span);
			buttonRow.appendChild(btn);
			return btn;
		};
		const btnSave = makeButton("Save", "btn-save");
		const btnDelete = makeButton("Delete", "btn-delete");
		const btnCopy = makeButton("Copy as code");

		fieldset.append(nameInput, colorsInput, configRow, buttonRow, status);
		form.appendChild(fieldset);

		const setCreatorStatus = (msg, isError = false) => {
			status.textContent = msg;
			status.classList.toggle("is-error", isError);
		};

		const selectedLocalName = () => {
			if (!(selPalette instanceof HTMLSelectElement)) return null;
			const name = selPalette.value;
			return paletteOptionsApi.getLocalNames().includes(name) ? name : null;
		};

		btnSave.addEventListener("click", () => {
			const manager = window.paletteManager;
			if (!manager) {
				setCreatorStatus("sketch not ready yet", true);
				return;
			}
			const name = nameInput.value.trim();
			if (!name) {
				setCreatorStatus("give the palette a name", true);
				return;
			}
			if (manager.getConfig(name)?.source === "file") {
				setCreatorStatus(`'${name}' already exists as a file palette`, true);
				return;
			}
			const {colors, invalid} = parseColorsInput(colorsInput.value);
			if (invalid.length > 0) {
				setCreatorStatus(`invalid colors: ${invalid.join(", ")}`, true);
				return;
			}
			if (colors.length < 2) {
				setCreatorStatus("need at least 2 colors", true);
				return;
			}
			const steps = Math.max(2, Math.min(1024, parseInt(stepsInput.value, 10) || 256));
			const def = {colors, mode: modeSelect.value, steps, discrete: discreteInput.checked, createdAt: Date.now()};

			try {
				manager.addPalette(name, def, {source: "local"});
			} catch (error) {
				setCreatorStatus(error.message, true);
				return;
			}
			const stored = readUserPalettes();
			stored[name] = def;
			writeUserPalettes(stored);

			const localNames = [...new Set([...paletteOptionsApi.getLocalNames(), name])].sort();
			paletteOptionsApi.setLocalNames(localNames);
			paletteOptionsApi.renderPaletteOptions(name);
			setCreatorStatus(`saved '${name}' — pick it and Apply`);
		});

		btnDelete.addEventListener("click", () => {
			const manager = window.paletteManager;
			const name = selectedLocalName();
			if (!name) {
				setCreatorStatus("select a local palette to delete", true);
				return;
			}
			manager?.removePalette(name);
			const stored = readUserPalettes();
			delete stored[name];
			writeUserPalettes(stored);

			paletteOptionsApi.setLocalNames(paletteOptionsApi.getLocalNames().filter((n) => n !== name));
			if (p.current.paletteName === name) p.current.paletteName = "";
			paletteOptionsApi.renderPaletteOptions("(random)");
			setCreatorStatus(`deleted '${name}'`);
		});

		btnCopy.addEventListener("click", async () => {
			const manager = window.paletteManager;
			const name = selectedLocalName() ?? (selPalette instanceof HTMLSelectElement && selPalette.value !== "(random)" ? selPalette.value : null);
			const config = name ? manager?.getConfig(name) : null;
			if (!config) {
				setCreatorStatus("select a palette to copy", true);
				return;
			}
			try {
				await navigator.clipboard.writeText(paletteCodeSnippet(name, config));
				setCreatorStatus(`copied '${name}' snippet for palettes.js`);
			} catch {
				setCreatorStatus("clipboard unavailable", true);
			}
		});

		return {updatePreview};
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
			// Set initial label
			toggle.textContent = "Edit parameters";
			toggle.addEventListener("click", () => {
				const isOpen = container.classList.toggle("show");
				toggle.textContent = isOpen ? "Close tab" : "Edit parameters";
			});
		}

		const form = document.querySelector(".controls-form");
		if (!form) return;

		// Build controls from PARAMS_UI.ui metadata
		const controls = {};
		const uiDefs = Array.isArray(p.ui) ? p.ui : [];

		for (const def of uiDefs) {
			const key = def.key;
			if (!key) continue;

			const selectId = def.id || `param-${key}`;
			const labelText = def.label || key;

			const row = document.createElement("label");
			row.className = "select-row";

			const span = document.createElement("span");
			span.textContent = labelText;

			const select = document.createElement("select");
			select.id = selectId;

			row.appendChild(span);
			row.appendChild(select);
			form.appendChild(row);

			controls[key] = select;

			// Populate options
			const optionsKey = def.optionsKey;
			if (key === "paletteName") {
				// Palette starts with a synthetic random option; real palettes come from swatches:ready.
				fillSelect(select, ["(random)"]);
			} else if (optionsKey && Array.isArray(p.options[optionsKey])) {
				const values = p.options[optionsKey];
				let formatter;
				if (key === "population") {
					formatter = formatPopulation;
				} else if (key === "horizontalSpeed" || key === "verticalSpeed") {
					formatter = (val) =>
						String(val)
							.replace(/([A-Z])/g, " $1")
							.toLowerCase();
				}
				fillSelect(select, values, {formatter});
			}

			// Initial value from PARAMS_UI.current
			const currentValue = p.current[key];
			if (key === "paletteName") {
				if (currentValue) {
					setSelectValue(select, currentValue);
				} else {
					setSelectValue(select, "(random)");
				}
			} else if (currentValue !== undefined) {
				setSelectValue(select, currentValue);
			}
		}

		const selPresentation = controls.presentation;
		const selPalette = controls.paletteName;

		const btnApply = document.getElementById("param-apply");
		const btnDownload = document.getElementById("param-download");

		if (!btnApply) return;

		if (selPresentation instanceof HTMLSelectElement) {
			selPresentation.addEventListener("change", () => {
				p.current.presentation = selPresentation.value;
				applyPresentation(p.current.presentation);
				renderDashboard();
			});
		}

		btnApply.addEventListener("click", async () => {
			setStatus(true);
			setText(".kb-params.dashboard", "rendering…");
			try {
				// Sync all control values back into PARAMS_UI.current
				for (const def of uiDefs) {
					const key = def.key;
					const select = controls[key];
					if (!(select instanceof HTMLSelectElement)) continue;

					let raw = select.value;
					if (key === "paletteName") {
						p.current.paletteName = raw === "(random)" ? "" : raw;
						continue;
					}

					const currentValue = p.current[key];
					if (typeof currentValue === "number") {
						const num = raw.includes(".") ? parseFloat(raw) : parseInt(raw, 10);
						if (!Number.isNaN(num)) {
							p.current[key] = num;
						}
					} else {
						p.current[key] = raw;
					}
				}

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

		// ---- Palette select options (file + local) ----
		let filePaletteNames = [];
		let localPaletteNames = [];
		let paletteCreator; // assigned below; exposes updatePreview() for the gradient strip

		function renderPaletteOptions(selected) {
			if (!(selPalette instanceof HTMLSelectElement)) return;
			p.options.palettes = filePaletteNames;
			selPalette.innerHTML = "";
			for (const name of filePaletteNames) ensureOption(selPalette, name, name);
			for (const name of localPaletteNames) ensureOption(selPalette, name, `${name} (local)`);
			// Keep random as last option (still available)
			ensureOption(selPalette, "(random)", "(random)");

			const target = selected || p.current.paletteName;
			if (target) {
				setSelectValue(selPalette, target);
			} else if (filePaletteNames.length > 0) {
				setSelectValue(selPalette, filePaletteNames[0]);
			}
			paletteCreator?.updatePreview();
		}

		window.addEventListener("swatches:ready", (e) => {
			const names = e?.detail?.names;
			if (!Array.isArray(names)) return;
			filePaletteNames = names;
			if (Array.isArray(e?.detail?.localNames)) localPaletteNames = e.detail.localNames;
			renderPaletteOptions(e?.detail?.selected);
		});

		paletteCreator = initPaletteCreator(p, selPalette, {
			getLocalNames: () => localPaletteNames,
			setLocalNames: (names) => {
				localPaletteNames = names;
			},
			renderPaletteOptions,
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
