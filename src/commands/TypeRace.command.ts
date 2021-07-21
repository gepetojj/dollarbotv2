import Discord from "discord.js";
import memoryCache from "memory-cache";

import config from "../config";
import { dayjs } from "../loaders";
import { CommandErrorsEmbed } from "../templates";
import { LocalTypeRaceRepository } from "../extensions/TypeRace";
import { ITypeRaceCache } from "../loaders/DiscordLoader";
import { IBotCommand } from "./IBotCommand";

export default class TypeRaceCommand implements IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	constructor() {
		this.name = "typerace";
		this.syntax = "typerace {opcional: start} {frase}";
		this.aliases = ["tr"];
		this.arguments = true;
		this.guildOnly = true;
		this.description =
			"Cria uma corrida de digitação, ou interage em uma existente.";
	}

	async command(
		message: Discord.Message,
		args: string[],
		cache: memoryCache.CacheClass<string, ITypeRaceCache>
	) {
		const typeRaceRepository = new LocalTypeRaceRepository();

		if (args[0] === "start") {
			const firstEmbed = new Discord.MessageEmbed()
				.setColor(config.primaryColor)
				.setTitle("Criando corrida")
				.addField("Carregando...", "Carregando...");
			const messageSended = await message.reply(firstEmbed);

			typeRaceRepository.getRandomPhrase().then(async (phrase) => {
				cache.put(message.channel.id, { phrase, winners: [] });
				let secondsToStartRace = 5;
				const embed = new Discord.MessageEmbed()
					.setColor(config.primaryColor)
					.setTitle("Corrida de digitação")
					.addField(
						"Se prepare!",
						`A corrida começará em: **${secondsToStartRace}** segundos.`
					)
					.setFooter(
						`Comando executado por: ${message.author.tag}`,
						message.author.avatarURL()
					);
				await messageSended.edit(embed);

				while (true) {
					await new Promise<void>((resolve) => {
						setTimeout(resolve, 1000);
					});
					const embed = new Discord.MessageEmbed()
						.setColor(config.primaryColor)
						.setTitle("Corrida de digitação")
						.addField(
							"Se prepare!",
							`A corrida começará em: **${secondsToStartRace}** segundos.`
						)
						.setFooter(
							`Comando executado por: ${message.author.tag}`,
							message.author.avatarURL()
						);
					await messageSended.edit(embed);
					secondsToStartRace--;
					if (secondsToStartRace < 0) {
						break;
					}
				}

				let secondsToFinishRace = 60;
				const raceEmbed = new Discord.MessageEmbed()
					.setColor(config.primaryColor)
					.setTitle("Corrida de digitação")
					.setDescription(
						`[${secondsToFinishRace}] Digite: **${phrase}**`
					)
					.setFooter(
						`Comando executado por: ${message.author.tag}`,
						message.author.avatarURL()
					);
				await messageSended.edit(raceEmbed);
				const raceStarted = dayjs().tz().valueOf();

				while (true) {
					await new Promise<void>((resolve) => {
						setTimeout(resolve, 1000);
					});
					raceEmbed.setDescription(
						`[${secondsToFinishRace}] Digite: **${phrase}**`
					);
					await messageSended.edit(raceEmbed);
					secondsToFinishRace--;
					if (secondsToFinishRace < 0) {
						break;
					}
				}

				const finalEmbed = new CommandErrorsEmbed()
					.generate(message)
					.setTitle("Corrida de digitação")
					.setDescription("Tempo esgotado!");

				const race = cache.get(message.channel.id);
				if (race.winners.length > 0) {
					finalEmbed.setColor(config.primaryColor);
					race.winners.forEach((winner, index) => {
						const winnerUser = message.guild.members.cache.get(
							winner.id
						);
						finalEmbed.addField(
							`${index + 1}º lugar`,
							`${winnerUser.user.username}, em ${dayjs(
								winner.time - raceStarted
							)
								.tz()
								.format("ss")} segundos.`
						);
					});
				} else {
					finalEmbed.addField(
						"Nenhum finalista",
						"Ninguém terminou a corrida."
					);
				}
				await messageSended.delete();
				await message.reply(finalEmbed);
			});
		} else {
			let userAttempt = "";
			for (let word = 0; word < args.length; word++) {
				userAttempt +=
					word === args.length - 1
						? `${args[word]}`
						: `${args[word]} `;
			}

			const answer = cache.get(message.channel.id);
			if (!answer) {
				const finalEmbed = new CommandErrorsEmbed()
					.generate(message)
					.setTitle("Corrida de digitação")
					.setDescription("Nenhuma corrida está aberta neste canal.");

				await message.reply(finalEmbed);
				return;
			}
			if (userAttempt === answer.phrase) {
				await message.delete();
				if (
					!answer.winners.filter((winner) => {
						return winner.id === message.author.id;
					})[0]
				) {
					cache.del(message.channel.id);
					cache.put(message.channel.id, {
						phrase: answer.phrase,
						winners: [
							...answer.winners,
							{
								id: message.author.id,
								time: dayjs().tz().valueOf(),
							},
						],
					});
				}
			}
		}
	}
}
