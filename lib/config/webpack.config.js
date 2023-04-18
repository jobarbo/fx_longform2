const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
	entry: './project/src/index.js',
	output: {
		path: path.resolve(__dirname, '../../dist'),
		filename: 'bundle.js',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.js$/,
				exclude: /\/\.git\//,
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './project/public/index.html',
			inject: 'body',
			publicPath: './',
			minify: false,
		}),
		new CleanWebpackPlugin({
			cleanAfterEveryBuildPatterns: ['**/.git'],
		}),
	],
};
