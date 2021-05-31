import { ITypeRaceRepository } from "../ITypeRaceRepository";

export class LocalTypeRaceRepository implements ITypeRaceRepository {
	getRandomPhrase(): Promise<string> {
		const promise = new Promise<string>((resolve) => {
			const phrases = [
				"O pé na estrada eu vou botar.",
				"Onde quer que a virtude se encontre em grau eminente, é perseguida; poucos ou nenhum dos famosos varões do passado deixou de ser caluniado pela malícia.",
				"O saber a gente aprende com os mestres e os livros. A sabedoria se aprende é com a vida e com os humildes.",
				"A terra ensina-nos mais acerca de nós próprios do que todos os livros. Porque ela nos resiste.",
			];
			const phraseChoice = Math.floor(Math.random() * phrases.length);
			return resolve(phrases[phraseChoice]);
		});
		return promise;
	}
}
