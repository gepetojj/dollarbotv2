export interface IChartProviderResponse {
	chartBuffer: Buffer;
	chartFileName: string;
}

export interface IChartsProvider {
	generateDollarChart(
		x: string[],
		y: number[]
	): Promise<IChartProviderResponse>;

	deleteTempChart(filename: string): Promise<void>;
}
