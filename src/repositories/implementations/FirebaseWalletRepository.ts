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
					return reject("Você já está cadastrado.");
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
					dollars: userData.dollars,
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

	subtractUserWallet(userId: string, amount: number): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const userCollection = firestore.collection("users");
				const userDoc = await userCollection.doc(userId).get();

				if (!userDoc.exists) {
					return reject(
						"Você não está cadastrado. Envie: `>sync` para sincronizar."
					);
				}

				const userData = userDoc.data();
				let user = new DBUser({
					id: userData.id,
					tag: userData.tag,
					username: userData.username,
					dollars: userData.dollars,
				});
				user.dollars += amount;

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

	addUserWallet(userId: string, amount: number): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const userCollection = firestore.collection("users");
				const userDoc = await userCollection.doc(userId).get();

				if (!userDoc.exists) {
					return reject(
						"Você não está cadastrado. Envie: `>sync` para sincronizar."
					);
				}

				const userData = userDoc.data();
				let user = new DBUser({
					id: userData.id,
					tag: userData.tag,
					username: userData.username,
					dollars: userData.dollars,
				});
				user.dollars -= amount;

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
