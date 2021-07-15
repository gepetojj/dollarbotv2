import fs from "fs";
import ejs from "ejs";
import path from "path";
import crypto from "crypto";
import nodeHtmlToImage from "node-html-to-image";
import { Logger, dayjs } from "./index";

export type Template = "dollars";

export interface IModernEmbedLoaderResponse {
	imageBuffer: Buffer;
	imageName: string;
}

export class ModernEmbedsLoader {
	async load(
		template: Template,
		...args: any[]
	): Promise<IModernEmbedLoaderResponse> {
		switch (template) {
			case "dollars":
				const promise = new Promise<IModernEmbedLoaderResponse>(
					(resolve, reject) => {
						if (args.length < 2) {
							Logger.error(
								`invalid arguments passed to template : ${template}`
							);
							return reject();
						}

						const templatePath = path.resolve(
							process.cwd(),
							"src",
							"templates",
							"ModernEmbeds",
							`${template}.ejs`
						);
						const tempPath = path.resolve(process.cwd(), "temp");
						const avatar = args[0];
						const dollars = args[1];

						ejs.renderFile(
							templatePath,
							{
								avatar,
								dollars,
							},
							(err, templateHtml) => {
								if (err) {
									Logger.error(
										`error while attempting to generate dollars image: ${err.message}`
									);
									return reject();
								}

								const imageName = `${dayjs()
									.tz()
									.format("DD-MM-YYYY-")}${crypto
									.randomBytes(5)
									.toString("hex")}.png`;
								nodeHtmlToImage({
									html: templateHtml,
									quality: 100,
									type: "png",
									puppeteerArgs: {
										args: [
											"--no-sandbox",
											"--disable-setuid-sandbox",
										],
									},
									output: path.resolve(tempPath, imageName),
								})
									.then(() => {
										const imageBuffer = fs.readFileSync(
											path.resolve(tempPath, imageName)
										);
										return resolve({
											imageBuffer,
											imageName,
										});
									})
									.catch((err) => {
										Logger.error(
											`error while attempting to generate dollars image: ${err.message}`
										);
										return reject();
									});
							}
						);
					}
				);
				return promise;

			default:
				throw new Error("invalid template");
		}
	}
}
