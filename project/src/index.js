console.log(fxhash);
console.log(fxrand());

const sp = new URLSearchParams(window.location.search);
console.log(sp);

let composition_params;

composition_params = generate_composition_params();
//console.log(composition_params);

var {shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode} =
	composition_params; // unpacking parameters we need in main.js and turning them into globals

//console.log(shape_type, ellipse_num, line_num, rectangle_num, bg_mode, border_mode, format_mode, palette_mode, angle_mode);
// this is how to define parameters
$fx.params([
	{
		id: 'shape_type',
		name: 'Type of',
		type: 'select',
		//default: Math.PI,
		options: {
			options: ['ellipse', 'rectangle'],
		},
	},
]);
console.log($fx.getParam('shape_type'));
// this is how features can be defined
$fx.features({
	shape_type: $fx.getParam('shape_type'),
});

// log the parameters, for debugging purposes, artists won't have to do that
console.log('Current param values:');

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
		const spinner = document.querySelector('.spin-container');
		if (!spinner) return;
		if (isWorking) spinner.classList.add('active');
		else spinner.classList.remove('active');
	}

	function setText(selector, value) {
		const el = document.querySelector(selector);
		if (!el) return;
		el.textContent = value ?? '';
	}

	function ensureOption(select, value, label) {
		const opt = document.createElement('option');
		opt.value = String(value);
		opt.textContent = label ?? String(value);
		select.appendChild(opt);
	}

	function fillSelect(select, values, { formatter } = {}) {
		select.innerHTML = '';
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
		const canvas = document.querySelector('canvas.p5Canvas');
		const frame = document.querySelector('.frame');
		if (!canvas || !frame) return;

		const shouldPresent = mode === 'on' || mode === 'horizontal';
		const horizontal = mode === 'horizontal';

		canvas.classList.toggle('presentation', shouldPresent);
		frame.classList.toggle('presentation', shouldPresent);
		canvas.classList.toggle('horizontal', horizontal);
		frame.classList.toggle('horizontal', horizontal);
	}

	function renderDashboard() {
		const p = getParams();
		if (!p) return;

		setText('.kb-params.hash', window.fxhash ?? window.$fx?.hash ?? '');
		setText('.kb-params.population', formatPopulation(p.current.population));
		setText('.kb-params.particleSize', String(p.current.particleSize));
		setText('.kb-params.palette', p.current.paletteName || '(random)');
		setText('.kb-params.dpi', String(p.current.printDPI));
		setText('.kb-params.exposure', String(p.current.exposure));
		setText('.kb-params.presentation', p.current.presentation);
		setText('.kb-params.dashboard', p.lockedSeeds ? 'seed locked' : 'seed unlocked');
	}

	function initUI() {
		const p = getParams();
		if (!p) return;

		const toggle = document.querySelector('.info-toggle');
		const container = document.querySelector('.container');
		if (toggle && container) {
			toggle.classList.add('show');
			toggle.addEventListener('click', () => {
				container.classList.toggle('show');
			});
		}

		const selPopulation = document.getElementById('param-population');
		const selParticleSize = document.getElementById('param-particle-size');
		const selPalette = document.getElementById('param-palette');
		const selDpi = document.getElementById('param-dpi');
		const selExposure = document.getElementById('param-exposure');
		const selPresentation = document.getElementById('param-presentation');
		const btnApply = document.getElementById('param-apply');
		const btnDownload = document.getElementById('param-download');

		if (!selPopulation || !selParticleSize || !selPalette || !selDpi || !selExposure || !selPresentation || !btnApply) return;

		fillSelect(selPopulation, p.options.populations, { formatter: formatPopulation });
		fillSelect(selParticleSize, p.options.particleSizes);
		fillSelect(selDpi, p.options.printDPIs);
		fillSelect(selExposure, p.options.exposures);
		fillSelect(selPresentation, p.options.presentations);

		// Palette select is filled once swatches are ready
		fillSelect(selPalette, ['(random)']);

		setSelectValue(selPopulation, p.current.population);
		setSelectValue(selParticleSize, p.current.particleSize);
		setSelectValue(selDpi, p.current.printDPI);
		setSelectValue(selExposure, p.current.exposure);
		setSelectValue(selPresentation, p.current.presentation);
		if (p.current.paletteName) setSelectValue(selPalette, p.current.paletteName);

		selPresentation.addEventListener('change', () => {
			p.current.presentation = selPresentation.value;
			applyPresentation(p.current.presentation);
			renderDashboard();
		});

		btnApply.addEventListener('click', async () => {
			setStatus(true);
			try {
				p.current.population = parseInt(selPopulation.value, 10);
				p.current.particleSize = parseFloat(selParticleSize.value);
				p.current.printDPI = parseInt(selDpi.value, 10);
				p.current.exposure = parseInt(selExposure.value, 10);
				p.current.presentation = selPresentation.value;

				const paletteVal = selPalette.value;
				p.current.paletteName = paletteVal === '(random)' ? '' : paletteVal;

				applyPresentation(p.current.presentation);
				renderDashboard();

				if (typeof window.applyGenerativeSettings === 'function') {
					await window.applyGenerativeSettings({ ...p.current });
				} else {
					setText('.kb-params.dashboard', 'sketch not ready');
				}
			} finally {
				setStatus(false);
			}
		});

		if (btnDownload) {
			btnDownload.addEventListener('click', () => {
				if (typeof window.saveArtwork === 'function') {
					window.saveArtwork();
				} else {
					setText('.kb-params.dashboard', 'download not ready');
				}
			});
		}

		window.addEventListener('swatches:ready', (e) => {
			const names = e?.detail?.names;
			if (!Array.isArray(names)) return;
			p.options.palettes = names;

			selPalette.innerHTML = '';
			for (const name of names) ensureOption(selPalette, name, name);
			// Keep random as last option (still available)
			ensureOption(selPalette, '(random)', '(random)');

			const selected = e?.detail?.selected || p.current.paletteName;
			if (selected) {
				setSelectValue(selPalette, selected);
			} else if (names.length > 0) {
				setSelectValue(selPalette, names[0]);
			}
		});

		renderDashboard();
		applyPresentation(p.current.presentation);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initUI);
	} else {
		initUI();
	}
})();
