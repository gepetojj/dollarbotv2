import Discord from "discord.js";
import { IBotCommand } from "../loaders/CommandsLoader";

export class Client extends Discord.Client {
	commands: Discord.Collection<string, IBotCommand>;

	constructor() {
		super();
	}
}
