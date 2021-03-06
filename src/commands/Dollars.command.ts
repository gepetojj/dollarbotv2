import Discord from "discord.js";

import config from "../config";
import { GepetoServicesChartProvider } from "../providers";
import { FirebaseWalletRepository } from "../repositories";
import { Logger, ModernEmbedsLoader } from "../loaders";
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
		this.name = "dollars";
		this.syntax = "dollars";
		this.aliases = ["dolares", "dólares", "wallet"];
		this.arguments = false;
		this.guildOnly = false;
		this.description = "Informa o saldo do usuário.";
		this.cooldown = 5000;
	}

	async command(message: Discord.Message) {
		message.channel.startTyping();

		const firstEmbed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Seu saldo do dollarbot")
			.addField("Carregando...", "Carregando...");
		const messageSended = await message.reply(firstEmbed);

		const embed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Seu saldo do dollarbot")
			.setFooter(
				`Comando executado por: ${message.author.tag}`,
				message.author.avatarURL()
			);

		try {
			const walletProvider = new FirebaseWalletRepository();
			const modernEmbedsLoader = new ModernEmbedsLoader();

			walletProvider
				.getUserWallet(message.author.id)
				.then(async (wallet) => {
					const { imageBuffer, imageName } =
						await modernEmbedsLoader.load(
							"dollars",
							message.author.avatarURL(),
							wallet
						);
					embed.setDescription(
						`**${message.author.username}**, você tem $${wallet.wallet.dollars} de saldo.`
					);
					embed.setImage(`attachment://${imageName}`);

					message.channel.stopTyping(true);
					await messageSended.delete();
					await message.channel.send({
						embed,
						files: [
							new Discord.MessageAttachment(
								imageBuffer,
								imageName
							),
						],
					});
					await new GepetoServicesChartProvider().deleteTempChart(
						imageName
					);
				})
				.catch(async () => {
					const errorEmbed = new CommandErrorsEmbed()
						.generate(message)
						.addField(
							"Causa do erro:",
							"Não foi possível retornar sua carteira. Verifique se você está sincronizado."
						);

					message.channel.stopTyping(true);
					await messageSended.delete();
					await message.reply(errorEmbed);
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
