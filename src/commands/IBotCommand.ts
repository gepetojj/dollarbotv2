import Discord from "discord.js";

export interface IBotCommand {
	name: string;
	syntax: string;
	arguments: boolean;
	guildOnly: boolean;
	description: string;
	aliases?: string[];
	cooldown?: number;

	command(
		message: Discord.Message,
		args?: string[],
		...extra: any[]
	): Promise<void>;
}
