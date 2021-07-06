import Discord from "discord.js";
import config from "../config";
import { CommandsLoader, Logger } from "../loaders";
import { CommandErrorsEmbed } from "../templates";
import { IBotCommand } from "./IBotCommand";

export default class PingCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "help";
		this.syntax = "help";
		this.arguments = false;
		this.guildOnly = false;
		this.description = "Informa dados sobre o bot, como comandos e versão.";
		this.aliases = ["h", "ajuda"];
	}

	async command(message: Discord.Message) {
		message.channel.startTyping();

		const choiceEmbed = new Discord.MessageEmbed()
			.setColor(config.primaryColor)
			.setTitle("Ajuda do dollarbot")
			.setDescription("Escolha uma das opções para prosseguir:")
			.addField(
				"Lista de comandos",
				"Escolha 🧾 para ver a lista de comandos."
			)
			.addField(
				"Versão",
				"Escolha 📰 para ver detalhes da versão atual."
			);
		const choiceEmbedMessage = await message.channel.send(choiceEmbed);

		await choiceEmbedMessage.react("🧾");
		await choiceEmbedMessage.react("📰");
		// Esperar reação do emoji 1
		choiceEmbedMessage
			.awaitReactions(
				(reaction, user) => {
					return (
						reaction.emoji.name === "🧾" &&
						user.id === message.author.id
					);
				},
				{ max: 1 }
			)
			.then(async () => {
				await choiceEmbedMessage.delete();
				const commandListEmbed = new Discord.MessageEmbed()
					.setColor(config.primaryColor)
					.setTitle("Ajuda do dollarbot")
					.setDescription("Lista de commandos");

				const botCommands = new CommandsLoader().getCommands();
				botCommands.forEach((botCommand) => {
					commandListEmbed.addField(
						`${botCommand.name} ${
							botCommand.aliases && botCommand.aliases.length > 0
								? `- [${botCommand.aliases}]`
								: ""
						}`,
						botCommand.description
					);
				});

				await message.channel.send(commandListEmbed);
				message.channel.stopTyping(true);
			})
			.catch(async (err) => {
				if (err.code && err.code === 10008) return;
				try {
					const errorEmbed = new CommandErrorsEmbed()
						.generate(message)
						.addField(
							"Causa do erro:",
							"Não foi possível enviar a lista de comandos."
						);
					await message.channel.send(errorEmbed);
					message.channel.stopTyping(true);
				} catch (err) {
					Logger.error(
						`error while attempting to send command's error message: ${err.message}`
					);
				}
				Logger.error(
					`error while attempting to send bot's command list: ${err.message}`
				);
				Logger.debug(
					`guild where this error happened: ${message.guild.id}`
				);
				Logger.debug(
					`guild owner: ${message.guild.owner.user.id} / ${message.guild.owner.user.tag}`
				);
			});
		// Esperar reação do emoji 2
		choiceEmbedMessage
			.awaitReactions(
				(reaction, user) => {
					return (
						reaction.emoji.name === "📰" &&
						user.id === message.author.id
					);
				},
				{ max: 1 }
			)
			.then(async () => {
				await choiceEmbedMessage.delete();
				const botVersionEmbed = new Discord.MessageEmbed()
					.setColor(config.primaryColor)
					.setTitle("Ajuda do dollarbot")
					.setDescription("Detalhes da versão")
					.addField(
						"Versão atual:",
						`${config.version.split(".")[0]}.${
							config.version.split(".")[1]
						}`,
						true
					)
					.addField(
						"Revisão:",
						`${config.version.split(".")[2]}`,
						true
					)
					.addField(
						"Comandos:",
						new CommandsLoader().commandsList.length
					)
					.addField(
						"Channel:",
						config.dev ? "dev-unstable" : "stable"
					)
					.addField(
						"Host:",
						config.dev ? "localhost" : "Heroku US heroku-20"
					)
					.addField(
						"Agradecimentos:",
						"<@!830829009029562398> - Tester"
					);

				await message.channel.send(botVersionEmbed);
				message.channel.stopTyping(true);
			})
			.catch(async (err) => {
				if (err.code && err.code === 10008) return;
				try {
					const errorEmbed = new CommandErrorsEmbed()
						.generate(message)
						.addField(
							"Causa do erro:",
							"Não foi possível enviar os detalhes da versão."
						);
					await message.channel.send(errorEmbed);
					message.channel.stopTyping(true);
				} catch (err) {
					Logger.error(
						`error while attempting to send command's error message: ${err.message}`
					);
				}
				Logger.error(
					`error while attempting to send bot's version details: ${err.message}`
				);
				Logger.debug(
					`guild where this error happened: ${message.guild.id}`
				);
				Logger.debug(
					`guild owner: ${message.guild.owner.user.id} / ${message.guild.owner.user.tag}`
				);
			});
	}
}
