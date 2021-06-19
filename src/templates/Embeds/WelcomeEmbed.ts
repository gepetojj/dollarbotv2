import Discord from "discord.js";
import { IEmbedTemplate } from "./IEmbedTemplate";

export class WelcomeEmbed implements IEmbedTemplate {
	generate(guildOwner: Discord.User): Discord.MessageEmbed {
		const welcomeEmbed = new Discord.MessageEmbed()
			.setColor("#0079DB")
			.setTitle("O dollarbot foi adicionado em seu servidor.")
			.setDescription(
				`Obrigado ${guildOwner.username}. Irei ser configurado automaticamente e já começar a funcionar!`
			)
			.addField(
				"Não exclua o meu canal.",
				"Eu crio um canal automaticamente quando entro em seu servidor, não o exclua. Uso ele para informar a variação do dólar."
			)
			.addField(
				"Me configure!",
				"Sou altamente configurável, não tenha medo de me mudar para as suas configurações preferidas."
			)
			.setFooter(
				"Desenvolvido por Gepetojj#2460",
				guildOwner.avatarURL()
			);

		return welcomeEmbed;
	}
}
