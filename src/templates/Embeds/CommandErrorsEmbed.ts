import Discord from "discord.js";
import { IEmbedTemplate } from "./IEmbedTemplate";

export class CommandErrorsEmbed implements IEmbedTemplate {
	generate(message: Discord.Message): Discord.MessageEmbed {
		const commandErrorsEmbed = new Discord.MessageEmbed()
			.setColor("#e43d40")
			.setTitle("Houve um erro")
			.setFooter(
				`Comando executado por: ${message.author.tag}`,
				message.author.avatarURL()
			);

		return commandErrorsEmbed;
	}
}
