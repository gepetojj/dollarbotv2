import Discord from "discord.js";
import config from "../../config";
import { IEmbedTemplate } from "./IEmbedTemplate";

export class AdminSettingsEmbed implements IEmbedTemplate {
	generate(guildOwner: Discord.User, step: number): Discord.MessageEmbed {
		const adminSettings = new Discord.MessageEmbed();
		switch (step) {
			case 1:
				adminSettings
					.setColor(config.primaryColor)
					.setTitle("Olá, administradores!")
					.setDescription(
						"Este canal deve ser exclusivo para vocês, então vamos fazer isso acontecer."
					)
					.addField(
						"Defina um cargo que possa alterar minhas configurações. (Pode ser mais de um)",
						"Envie: `>set adminrole @cargoescolhido`"
					)
					.addField(
						"Configure este canal para que só vocês vejam.",
						"Clique na engrenagem ao lado do canal, vá em permissões, clique em permissões avançadas, adicione os cargos que podem ver este canal, e bloqueie os que não podem."
					)
					.addField(
						"Após que finalizar estes passos",
						"Clique no emoji de confirmação nesta mensagem."
					)
					.setFooter(
						"Desenvolvido por Gepetojj#2460",
						guildOwner.avatarURL()
					);
				break;

			case 2:
				adminSettings
					.setColor(config.primaryColor)
					.setTitle("Primeira etapa concluída!")
					.setDescription(
						"Minha configuração está chegando ao fim, falta pouco."
					)
					.addField(
						"Atualize minha lista de usuários.",
						"Se seu servidor tem 100 membros ou menos, eu já fiz isso. Mas se não, você pode ativar a sincronização a cada usuário que entrar futuramente. Envie: `>set sync active`"
					)
					.addField(
						"Mude o meu prefix.",
						"Prefix é o símbolo usado para me chamar (padrão: `>`), você pode mudar ele. Envie: `>set prefix simboloescolhido`"
					)
					.addField(
						"Pronto!",
						"Estou configurado, clique na próxima confirmação para fechar."
					)
					.setFooter(
						"Desenvolvido por Gepetojj#2460",
						guildOwner.avatarURL()
					);
				break;
		}
		return adminSettings;
	}
}
