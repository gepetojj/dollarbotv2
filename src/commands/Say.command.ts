import Discord from "discord.js";

import config from "../config";
import { dayjs } from "../loaders";
import { IBotCommand } from "./IBotCommand";
import { CommandErrorsEmbed } from "../templates";

export default class SayCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "say";
		this.syntax = "say {opcional: -s} {mensagem}";
		this.arguments = true;
		this.guildOnly = true;
		this.description = "Fala a frase pedida.";
	}

	async command(message: Discord.Message, args: string[]) {
		message.channel.startTyping();

		if (
			!message.guild
				.member(message.author)
				.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)
		) {
			const errorEmbed = new CommandErrorsEmbed()
				.generate(message)
				.addField(
					"Causa do erro:",
					"Você não tem permissões para isso."
				);
			message.channel.stopTyping(true);
			await message.reply(errorEmbed);
		}

		let messageToSay = "";
		let silent = false;
		const silentAllowedTo = ["519530063583248389", "830829009029562398"];

		if (args[0] === "-s" && silentAllowedTo.includes(message.author.id)) {
			silent = true;
		}
		for (let word = 0; word < args.length; word++) {
			if (args[word] !== "-s") {
				messageToSay += `${args[word]} `;
			}
		}

		const embed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Mensagem:")
			.setDescription(messageToSay);

		if (!silent) {
			embed.setFooter(
				`Enviada por ${message.author.username}, as ${dayjs().format(
					"hh:mm:ssa"
				)}`,
				message.author.avatarURL()
			);
		} else {
			embed.setFooter(`Enviada as: ${dayjs().tz().format("hh:mm:ssa")}`);
		}

		message.channel.stopTyping(true);
		await message.delete();
		await message.channel.send(embed);
	}
}
