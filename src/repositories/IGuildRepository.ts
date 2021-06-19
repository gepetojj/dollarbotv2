import { DBGuild } from "../entities";

export interface IGuildRepository {
	createGuild(guild: DBGuild): Promise<void>;
	deleteGuild(guildId: string): Promise<void>;

	changeGuildAdminRole(guildId: string, adminRoleId: string): Promise<void>;
}
