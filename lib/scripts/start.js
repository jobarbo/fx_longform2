/**
 * Starts webpack-dev-server for local development with live reload.
 * Opens the project directly at http://localhost:3301 (no fxlens wrapper).
 */

const chalk = require("chalk");
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const open = require("open");

const env = require("../config/env");
const webpackConfig = require("../config/webpack.config.dev");

const logger = {
	error: chalk.red.bold,
	success: chalk.green.bold,
	url: chalk.bold.blue,
};

function padn(n, len = 2, char = "0") {
	return n.toString().padStart(len, char);
}

(async () => {
	const URL_PROJECT = `http://localhost:${env.PORT_PROJECT}`;

	const compiler = Webpack({
		...webpackConfig,
		infrastructureLogging: {
			level: "error",
		},
		stats: "errors-only",
	});
	const server = new WebpackDevServer(webpackConfig.devServer, compiler);

	compiler.hooks.done.tap("project", (stats) => {
		const hasErrors = stats.hasErrors();
		if (hasErrors) {
			console.log(logger.error("[project] compilation has failed"));
		} else {
			const date = new Date();
			const time = `${padn(date.getHours())}:${padn(date.getMinutes())}:${padn(date.getSeconds())}`;
			console.log(`${logger.success("[project] compiled successfully")} @ ${time}`);
		}
	});

	server.startCallback(() => {
		console.log(`${logger.success("[project] your project is running on")} ${logger.url(URL_PROJECT)}`);
		console.log();
		open(URL_PROJECT).catch(() => {});
	});
})();
