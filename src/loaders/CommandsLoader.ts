import fs from "fs";
import path from "path";

import config from "../config";
import { IBotCommand } from "../commands/IBotCommand";
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
			this.commandsMap.push(command);
		}
	}

	getCommands() {
		return this.commandsMap;
	}
}
