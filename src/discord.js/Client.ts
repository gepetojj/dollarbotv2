import Discord from "discord.js";

export class Client extends Discord.Client {
	commands: Discord.Collection<any, any>;

	constructor() {
		super();
	}
}
