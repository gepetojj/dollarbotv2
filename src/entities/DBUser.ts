import { DBWallet } from "./DBWallet";

export class DBUser {
	public readonly id: string;

	public tag: string;
	public username: string;
	public wallet: DBWallet;

	constructor(data: DBUser) {
		Object.assign(this, data);
	}
}
