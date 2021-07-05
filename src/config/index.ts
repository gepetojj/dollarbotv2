<<<<<<< HEAD
import dotenv from "dotenv";
dotenv.config();

const config = {
	dev: Boolean(process.env.NODE_ENV === "development" ? true : false),
	token: String(process.env.TOKEN),

	pkid: String(process.env.PKID),
	pk: String(process.env.PK).replace(/\\n/g, "\n"),
	ce: String(process.env.CE),
	cid: String(process.env.CID),
	curl: String(process.env.CURL),

	richPresence: {
		options: ["monopoly.", "dólares fora.", "jogo do bixo.", "tempo fora."],
		timeout: 7000,
	},
	primaryColor: "#7289DA",
	version: "1.3.2",
};

export default config;
=======
import dotenv from "dotenv";
dotenv.config();

const config = {
	dev: Boolean(process.env.NODE_ENV === "development" ? true : false),
	token: String(process.env.TOKEN),

	pkid: String(process.env.PKID),
	pk: String(process.env.PK).replace(/\\n/g, "\n"),
	ce: String(process.env.CE),
	cid: String(process.env.CID),
	curl: String(process.env.CURL),

	richPresence: {
		options: ["monopoly.", "dólares fora.", "jogo do bixo.", "tempo fora."],
		timeout: 7000,
	},
};

export default config;
>>>>>>> d55c329de5feeeaaabae95e4cab8cf5216f33c9b
