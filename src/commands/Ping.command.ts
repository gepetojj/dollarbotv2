import Discord from "discord.js";
import { IBotCommand } from "./IBotCommand";
import { dayjs } from "../loaders/index";
import config from "../config";

export default class PingCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "ping";
		this.syntax = "ping";
		this.arguments = false;
		this.guildOnly = false;
		this.description = "Informa a latência do bot.";
	}

	async command(message: Discord.Message) {
		const messageSendedAt = message.createdTimestamp;
		const nowInTimestamp = dayjs().valueOf();
		const latency = dayjs(nowInTimestamp - messageSendedAt)
			.tz()
			.format("SSS");

		const embed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Teste de latência.")
			.addField("Latência do bot", `${latency}ms`)
			.setFooter(
				`Comando executado por: ${message.author.tag}`,
				message.author.avatarURL()
			);

		await message.reply(embed);
	}
}
