import Discord from "discord.js";

export interface IEmbedTemplate {
	generate(...args: any[]): Discord.MessageEmbed;
}
