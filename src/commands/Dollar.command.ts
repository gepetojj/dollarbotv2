import Discord from "discord.js";
import { dayjs, Logger } from "../loaders";
import { AwesomeAPIProvider } from "../providers";
import { CommandErrorsEmbed } from "../templates";
import { IBotCommand } from "./IBotCommand";

export default class DollarCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "dollar";
		this.syntax = "dollar";
		this.aliases = ["dolar", "dólar"];
		this.arguments = false;
		this.guildOnly = false;
		this.description = "Informa a última variação do dólar.";
		this.cooldown = 5000;
	}

	async command(message: Discord.Message) {
		message.channel.startTyping();

		const provider = new AwesomeAPIProvider();
		const firstEmbed = new Discord.MessageEmbed()
			.setColor("#0079DB")
			.setTitle("Valor do dólar")
			.addField("Carregando...", "Carregando...");
		const messageSended = await message.reply(firstEmbed);

		return provider
			.getLastDollarValue()
			.then(async (lastValue) => {
				const embed = new Discord.MessageEmbed()
					.setColor("#0079DB")
					.setTitle("Valor do dólar")
					.addField(
						"Última alta do dólar norte-americano:",
						`$1 --> R$${lastValue.high}`
					)
					.addField(
						"Valor atual do dólar norte-americano:",
						`$1 --> R$${lastValue.value}`
					)
					.setFooter(
						`Este valor foi atualizado em: ${dayjs(
							lastValue.timestamp
						).tz().format("hh:mma DD/MM/YYYY")}`,
						message.author.avatarURL()
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
