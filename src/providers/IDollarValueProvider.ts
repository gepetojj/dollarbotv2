export interface IDollarValue {
	high: number;
	value: number;
	timestamp: number;
}

export interface IDollarValueProvider {
	getLastDollarValue(): Promise<IDollarValue>;
	getDollarValuesInLastDays(days: number): Promise<IDollarValue[]>;
}
