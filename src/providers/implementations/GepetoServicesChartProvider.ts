import fs from "fs";
import path from "path";
import { PythonShell } from "python-shell";
import { Logger } from "../../loaders";
import { IChartProviderResponse, IChartsProvider } from "../IChartsProvider";

export class GepetoServicesChartProvider implements IChartsProvider {
	async generateDollarChart(
		x: string[],
		y: number[]
	): Promise<IChartProviderResponse> {
		const promise = new Promise<IChartProviderResponse>(
			async (resolve, reject) => {
				try {
					PythonShell.run(
						path.resolve(
							process.cwd(),
							"src",
							"utils",
							"plot_generator.py"
						),
						{ args: [`${x}`, `${y}`], mode: "text" },
						(err, output) => {
							if (err) {
								Logger.error(
									`error while attempting to generate chart: ${err.message}`
								);
								Logger.debug(
									`arguments provided to the script: ${x} / ${y}`
								);
								return reject();
							}
							const chartPath = path.resolve(
								process.cwd(),
								"temp",
								output[0]
							);

							fs.readFile(chartPath, (err, chartBuffer) => {
								if (err) {
									Logger.error(
										`error while attempting to read the chart: ${err.message}`
									);
									return reject();
								}

								return resolve({
									chartBuffer,
									chartFileName: output[0],
								});
							});
						}
					);
				} catch (err) {
					Logger.error(
						`error while attempting to generate chart: ${err.message}`
					);
					return reject();
				}
			}
		);
		return promise;
	}

	async deleteTempChart(fileName: string): Promise<void> {
		const promise = new Promise<void>((resolve, reject) => {
			const chartPath = path.resolve(process.cwd(), "temp", fileName);
			try {
				fs.unlink(chartPath, (err) => {
					if (err) {
						Logger.error(
							`error while attempting to delete chart: ${err.message}`
						);
						Logger.debug(`file path: ${chartPath}`);
					}
					return resolve();
				});
			} catch (err) {
				Logger.error(
					`error while attempting to delete chart: ${err.message}`
				);
				Logger.debug(`file path: ${chartPath}`);
				return reject();
			}
		});
		return promise;
	}
}
