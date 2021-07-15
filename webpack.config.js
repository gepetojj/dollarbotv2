const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const NodeExternals = require("webpack-node-externals");
const Dotenv = require("dotenv-webpack");

module.exports = {
	target: "node",
	mode: "production",
	entry: {
		main: "./src/main.ts",
	},
	plugins: [new NodePolyfillPlugin(), new Dotenv()],
	output: {
		path: path.resolve(__dirname, "./build"),
		filename: "bundle.js",
	},
	externals: [NodeExternals()],
	resolve: {
		extensions: [".ts", ".js"],
		fallback: {
			fs: false,
			tls: false,
			net: false,
			path: false,
			zlib: false,
			http: false,
			https: false,
			stream: false,
			crypto: false,
		},
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				loader: "ts-loader",
			},
		],
	},
};
