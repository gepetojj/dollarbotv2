export class DBGuild {
	public readonly id: string;

	public dbPublicChannelId: string;
	public dbAdminChannelId: string;
	public adminRoleId: string;

	constructor(data: DBGuild) {
		Object.assign(this, data);
	}
}
