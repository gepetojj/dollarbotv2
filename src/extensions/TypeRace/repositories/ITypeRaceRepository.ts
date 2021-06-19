export interface ITypeRaceRepository {
	getRandomPhrase(): Promise<string>;
}
