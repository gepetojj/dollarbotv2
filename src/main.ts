import config from "./config";
import { DiscordLoader } from "./loaders";

async function loadBot() {
	const bot = new DiscordLoader({
		richPresence: {
			options: config.richPresence.options,
			timeout: config.richPresence.timeout,
		},
	});
	await bot.load(config.token).run();
}

loadBot();
