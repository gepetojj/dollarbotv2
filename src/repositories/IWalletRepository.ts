import { DBUser } from "../entities";

export interface IWalletRepository {
	createUserWallet(user: DBUser): Promise<void>;
	getUserWallet(userId: string): Promise<DBUser>;
	subtractUserWallet(
		userId: string,
		amount: number,
		item: string
	): Promise<void>;
	addUserWallet(userId: string, amount: number, item: string): Promise<void>;
}
