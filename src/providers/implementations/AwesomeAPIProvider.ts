import axios, { AxiosInstance } from "axios";
import { IDollarValue, IDollarValueProvider } from "../IDollarValueProvider";
import dayjs from "../../loaders/DayjsLoader";
import { Logger } from "../../loaders";

export class AwesomeAPIProvider implements IDollarValueProvider {
	axios: AxiosInstance;

	constructor() {
		this.axios = axios.create({
			baseURL: "https://economia.awesomeapi.com.br/json",
			timeout: 5000,
			headers: {
				"User-Agent": "dollarbotv2",
				"X-User-Agent-Details":
					"This request is coming from a discord bot, named dollarbot.",
			},
		});
	}

	getLastDollarValue(): Promise<IDollarValue> {
		const promise = new Promise<IDollarValue>(async (resolve, reject) => {
			try {
				const request = await this.axios.get("/last/USD-BRL");
				if (request) {
					const data: [string, string, string] = [
						request.data.USDBRL.high,
						request.data.USDBRL.low,
						request.data.USDBRL.create_date,
					];

					const dataFormatted: IDollarValue = {
						high: Number(Number(data[0]).toFixed(2)),
						value: Number(Number(data[1]).toFixed(2)),
						timestamp: dayjs(data[2]).tz().valueOf(),
					};
					return resolve(dataFormatted);
				}
				Logger.error(
					`error while attempting to get dollar data from api: request did not recieve response.`
				);
				return reject();
			} catch (err) {
				Logger.error(
					`error while attempting to get dollar data from api: ${err.message}`
				);
				Logger.debug(`response from the server: ${err.response.data}`);
				return reject();
			}
		});
		return promise;
	}

	getDollarValuesInLastDays(days: number): Promise<IDollarValue[]> {
		const promise = new Promise<IDollarValue[]>(async (resolve, reject) => {
			try {
				const request = await this.axios.get(
					`/daily/USD-BRL/${days || 7}`
				);
				const data = request.data;
				let dataFormatted: IDollarValue[] = [];
				data.forEach(
					(doc: {
						high: string;
						low: string;
						create_date: string;
					}) => {
						return dataFormatted.push({
							high: Number(Number(doc.high).toFixed(2)),
							value: Number(Number(doc.low).toFixed(2)),
							timestamp: dayjs(doc.create_date).tz().valueOf(),
						});
					}
				);
				return resolve(dataFormatted);
			} catch (err) {
				Logger.error(
					`error while attempting to get dollar data from api: ${err.message}`
				);
				Logger.debug(`response from the server: ${err.response.data}`);
				return reject();
			}
		});
		return promise;
	}
}
