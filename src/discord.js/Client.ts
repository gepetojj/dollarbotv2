import Discord from "discord.js";
import { IBotCommand } from "../commands/IBotCommand";

export class Client extends Discord.Client {
	commands: Discord.Collection<string, IBotCommand>;

	constructor() {
		super();
	}
}
