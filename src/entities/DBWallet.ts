export class DBWalletActivity {
	public operation: "add" | "subtract";
	public quantity: number;
	public item: string;
	public time: number;

	constructor(data: DBWalletActivity) {
		Object.assign(this, data);
	}
}

export class DBWallet {
	public dollars: number;
	public history: {
		lastTimeChanged: number;
		activity: DBWalletActivity[];
	};

	constructor(data: DBWallet) {
		Object.assign(this, data);
	}
}
