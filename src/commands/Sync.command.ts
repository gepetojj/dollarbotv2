import Discord from "discord.js";

import config from "../config";
import { FirebaseWalletRepository } from "../repositories";
import { Logger } from "../loaders";
import { IBotCommand } from "./IBotCommand";
import { CommandErrorsEmbed } from "../templates";

export default class SyncCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "sync";
		this.syntax = "sync";
		this.arguments = false;
		this.guildOnly = true;
		this.description = "Sincroniza o usuário com o banco de dados.";
		this.cooldown = 10000;
	}

	async command(message: Discord.Message) {
		message.channel.startTyping();

		const firstEmbed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Sincronizando")
			.addField("Carregando...", "Carregando...");
		const messageSended = await message.reply(firstEmbed);

		try {
			const walletProvider = new FirebaseWalletRepository();

			return walletProvider
				.createUserWallet({
					id: message.author.id,
					tag: message.author.tag,
					username: message.author.username,
					wallet: {
						dollars: 0,
						history: {
							lastTimeChanged: 0,
							activity: [],
						},
					},
				})
				.then(async () => {
					const embed = new Discord.MessageEmbed()
						.setColor(config.primaryColor)
						.setTitle("Sincronização")
						.addField(
							"Sucesso!",
							"Usuário sincronizado com sucesso."
						)
						.setFooter(
							`Comando executado por: ${message.author.tag}`,
							message.author.avatarURL()
						);
					message.channel.stopTyping(true);
					await messageSended.edit(embed);
				})
				.catch(async (error) => {
					const errorEmbed = new CommandErrorsEmbed()
						.generate(message)
						.addField("Causa do erro:", error);

					message.channel.stopTyping(true);
					await messageSended.edit(errorEmbed);
				});
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
