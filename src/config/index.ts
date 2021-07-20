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
	currencyConverterKey: String(process.env.CCKEY),

	richPresence: {
		options: ["monopoly.", "dólares fora.", "jogo do bixo.", "tempo fora."],
		timeout: 7000,
	},
	globalPrefix: process.env.NODE_ENV === "development" ? "." : ">",
	primaryColor: "#7289DA",
	version: "1.5.4",
};

export default config;
