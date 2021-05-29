import Discord from "discord.js";
import { Client } from "../discord.js/Client";
import {
	AdminSettingsEmbed,
	CommandErrorsEmbed,
	GoodbyeEmbed,
	WelcomeEmbed,
} from "../templates";
import { FirebaseGuildRepository } from "../repositories";
import { IBotCommand } from "./CommandsLoader";
import { CommandsLoader, Logger } from "./index";

export interface IDiscordLoaderSettings {
	richPresence?: {
		options: string[];
		timeout: number;
	};
}

export class DiscordLoader {
	client: Client;
	clientToken: string;
	richPresence: string[];
	richPresenceTimeout: number;

	constructor(settings?: IDiscordLoaderSettings) {
		this.client = new Client();
		this.richPresence = settings.richPresence.options || ["dollarbot"];
		this.richPresenceTimeout = settings.richPresence.timeout || 7000;
	}

	private async onGuildCreate(guild: Discord.Guild) {
		const welcomeEmbed = new WelcomeEmbed().generate(guild.owner.user);

		try {
			await guild.owner.send(welcomeEmbed);
		} catch (err) {
			Logger.error(
				`error while attempting to send welcome message to guild owner: ${err.message}`
			);
			Logger.debug(`guild where this error happened: ${guild.id}`);
			Logger.debug(
				`guild owner: ${guild.owner.user.id} / ${guild.owner.user.tag}`
			);
		}

		try {
			const guildRepository = new FirebaseGuildRepository();
			const dbPublicChannel = await guild.channels.create(
				"dollar-status",
				{
					type: "text",
					topic: "Valor do dólar estadunidense. Atualizado a cada 5 segundos.",
					reason: "O bot 'dollarbot' precisa deste canal para funcionar corretamente. NÃO O EXCLUA.",
				}
			);
			const dbAdminChannel = await guild.channels.create(
				"dollarbot-logs",
				{
					type: "text",
					topic: "Canal de configurações e logs do dollarbot. Exclusivo para a administração do servidor.",
					reason: "O bot 'dollarbot' precisa deste canal para funcionar corretamente. NÃO O EXCLUA.",
				}
			);
			await guildRepository.createGuild({
				id: guild.id,
				dbPublicChannelId: dbPublicChannel.id,
				dbAdminChannelId: dbAdminChannel.id,
				adminRoleId: "",
			});

			const adminSettingsEmbed = new AdminSettingsEmbed().generate(
				guild.owner.user,
				1
			);

			const adminSettingsMessage = await dbAdminChannel.send(
				adminSettingsEmbed
			);
			await adminSettingsMessage.react("✅");
			adminSettingsMessage
				.awaitReactions(
					(reaction, user) => {
						return (
							reaction.emoji.name === "✅" &&
							guild
								.member(user)
								.permissions.has(
									Discord.Permissions.FLAGS.ADMINISTRATOR
								)
						);
					},
					{ max: 1 }
				)
				.then(async () => {
					const secondAdminSettingsEmbed =
						new AdminSettingsEmbed().generate(guild.owner.user, 2);
					await adminSettingsMessage.edit(secondAdminSettingsEmbed);
					await adminSettingsMessage.react("⏭️");
					adminSettingsMessage
						.awaitReactions(
							(reaction, user) => {
								return (
									reaction.emoji.name === "⏭️" &&
									guild
										.member(user)
										.permissions.has(
											Discord.Permissions.FLAGS
												.ADMINISTRATOR
										)
								);
							},
							{ max: 1 }
						)
						.then(async () => {
							await adminSettingsMessage.delete({
								reason: "Configuração concluída.",
							});
						});
				});
		} catch (err) {
			await guild.owner.send(
				"Não foi possível criar o meu canal no seu servidor."
			);
			Logger.error(
				`error while attempting to create a new channel: ${err.message}`
			);
			Logger.debug(`guild where this error happened: ${guild.id}`);
			Logger.debug(
				`guild owner: ${guild.owner.user.id} / ${guild.owner.user.tag}`
			);
		}
	}

	private async onGuildDelete(guild: Discord.Guild, client: Client) {
		const goodbyeEmbed = new GoodbyeEmbed().generate(
			guild.owner.user,
			client.user.id
		);

		try {
			await guild.owner.send(goodbyeEmbed);
		} catch (err) {
			Logger.error(
				`error while attempting to send goodbye message to guild owner: ${err.message}`
			);
			Logger.debug(`guild where this error happened: ${guild.id}`);
			Logger.debug(
				`guild owner: ${guild.owner.user.id} / ${guild.owner.user.tag}`
			);
		}
	}

	private async onMessage(message: Discord.Message, client: Client) {
		if (!message.content.startsWith(">") || message.author.bot) return;

		const args = message.content.slice(">".length).split(" ");
		const commandName = args.shift().toLowerCase();
		const command: IBotCommand =
			client.commands.get(commandName) ||
			client.commands.find((command: IBotCommand) => {
				return command.aliases && command.aliases.includes(commandName);
			});

		if (!command)
			return message.reply(
				new CommandErrorsEmbed()
					.generate(message)
					.addField("Causa do erro:", "Comando inexistente.")
			);
		if (command.guildOnly && message.channel.type !== "text")
			return message.reply(
				new CommandErrorsEmbed()
					.generate(message)
					.addField(
						"Causa do erro:",
						"Este comando só pode ser executado em servidores."
					)
			);
		if (command.arguments && !args.length)
			return message.reply(
				new CommandErrorsEmbed()
					.generate(message)
					.addField(
						"Causa do erro:",
						"Este comando necessita de argumentos"
					)
					.addField(
						"Modo de uso deste comando:",
						`>${command.syntax}`
					)
			);

		try {
			await command.execute(message, args);
		} catch (err) {
			message.reply(
				new CommandErrorsEmbed()
					.generate(message)
					.addField("Causa do erro:", "Erro inesperado.")
			);

			Logger.error(`error while executing command: ${err.message}`);
			Logger.debug(
				`guild where this error happened: ${message.guild.id}`
			);
			Logger.debug(`command requested: ${command.name} / ${args}`);
			Logger.debug(
				`message sender: ${message.author.id} / ${message.author.tag}`
			);
		}
	}

	load(token: string) {
		const client = this.client;
		client.commands = new Discord.Collection();
		client.on("ready", () => {
			client.setInterval(async () => {
				const richPresenceChoice = Math.floor(
					Math.random() * this.richPresence.length
				);
				await client.user.setActivity(
					this.richPresence[richPresenceChoice],
					{
						type: "PLAYING",
					}
				);
			}, this.richPresenceTimeout);

			Logger.info("discord bot is online.");
			const commands = new CommandsLoader().getCommands();
			commands.forEach((command) => {
				client.commands.set(command.name, command);
			});
			Logger.info("bot commands loaded.");
		});

		client.on("message", (message) => this.onMessage(message, client));
		client.on("guildCreate", (guild) => this.onGuildCreate(guild));
		client.on("guildDelete", (guild) => this.onGuildDelete(guild, client));

		async function run() {
			Logger.info("logging into discord bot account.");
			try {
				await client.login(token);
				Logger.info("logged successful.");
			} catch (err) {
				Logger.error(`error while logging: ${err.message}`);
				Logger.debug(`token used on this attempt: ${token}`);
			}
		}

		return { run };
	}
}
