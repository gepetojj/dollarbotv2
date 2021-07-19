import Discord from "discord.js";
import config from "../config";
import {
	FirebaseGuildRepository,
	FirebaseWalletRepository,
} from "../repositories";
import { Logger } from "../loaders";
import { IBotCommand } from "./IBotCommand";
import { CommandErrorsEmbed } from "../templates";

export default class SetCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "set";
		this.syntax = "set {opção} {opcional: argumentos extras}";
		this.arguments = true;
		this.guildOnly = true;
		this.description = "Sincroniza o servidor com o banco de dados.";
		this.cooldown = 7000;
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
			.setColor(config.primaryColor)
			.setTitle("Sincronizando")
			.addField("Carregando...", "Carregando...");
		const messageSended = await message.reply(firstEmbed);

		const embed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Sincronização")
			.setFooter(
				`Comando executado por: ${message.author.tag}`,
				message.author.avatarURL()
			);

		const firebaseWalletRepository = new FirebaseWalletRepository();

		try {
			const guildRepository = new FirebaseGuildRepository();
			switch (args[0]) {
				default:
					message.channel.stopTyping(true);
					const errorEmbed = new CommandErrorsEmbed()
						.generate(message)
						.addField("Causa do erro:", "Parâmetro inválido.")
						.addField("Uso do comando:", `>${this.syntax}`);
					await messageSended.edit(errorEmbed);
					return;

				case "dev":
					if (!args[1]) {
						message.channel.stopTyping(true);
						const errorEmbed = new CommandErrorsEmbed()
							.generate(message)
							.addField("Causa do erro:", "Opção inválida.")
							.addField("Uso do comando:", `>${this.syntax}`);
						await messageSended.edit(errorEmbed);
						return;
					}
					if (!config.dev) {
						message.channel.stopTyping(true);
						const errorEmbed = new CommandErrorsEmbed()
							.generate(message)
							.addField("Causa do erro:", "Ambiente inválido.");
						await messageSended.edit(errorEmbed);
						return;
					}
					if (args[1] === "database") {
						return guildRepository
							.createGuild({
								id: "695379320167989258",
								dbPublicChannelId: "854768086023667782",
								dbAdminChannelId: "854768111667249212",
								adminRoleId: "",
							})
							.then(async () => {
								message.channel.stopTyping(true);
								await messageSended.edit(
									embed.addField(
										"Sucesso!",
										"Canal para desenvolvimento adicionado."
									)
								);
							})
							.catch(async () => {
								message.channel.stopTyping(true);
								const errorEmbed = new CommandErrorsEmbed()
									.generate(message)
									.addField(
										"Causa do erro:",
										"Não foi possível criar o canal."
									);
								await messageSended.edit(errorEmbed);
							});
					} else {
						const errorEmbed = new CommandErrorsEmbed()
							.generate(message)
							.addField("Causa do erro:", "Opção inválida.")
							.addField("Uso do comando:", `>${this.syntax}`);
						message.channel.stopTyping(true);
						await messageSended.edit(errorEmbed);
						return;
					}

				case "adminrole":
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
						return;
					}

					if (args[1].startsWith("<@") && args[1].endsWith(">")) {
						const adminRoleId = args[1].slice(3, -1);

						return guildRepository
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
						return;
					}

				case "wallet":
					const operation = args[1];
					const amount = args[2];
					const user = args[3];

					if (!operation || !amount || !user) {
						const errorEmbed = new CommandErrorsEmbed()
							.generate(message)
							.addField(
								"Causa do erro:",
								"Operação, quantidade ou usuário inválido."
							)
							.addField("Uso do comando:", `>${this.syntax}`);
						message.channel.stopTyping(true);
						await messageSended.edit(errorEmbed);
						return;
					}

					if (!["add", "sub"].includes(operation)) {
						const errorEmbed = new CommandErrorsEmbed()
							.generate(message)
							.addField("Causa do erro:", "Operação inválida.")
							.addField(
								"Opções válidas:",
								"add (Adicionar) | sub (Subtrair)"
							);
						message.channel.stopTyping(true);
						await messageSended.edit(errorEmbed);
						return;
					}

					const amountToNumber = Number(amount);
					if (!amountToNumber) {
						const errorEmbed = new CommandErrorsEmbed()
							.generate(message)
							.addField("Causa do erro:", "Quantidade inválida.");
						message.channel.stopTyping(true);
						await messageSended.edit(errorEmbed);
						return;
					}

					if (user.startsWith("<@") && user.endsWith(">")) {
						const userId = user.slice(3, -1);
						if (operation === "add") {
							await firebaseWalletRepository.addUserWallet(
								userId,
								amountToNumber,
								"Adicionado pelo administrador"
							);
							await messageSended.edit(
								embed.addField(
									"Sucesso!",
									"Operação concluída com sucesso."
								)
							);
							return;
						} else {
							await firebaseWalletRepository.subtractUserWallet(
								userId,
								amountToNumber,
								"Removido pelo administrador"
							);
							await messageSended.edit(
								embed.addField(
									"Sucesso!",
									"Operação concluída com sucesso."
								)
							);
							return;
						}
					} else {
						const errorEmbed = new CommandErrorsEmbed()
							.generate(message)
							.addField(
								"Causa do erro:",
								"Usuário inválido, marque usando @."
							);
						message.channel.stopTyping(true);
						await messageSended.edit(errorEmbed);
						return;
					}
			}
		} catch (err) {
			Logger.error(
				`error while attempting to send set command: ${err.message}`
			);
			Logger.debug(
				`guild where this error happened: ${message.guild.id}`
			);
			Logger.debug(
				`message sender: ${message.author.id} / ${message.author.tag}`
			);
			const errorEmbed = new CommandErrorsEmbed()
				.generate(message)
				.addField("Causa do erro:", "Erro desconhecido.");
			message.channel.stopTyping(true);
			await messageSended.edit(errorEmbed);
		}
	}
}
