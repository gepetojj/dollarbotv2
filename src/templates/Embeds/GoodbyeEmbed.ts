import Discord from "discord.js";
import config from "../../config";
import { IEmbedTemplate } from "./IEmbedTemplate";

export class GoodbyeEmbed implements IEmbedTemplate {
	generate(guildOwner: Discord.User, clientId: string): Discord.MessageEmbed {
		const goodbyeEmbed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Desculpe :(")
			.setDescription(
				`Desculpe ${guildOwner.username}, se não fui um bot bom o suficiente...`
			)
			.addField(
				"Me perdoe por qualquer bug.",
				"Por favor, reporte problemas para o desenvolvedor para que possa melhorar."
			)
			.addField(
				"Eu sempre estarei aqui por você.",
				`Não se preocupe, você pode me adicionar novamente por este link: https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=8`
			)
			.setFooter(
				"Desenvolvido por Gepetojj#2460",
				guildOwner.avatarURL()
			);

		return goodbyeEmbed;
	}
}
