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
		options: ["teste 1", "teste 2", "teste 3", "teste 4"],
		timeout: 7000,
	},
};

export default config;
