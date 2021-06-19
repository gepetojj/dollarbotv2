import Discord from "discord.js";
import { Logger } from "../loaders";
import { AwesomeAPIProvider } from "../providers";
import { CommandErrorsEmbed } from "../templates";
import { IBotCommand } from "./IBotCommand";

export default class DollarHCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "dollarh";
		this.syntax = "dollarh {dias}";
		this.aliases = [
			"dolarh",
			"dólarh",
			"dollarhistory",
			"dolarhistory",
			"dólarhistory",
		];
		this.arguments = true;
		this.guildOnly = false;
		this.description = "Informa a variação do dólar em um tempo definido.";
		this.cooldown = 5000;
	}

	async command(message: Discord.Message, args: string[]) {
		message.channel.startTyping();

		if (args.length < 1 || Number(args[0]) === 0 || Number(args[0]) > 20) {
			const embed = new CommandErrorsEmbed()
				.generate(message)
				.addField("Causa do erro:", "Argumentos inválidos.")
				.addField(
					"Possível causa do erro:",
					"Limite de dias atingidos. (mínimo 1, máximo 20)"
				)
				.addField("Modo de uso deste comando:", `>${this.syntax}`);

			try {
				message.channel.stopTyping(true);
				message.reply(embed);
				return;
			} catch (err) {
				message.channel.stopTyping(true);
				Logger.error(
					`error while attempting to send error message: ${err.message}`
				);
				Logger.debug(
					`guild where this error happened: ${message.guild.id}`
				);
				Logger.debug(
					`message sender: ${message.author.id} / ${message.author.tag}`
				);
				return;
			}
		}

		const provider = new AwesomeAPIProvider();
		const firstEmbed = new Discord.MessageEmbed()
			.setColor("#0079DB")
			.setTitle("Valores do dólar")
			.addField("Carregando...", "Carregando...");
		const messageSended = await message.reply(firstEmbed);

		return provider
			.getDollarValuesInLastDays(Number(args[0]))
			.then(async (lastValues) => {
				const embed = new Discord.MessageEmbed()
					.setColor("#0079DB")
					.setTitle(
						Number(args[0]) === 1
							? `Valor do dólar ontem`
							: `Valores do dólar nos últimos ${args[0]} dias`
					)
					.setFooter(
						`Comando executado por: ${message.author.tag}`,
						message.author.avatarURL()
					);

				lastValues.forEach((doc, index) => {
					embed.addField(
						`Valor a ${index + 1} dia${
							index + 1 === 1 ? "" : "s"
						} atrás:`,
						`$1 --> R$${doc.value}`,
						lastValues.length > 5 ? true : false
					);
				});

				try {
					message.channel.stopTyping(true);
					await messageSended.edit(embed);
				} catch (err) {
					Logger.error(
						`error while attempting to edit dollar value message: ${err.message}`
					);
					Logger.debug(
						`guild where this error happened: ${message.guild.id}`
					);
					Logger.debug(
						`message sender: ${message.author.id} / ${message.author.tag}`
					);
					message.channel.stopTyping(true);
					await messageSended.delete();
					await message.reply(embed);
				}
			})
			.catch(async () => {
				const embed = new CommandErrorsEmbed()
					.generate(message)
					.addField(
						"Causa do erro:",
						"Não foi possível acessar o servidor."
					);
				try {
					message.channel.stopTyping(true);
					await messageSended.edit(embed);
				} catch (err) {
					Logger.error(
						`error while attempting to edit dollar value message: ${err.message}`
					);
					Logger.debug(
						`guild where this error happened: ${message.guild.id}`
					);
					Logger.debug(
						`message sender: ${message.author.id} / ${message.author.tag}`
					);
					message.channel.stopTyping(true);
					await messageSended.delete();
					await message.reply(embed);
				}
			});
	}
}
