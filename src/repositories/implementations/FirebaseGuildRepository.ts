import { DBGuild } from "../../entities";
import { Logger, firestore } from "../../loaders";
import { IGuildRepository } from "../IGuildRepository";

export class FirebaseGuildRepository implements IGuildRepository {
	createGuild(guild: DBGuild): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const guildCollection = firestore.collection("guilds");
				const guildDoc = await guildCollection.doc(guild.id).get();

				if (guildDoc.exists) {
					return reject("Este servidor já está cadastrado.");
				}

				await guildCollection.doc(guild.id).create(guild);
				return resolve();
			} catch (err) {
				Logger.error(`error while attempting to create guild: ${err}`);
				Logger.debug(`target guild: ${guild.id}`);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}

	deleteGuild(guildId: string): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const guildCollection = firestore.collection("guilds");
				await guildCollection.doc(guildId).delete();
				return resolve();
			} catch (err) {
				Logger.error(`error while attempting to delete guild: ${err}`);
				Logger.debug(`target guild: ${guildId}`);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}

	changeGuildAdminRole(guildId: string, adminRoleId: string): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const guildCollection = firestore.collection("guilds");
				const guildDoc = await guildCollection.doc(guildId).get();

				if (!guildDoc.exists) {
					return reject("Este servidor não está cadastrado.");
				}

				await guildCollection.doc(guildId).update({
					...guildDoc.data(),
					adminRoleId,
				});
				return resolve();
			} catch (err) {
				Logger.error(`error while attempting to create guild: ${err}`);
				Logger.debug(`target guild: ${guildId}`);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}
}
