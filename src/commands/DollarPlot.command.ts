import Discord from "discord.js";
import { Logger, dayjs } from "../loaders";
import { AwesomeAPIProvider, GepetoServicesChartProvider } from "../providers";
import { CommandErrorsEmbed } from "../templates";
import { IBotCommand } from "./IBotCommand";

export default class DollarPlotCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "dollarp";
		this.syntax = "dollarp";
		this.aliases = [
			"dolarp",
			"dólarp",
			"dollarplot",
			"dolarplot",
			"dólarplot",
		];
		this.arguments = false;
		this.guildOnly = false;
		this.description = "Gera um gráfico com a variação do dólar.";
		this.cooldown = 30000;
	}

	async command(message: Discord.Message) {
		message.channel.startTyping();

		const dollarProvider = new AwesomeAPIProvider();
		const chartProvider = new GepetoServicesChartProvider();
		const firstEmbed = new Discord.MessageEmbed()
			.setColor("#0079DB")
			.setTitle("Variação do dólar")
			.addField("Aguarde...", "Gerando gráfico...");
		const messageSended = await message.reply(firstEmbed);

		return dollarProvider
			.getDollarValuesInLastDays(7)
			.then(async (lastValues) => {
				const embed = new Discord.MessageEmbed()
					.setColor("#0079DB")
					.setTitle("Variação do dólar")
					.setFooter(
						`Comando executado por: ${message.author.tag}`,
						message.author.avatarURL()
					);

				let days: string[] = [];
				let values: number[] = [];

				lastValues.forEach((doc, index) => {
					days.push(
						dayjs()
							.subtract(index + 1, "days")
							.format("DD/MM")
					);
					values.push(doc.value);
				});

				const { chartBuffer, chartFileName } =
					await chartProvider.generateDollarChart(days, values);
				embed.setImage(`attachment://${chartFileName}`);

				try {
					message.channel.stopTyping(true);
					await messageSended.delete();
					await message.channel.send({
						embed,
						files: [
							new Discord.MessageAttachment(
								chartBuffer,
								chartFileName
							),
						],
					});
					await chartProvider.deleteTempChart(chartFileName);
				} catch (err) {
					Logger.error(
						`error while attempting to edit dollar chart message: ${err.message}`
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
						"Não foi possível gerar o gráfico."
					);
				try {
					message.channel.stopTyping(true);
					await messageSended.edit(embed);
				} catch (err) {
					Logger.error(
						`error while attempting to edit dollar chart message: ${err.message}`
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
