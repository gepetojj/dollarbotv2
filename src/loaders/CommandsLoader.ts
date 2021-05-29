import fs from "fs";
import path from "path";
import Discord from "discord.js";

import config from "../config";

export interface IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;
	execute: (message: Discord.Message, args?: string[]) => Promise<void>;
}

export class CommandsLoader {
	commandsPath: string;
	commandsList: string[];
	commandsMap: IBotCommand[];

	constructor() {
		this.commandsPath = path.resolve(__dirname, "..", "commands");
		this.commandsList = fs
			.readdirSync(this.commandsPath)
			.filter((file) =>
				file.endsWith(config.dev ? ".command.ts" : ".command.js")
			);
		this.commandsMap = [];

		for (const commandName of this.commandsList) {
			const commandPath = path.resolve(this.commandsPath, commandName);
			const Command = require(commandPath);

			const command = new Command.default();
			const commandMap = {
				name: command.name,
				syntax: command.syntax,
				arguments: command.arguments,
				guildOnly: command.guildOnly,
				description: command.description,
				aliases: command.aliases,
				cooldown: command.cooldown,
				execute: command.command,
			};
			this.commandsMap.push(commandMap);
		}
	}

	getCommands() {
		return this.commandsMap;
	}
}
