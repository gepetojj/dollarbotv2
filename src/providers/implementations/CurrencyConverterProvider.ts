import axios, { AxiosInstance } from "axios";

import config from "../../config";
import { IDollarValue, IDollarValueProvider } from "../IDollarValueProvider";
import { Logger, dayjs } from "../../loaders";

export interface IAwesomeAPIResponse {
	USDBRL: { ask: string };
}

export interface ICurrencyConverterMultiResponse {
	USD_BRL: { val: { [date: string]: number } };
}

export class CurrencyConverterProvider implements IDollarValueProvider {
	axios: AxiosInstance;

	constructor() {
		this.axios = axios.create({
			timeout: 10000,
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
				const request = await this.axios.get(
					"https://economia.awesomeapi.com.br/json/last/USD-BRL"
				);
				if (request.data) {
					const data: IAwesomeAPIResponse = request.data;
					const value: number = Number(data.USDBRL.ask.slice(0, 3));

					const dataFormatted: IDollarValue = {
						high: value,
						value: value,
						timestamp: dayjs().tz().valueOf(),
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
				return reject();
			}
		});
		return promise;
	}

	getDollarValuesInLastDays(days: number): Promise<IDollarValue[]> {
		const promise = new Promise<IDollarValue[]>(async (resolve, reject) => {
			try {
				const today = dayjs().subtract(1, "day");
				const todayFormatted = today.format("YYYY-MM-DD");

				const targetDate = today.subtract(days, "days");
				const targetDateFormatted = targetDate.format("YYYY-MM-DD");

				const request = await this.axios.get(
					`https://free.currconv.com/api/v7/convert?apiKey=${config.currencyConverterKey}&compact=ultra&q=USD_BRL&date=${targetDateFormatted}&endDate=${todayFormatted}`
				);
				const data: ICurrencyConverterMultiResponse =
					request.data.results;
				let dataFormatted: IDollarValue[] = [];

				let day = 1;
				for (day; day <= days; day++) {
					const date = today.subtract(day, "day");
					const dateFormatted = date.format("YYYY-MM-DD");
					const dateValue =
						data.USD_BRL.val[dateFormatted].toFixed(2);

					dataFormatted.push({
						high: Number(dateValue),
						value: Number(dateValue),
						timestamp: date.valueOf(),
					});
				}

				return resolve(dataFormatted);
			} catch (err) {
				Logger.error(
					`error while attempting to get dollar data from api: ${err.message}`
				);
				return reject();
			}
		});
		return promise;
	}
}
