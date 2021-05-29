import Discord from "discord.js";
import { FirebaseGuildRepository } from "../repositories";
import { Logger } from "../loaders";
import { IBotCommand } from "./IBotCommand";
import { CommandErrorsEmbed } from "../templates";

export default class DollarsCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "set";
		this.syntax = "set";
		this.arguments = true;
		this.guildOnly = true;
		this.description = "Sincroniza o servidor com o banco de dados.";
		this.cooldown = 10000;
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

		const firstEmbed = new Discord.MessageEmbed()
			.setColor("#0079DB")
			.setTitle("Sincronizando")
			.addField("Carregando...", "Carregando...");
		const messageSended = await message.reply(firstEmbed);

		const embed = new Discord.MessageEmbed()
			.setColor("#0079DB")
			.setTitle("Sincronização")
			.setFooter(
				`Comando executado por: ${message.author.tag}`,
				message.author.avatarURL()
			);

		try {
			const guildRepository = new FirebaseGuildRepository();
			if (args[0] === "adminrole") {
				if (!args[1]) {
					const errorEmbed = new CommandErrorsEmbed()
						.generate(message)
						.addField(
							"Causa do erro:",
							"Marque o cargo, usando o @"
						)
						.addField("Uso do comando:", `>${this.syntax}`);
					message.channel.stopTyping(true);
					await messageSended.edit(errorEmbed);
				}

				if (args[1].startsWith("<@") && args[1].endsWith(">")) {
					const adminRoleId = args[1].slice(3, -1);

					guildRepository
						.changeGuildAdminRole(message.guild.id, adminRoleId)
						.then(async () => {
							message.channel.stopTyping(true);
							await messageSended.edit(
								embed.addField(
									"Sucesso!",
									"Cargo alterado com sucesso."
								)
							);
						})
						.catch(async (error) => {
							const errorEmbed = new CommandErrorsEmbed()
								.generate(message)
								.addField("Causa do erro:", error);
							message.channel.stopTyping(true);
							await messageSended.edit(errorEmbed);
						});
				} else {
					const errorEmbed = new CommandErrorsEmbed()
						.generate(message)
						.addField(
							"Causa do erro:",
							"Marque o cargo, usando o @"
						)
						.addField("Uso do comando:", `>${this.syntax}`);
					message.channel.stopTyping(true);
					await messageSended.edit(errorEmbed);
				}
			}
		} catch (err) {
			Logger.error(
				`error while attempting to send dollars message: ${err.message}`
			);
			Logger.debug(
				`guild where this error happened: ${message.guild.id}`
			);
			Logger.debug(
				`message sender: ${message.author.id} / ${message.author.tag}`
			);
			message.channel.stopTyping(true);
			await messageSended.delete();
		}
	}
}
