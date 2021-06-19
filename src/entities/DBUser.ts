export class DBUser {
	public readonly id: string;

	public tag: string;
	public username: string;
	public dollars: number;

	constructor(data: DBUser) {
		Object.assign(this, data);
	}
}
