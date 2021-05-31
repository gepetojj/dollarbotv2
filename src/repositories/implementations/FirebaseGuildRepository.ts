import { DBGuild } from "../../entities";
import { Logger, firestore } from "../../loaders";
import { IGuildRepository } from "../IGuildRepository";

export class FirebaseGuildRepository implements IGuildRepository {
	collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

	constructor() {
		this.collection = firestore.collection("guilds");
	}

	createGuild(guild: DBGuild): Promise<void> {
		const promise = new Promise<void>(async (resolve, reject) => {
			try {
				const guildDoc = await this.collection.doc(guild.id).get();

				if (guildDoc.exists) {
					return reject("Este servidor já está cadastrado.");
				}

				await this.collection.doc(guild.id).create({ ...guild });
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
				await this.collection.doc(guildId).delete();
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
				const guildDoc = await this.collection.doc(guildId).get();

				if (!guildDoc.exists) {
					return reject("Este servidor não está cadastrado.");
				}

				await this.collection.doc(guildId).update({
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

	getAllGuilds(): Promise<DBGuild[]> {
		const promise = new Promise<DBGuild[]>(async (resolve, reject) => {
			try {
				const guilds = await this.collection.get();

				if (guilds.empty) {
					return resolve([]);
				}

				let guildsFormatted: DBGuild[] = [];

				guilds.forEach((guild) => {
					const data = guild.data();
					const guildData = new DBGuild({
						id: data.id,
						dbPublicChannelId: data.dbPublicChannelId,
						dbAdminChannelId: data.dbAdminChannelId,
						adminRoleId: data.adminRoleId,
					});
					guildsFormatted.push(guildData);
				});

				return resolve(guildsFormatted);
			} catch (err) {
				Logger.error(
					`error while attempting to get all guilds: ${err.message}`
				);
				return reject(
					"Houve um erro ao tentar acessar o banco de dados."
				);
			}
		});
		return promise;
	}
}
