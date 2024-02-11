const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./project/src/index.js",
	output: {
		path: path.resolve(__dirname, "../../dist"),
		filename: "bundle.js",
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},

	// do not minify js code
	optimization: {
		minimize: false,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./project/public/index.html",
			inject: "body",
			publicPath: "./",
			minify: false,
		}),
	],
};
