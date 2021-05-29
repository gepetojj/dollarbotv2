import pino from "pino";
import config from "../config";

const Logger = pino({
	level: config.dev ? "debug" : "error",
	prettyPrint: {
		levelFirst: true,
		colorize: true,
	},
});

export { Logger };
