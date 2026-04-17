require("dotenv").config();

function num(v, fallback) {
	var x = Number(v);
	return Number.isFinite(x) ? x : fallback;
}

var fromEnv = Object.assign({}, process.env);

module.exports = Object.assign(fromEnv, {
	PORT_PROJECT: num(fromEnv.PORT_PROJECT, 3301),
	RUN_PROJECT: fromEnv.RUN_PROJECT !== "false" && fromEnv.RUN_PROJECT !== "0",
});
