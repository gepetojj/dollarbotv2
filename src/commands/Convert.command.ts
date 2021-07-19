import Discord from "discord.js";

import { IBotCommand } from "./IBotCommand";
import { CommandErrorsEmbed } from "../templates";
import { AwesomeAPIProvider } from "../providers";
import config from "../config";
import { Logger } from "../loaders";

export default class ConvertCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "convert";
		this.syntax = "convert {moeda} {valor}";
		this.arguments = true;
		this.description = "Converte o valor para a moeda escolhida.";
		this.aliases = ["converter"];
	}

	async command(message: Discord.Message, args: string[]) {
		try {
			message.channel.startTyping();

			const coin = args[0];
			const value = args[1];

			const BRL = 0;
			const USD = 1;
			const validSyntaxBRL = ["brl", "real", "rs"];
			const validSyntaxUSD = ["usd", "dol", "dolar", "dollar"];

			if (!coin || !value) {
				const errorEmbed = new CommandErrorsEmbed()
					.generate(message)
					.addField("Causa do erro:", "Moeda ou valor inválido.")
					.addField("Moedas aceitas:", "brl (Real) | usd (Dólar)");
				await message.channel.send(errorEmbed);
				message.channel.stopTyping(true);
				return;
			}

			if (Number(value) === NaN) {
				const errorEmbed = new CommandErrorsEmbed()
					.generate(message)
					.addField(
						"Causa do erro:",
						"Valor inválido. Digite um número."
					);
				await message.channel.send(errorEmbed);
				message.channel.stopTyping(true);
				return;
			}

			const convertTo = validSyntaxBRL.includes(coin.toLowerCase())
				? BRL
				: validSyntaxUSD.includes(coin.toLowerCase())
				? USD
				: null;

			if (convertTo === null) {
				const errorEmbed = new CommandErrorsEmbed()
					.generate(message)
					.addField("Causa do erro:", "Moeda inválida.")
					.addField("Moedas aceitas:", "brl (Real) | usd (Dólar)");
				await message.channel.send(errorEmbed);
				message.channel.stopTyping(true);
				return;
			}

			const provider = new AwesomeAPIProvider();
			const lastDollarValue = await provider.getLastDollarValue();

			const operation =
				convertTo === BRL
					? Number(value) / lastDollarValue.value
					: Number(value) * lastDollarValue.value;
			const finalValue = operation.toFixed(2);

			const embed = new Discord.MessageEmbed()
				.setColor(config.primaryColor)
				.setTitle("Conversão de valores")
				.setDescription(
					`${value} ${
						convertTo === BRL ? "dólares" : "reais"
					} atualmente valem ${finalValue} ${
						convertTo === BRL ? "reais" : "dólares"
					}.`
				)
				.setFooter(
					`Comando executado por: ${message.author.tag}`,
					message.author.avatarURL()
				);
			await message.reply(embed);
			message.channel.stopTyping();
		} catch (err) {
			const errorEmbed = new CommandErrorsEmbed()
				.generate(message)
				.addField("Causa do erro:", "Erro desconhecido.");
			await message.channel.send(errorEmbed);
			message.channel.stopTyping(true);
			Logger.error(
				`error while attempting to execute convert command: ${err}`
			);
			Logger.debug(
				`guild where this error happened: ${message.guild.id}`
			);
			Logger.debug(
				`message sender: ${message.author.id} / ${message.author.tag}`
			);
		}
	}
}
