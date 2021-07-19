import dayjs from "../../loaders/DayjsLoader";
import { Logger, firestore } from "../../loaders";
import { IWalletRepository } from "../IWalletRepository";
import { DBUser } from "../../entities";

export class FirebaseWalletRepository implements IWalletRepository {
	createUserWallet(user: DBUser): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const userCollection = firestore.collection("users");
				const userDoc = await userCollection.doc(user.id).get();

				if (userDoc.exists) {
					const userData = userDoc.data();
					if (
						user.tag === userData.tag &&
						user.username === userData.username
					) {
						return reject("Você já está cadastrado.");
					}
					await userCollection.doc(user.id).update({
						tag: user.tag,
						username: user.username,
					});
					return resolve();
				}

				await userCollection.doc(user.id).create(user);
				return resolve();
			} catch (err) {
				Logger.error(
					`error while attempting to get user wallet: ${err}`
				);
				Logger.debug(
					`target user: ${user.id} / target user tag: ${user.tag}`
				);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}

	getUserWallet(userId: string): Promise<DBUser> {
		const promise = new Promise<DBUser>(async (resolve, reject) => {
			try {
				const userCollection = firestore.collection("users");
				const userDoc = await userCollection.doc(userId).get();

				if (!userDoc.exists) {
					return reject(
						"Você não está cadastrado. Envie: `>sync` para sincronizar."
					);
				}

				const userData = userDoc.data();
				const user = new DBUser({
					id: userData.id,
					tag: userData.tag,
					username: userData.username,
					wallet: userData.wallet,
				});

				return resolve(user);
			} catch (err) {
				Logger.error(
					`error while attempting to get user wallet: ${err}`
				);
				Logger.debug(`target user: ${userId}`);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}

	subtractUserWallet(
		userId: string,
		amount: number,
		item: string
	): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const userCollection = firestore.collection("users");
				const userDoc = await userCollection.doc(userId).get();

				if (!userDoc.exists) {
					return reject(
						"Você não está cadastrado. Envie: `>sync` para sincronizar."
					);
				}

				const time = dayjs().tz().valueOf();
				const userData = userDoc.data();
				let user: DBUser = {
					id: userData.id,
					tag: userData.tag,
					username: userData.username,
					wallet: userData.wallet,
				};
				user.wallet.dollars -= amount;
				user.wallet.history.lastTimeChanged = time;
				user.wallet.history.activity.push({
					operation: "subtract",
					quantity: amount,
					item,
					time,
				});

				await userCollection.doc(userId).update(user);
				return resolve();
			} catch (err) {
				Logger.error(
					`error while attempting to subtract amount to user wallet: ${err}`
				);
				Logger.debug(`target user: ${userId}`);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}

	addUserWallet(userId: string, amount: number, item: string): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const userCollection = firestore.collection("users");
				const userDoc = await userCollection.doc(userId).get();

				if (!userDoc.exists) {
					return reject(
						"Você não está cadastrado. Envie: `>sync` para sincronizar."
					);
				}

				const time = dayjs().tz().valueOf();
				const userData = userDoc.data();
				let user: DBUser = {
					id: userData.id,
					tag: userData.tag,
					username: userData.username,
					wallet: userData.wallet,
				};
				user.wallet.dollars += amount;
				user.wallet.history.lastTimeChanged = time;
				user.wallet.history.activity.push({
					operation: "add",
					quantity: amount,
					item,
					time,
				});

				await userCollection.doc(userId).update(user);
				return resolve();
			} catch (err) {
				Logger.error(
					`error while attempting to add amount to user wallet: ${err}`
				);
				Logger.debug(`target user: ${userId}`);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}
}
