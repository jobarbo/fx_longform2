/**
 * Project palettes — named hex-color arrays consumed by ChromaPalette.
 *
 * Paste arrays generated on https://obumbratta.com/colour as `colors`.
 * Per-palette overrides: mode ("oklch" | "oklab" | "lch" | "lab" | "hsl" | "rgb" | "lrgb"),
 * steps (gradient resolution), discrete: true (use colors as-is, no resampling).
 *
 * NOTE: the fxrand palette pick maps each hash to an index in the sorted name
 * list — adding, removing or renaming a palette remaps every hash's palette.
 * Freeze this file at mint time.
 */
window.PROJECT_PALETTES = {
	defaults: {mode: "oklch", steps: 12},
	palettes: {
		// Converted from the legacy PNG swatches (middle-row anchors, same names)
		forest: {colors: ["#011300", "#011e08", "#012e1a", "#00412f", "#005342", "#006a57", "#007d68", "#298c76", "#838975", "#d27a6d", "#f77e66", "#ff9960", "#ffb659", "#fecf56", "#fde970", "#f8fb9e"]},
		frost: {colors: ["#010005", "#030111", "#05031e", "#070830", "#0c154a", "#142567", "#193d82", "#1b5f9c", "#1d85b8", "#1da7cf", "#26c5df", "#33e2eb", "#4ef0ea", "#60f5e2", "#85f7e0", "#9df8e1"]},
		lagoon: {colors: ["#010a1c", "#010d27", "#021037", "#02164b", "#02205f", "#002d6c", "#003a76", "#00487f", "#005889", "#006892", "#00799b", "#0089a3", "#0098ab", "#04aeb7", "#04c8c3", "#03e6d3"]},
		mountain: {
			colors: ["#011300", "#011c08", "#01291a", "#00382f", "#004545", "#00515c", "#005973", "#005e8b", "#1764a2", "#3369bd", "#4e6cd8", "#6877ed", "#7b88fb", "#8e9dff", "#a3b5ff", "#c5dbff"],
		},
		rocket: {colors: ["#00111a", "#01242c", "#044045", "#085c44", "#127437", "#7aa214", "#b2ca2c", "#d0d94a", "#dbdb70"]},
		september: {colors: ["#0a171a", "#111c25", "#1b2738", "#263851", "#314a6c", "#475178", "#555077", "#6d5775", "#8b5a6d", "#ad6c75", "#e87a72", "#e89278", "#e99c7e", "#ebb98e", "#f3d3a5"]},
		smog: {colors: ["#022435", "#1d2c37", "#333239", "#48393a", "#5d403a", "#73453a", "#884b38", "#9e4e35", "#b45330", "#cc572a", "#e35b21", "#fb5e0d"]},
		sunset: {colors: ["#000a0f", "#001b29", "#003551", "#254673", "#82508e", "#ba5796", "#ff685b", "#ff9430", "#ffbb37", "#ffdd80"]},
		twilight: {
			colors: ["#010a1c", "#070a27", "#130538", "#1f004d", "#2a0062", "#310a72", "#341d7d", "#362e8a", "#353f98", "#3051a8", "#2662b8", "#1274c7", "#0089d4", "#00a3db", "#00c0de", "#00e5df"],
		},
		wildfire: {colors: ["#01001c", "#090334", "#1c0846", "#421060", "#701972", "#a21d5f", "#c21a41", "#d73629", "#ec6a26", "#f4a454", "#f4cd85", "#f4e1a1"]},

		// obumbratta.com/colour arrays
		"dawn-ember": {colors: ["#040038", "#071255", "#082674", "#053c93", "#4351bc", "#8965e1", "#cf7af8", "#ff8ee6", "#ffb1ab", "#ffdeaa", "#ffffe0"]},
	},
};
