import path from "path";

import commands from "../commands";
import { IBotCommand } from "../commands/IBotCommand";

export class CommandsLoader {
	commandsPath: string; // Caminho para a pasta de comandos
	commandsList: string[]; // Lista de nomes dos comandos
	commandsMap: IBotCommand[]; // Lista de objetos dos comandos

	constructor() {
		let list: string[] = [];
		commands.forEach((command) => {
			list.push(command.name);
		});
		this.commandsPath = path.resolve(__dirname, "..", "commands");
		this.commandsList = list;
		this.commandsMap = commands;
	}

	getCommands() {
		return this.commandsMap;
	}
}
