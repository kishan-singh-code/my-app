import type { ColumnsType } from "antd/es/table";

export type IUtilityConverterId =
	| "length-converter"
	| "weight-converter"
	| "temperature-converter"
	| "area-converter"
	| "volume-converter"
	| "speed-converter"
	| "data-storage-converter"
	| "internet-speed-converter"
	| "energy-converter"
	| "pressure-converter"
	| "land-area-converter";

export interface IUnitDefinition {
	key: string;
	label: string;
	symbol: string;
	factor?: number;
	toBase?: (value: number) => number;
	fromBase?: (value: number) => number;
}

export interface IUtilityTableRow {
	key: string;
	unit: string;
	symbol: string;
	value: string;
}

export interface IUtilityConverterDefinition {
	id: IUtilityConverterId;
	title: string;
	baseUnitLabel: string;
	defaultValue: number;
	defaultFrom: string;
	defaultTo: string;
	precision?: number;
	note?: string;
	units: IUnitDefinition[];
}

export const formatNumber = (value: number, precision = 6) => {
	if (!Number.isFinite(value)) {
		return "0";
	}

	const absoluteValue = Math.abs(value);

	if (absoluteValue !== 0 && (absoluteValue >= 1_000_000_000 || absoluteValue < 0.000001)) {
		return value.toExponential(6);
	}

	return new Intl.NumberFormat("en-IN", {
		maximumFractionDigits: precision,
	}).format(value);
};

const linearUnit = (key: string, label: string, symbol: string, factor: number): IUnitDefinition => ({ key, label, symbol, factor });

const getUnit = (converter: IUtilityConverterDefinition, unitKey: string) => {
	const unit = converter.units.find((entry) => entry.key === unitKey);

	if (!unit) {
		return converter.units[0];
	}

	return unit;
};

const toBaseValue = (value: number, unit: IUnitDefinition) => {
	if (unit.toBase) {
		return unit.toBase(value);
	}

	return value * (unit.factor ?? 1);
};

const fromBaseValue = (value: number, unit: IUnitDefinition) => {
	if (unit.fromBase) {
		return unit.fromBase(value);
	}

	return value / (unit.factor ?? 1);
};

export const convertUnit = (converter: IUtilityConverterDefinition, value: number, fromUnitKey: string, toUnitKey: string) => {
	const fromUnit = getUnit(converter, fromUnitKey);
	const toUnit = getUnit(converter, toUnitKey);
	return fromBaseValue(toBaseValue(value, fromUnit), toUnit);
};

export const createConversionTable = (converter: IUtilityConverterDefinition, value: number, fromUnitKey: string): IUtilityTableRow[] => {
	const fromUnit = getUnit(converter, fromUnitKey);
	const baseValue = toBaseValue(value, fromUnit);

	return converter.units.map((unit) => ({
		key: unit.key,
		unit: unit.label,
		symbol: unit.symbol,
		value: formatNumber(fromBaseValue(baseValue, unit), converter.precision),
	}));
};

export const conversionTableColumns: ColumnsType<IUtilityTableRow> = [
	{
		title: "Unit",
		dataIndex: "unit",
		key: "unit",
	},
	{
		title: "Symbol",
		dataIndex: "symbol",
		key: "symbol",
	},
	{
		title: "Value",
		dataIndex: "value",
		key: "value",
	},
];

export const utilityConverters: Record<IUtilityConverterId, IUtilityConverterDefinition> = {
	"length-converter": {
		id: "length-converter",
		title: "Length Converter",
		baseUnitLabel: "meter",
		defaultValue: 1,
		defaultFrom: "meter",
		defaultTo: "kilometer",
		units: [
			linearUnit("meter", "Meter", "m", 1),
			linearUnit("kilometer", "Kilometer", "km", 1000),
			linearUnit("centimeter", "Centimeter", "cm", 0.01),
			linearUnit("millimeter", "Millimeter", "mm", 0.001),
			linearUnit("mile", "Mile", "mi", 1609.344),
			linearUnit("yard", "Yard", "yd", 0.9144),
			linearUnit("foot", "Foot", "ft", 0.3048),
			linearUnit("inch", "Inch", "in", 0.0254),
			linearUnit("nautical-mile", "Nautical Mile", "nmi", 1852),
		],
	},
	"weight-converter": {
		id: "weight-converter",
		title: "Weight Converter",
		baseUnitLabel: "kilogram",
		defaultValue: 1,
		defaultFrom: "kilogram",
		defaultTo: "pound",
		units: [
			linearUnit("kilogram", "Kilogram", "kg", 1),
			linearUnit("gram", "Gram", "g", 0.001),
			linearUnit("milligram", "Milligram", "mg", 0.000001),
			linearUnit("tonne", "Metric Tonne", "t", 1000),
			linearUnit("pound", "Pound", "lb", 0.45359237),
			linearUnit("ounce", "Ounce", "oz", 0.028349523125),
			linearUnit("stone", "Stone", "st", 6.35029318),
		],
	},
	"temperature-converter": {
		id: "temperature-converter",
		title: "Temperature Converter",
		baseUnitLabel: "celsius",
		defaultValue: 25,
		defaultFrom: "celsius",
		defaultTo: "fahrenheit",
		precision: 4,
		units: [
			{
				key: "celsius",
				label: "Celsius",
				symbol: "C",
				toBase: (value) => value,
				fromBase: (value) => value,
			},
			{
				key: "fahrenheit",
				label: "Fahrenheit",
				symbol: "F",
				toBase: (value) => ((value - 32) * 5) / 9,
				fromBase: (value) => (value * 9) / 5 + 32,
			},
			{
				key: "kelvin",
				label: "Kelvin",
				symbol: "K",
				toBase: (value) => value - 273.15,
				fromBase: (value) => value + 273.15,
			},
		],
	},
	"area-converter": {
		id: "area-converter",
		title: "Area Converter",
		baseUnitLabel: "square meter",
		defaultValue: 1000,
		defaultFrom: "square-foot",
		defaultTo: "square-meter",
		units: [
			linearUnit("square-meter", "Square Meter", "m2", 1),
			linearUnit("square-kilometer", "Square Kilometer", "km2", 1_000_000),
			linearUnit("square-centimeter", "Square Centimeter", "cm2", 0.0001),
			linearUnit("square-foot", "Square Foot", "ft2", 0.09290304),
			linearUnit("square-yard", "Square Yard", "yd2", 0.83612736),
			linearUnit("acre", "Acre", "ac", 4046.8564224),
			linearUnit("hectare", "Hectare", "ha", 10_000),
			linearUnit("square-mile", "Square Mile", "mi2", 2_589_988.110336),
		],
	},
	"volume-converter": {
		id: "volume-converter",
		title: "Volume Converter",
		baseUnitLabel: "liter",
		defaultValue: 1,
		defaultFrom: "liter",
		defaultTo: "gallon-us",
		units: [
			linearUnit("liter", "Liter", "L", 1),
			linearUnit("milliliter", "Milliliter", "mL", 0.001),
			linearUnit("cubic-meter", "Cubic Meter", "m3", 1000),
			linearUnit("cubic-centimeter", "Cubic Centimeter", "cm3", 0.001),
			linearUnit("gallon-us", "US Gallon", "gal", 3.785411784),
			linearUnit("quart-us", "US Quart", "qt", 0.946352946),
			linearUnit("pint-us", "US Pint", "pt", 0.473176473),
			linearUnit("cup-us", "US Cup", "cup", 0.2365882365),
			linearUnit("fluid-ounce-us", "US Fluid Ounce", "fl oz", 0.0295735295625),
		],
	},
	"speed-converter": {
		id: "speed-converter",
		title: "Speed Converter",
		baseUnitLabel: "meter per second",
		defaultValue: 100,
		defaultFrom: "kilometer-per-hour",
		defaultTo: "mile-per-hour",
		units: [
			linearUnit("meter-per-second", "Meter / Second", "m/s", 1),
			linearUnit("kilometer-per-hour", "Kilometer / Hour", "km/h", 0.2777777777777778),
			linearUnit("mile-per-hour", "Mile / Hour", "mph", 0.44704),
			linearUnit("knot", "Knot", "kn", 0.5144444444),
			linearUnit("foot-per-second", "Foot / Second", "ft/s", 0.3048),
		],
	},
	"data-storage-converter": {
		id: "data-storage-converter",
		title: "Data Storage Converter",
		baseUnitLabel: "byte",
		defaultValue: 1024,
		defaultFrom: "megabyte",
		defaultTo: "gigabyte",
		units: [
			linearUnit("bit", "Bit", "b", 0.125),
			linearUnit("byte", "Byte", "B", 1),
			linearUnit("kilobyte", "Kilobyte", "KB", 1000),
			linearUnit("megabyte", "Megabyte", "MB", 1_000_000),
			linearUnit("gigabyte", "Gigabyte", "GB", 1_000_000_000),
			linearUnit("terabyte", "Terabyte", "TB", 1_000_000_000_000),
			linearUnit("kibibyte", "Kibibyte", "KiB", 1024),
			linearUnit("mebibyte", "Mebibyte", "MiB", 1024 ** 2),
			linearUnit("gibibyte", "Gibibyte", "GiB", 1024 ** 3),
			linearUnit("tebibyte", "Tebibyte", "TiB", 1024 ** 4),
		],
	},
	"internet-speed-converter": {
		id: "internet-speed-converter",
		title: "Internet Speed Converter",
		baseUnitLabel: "megabit per second",
		defaultValue: 100,
		defaultFrom: "megabit-per-second",
		defaultTo: "megabyte-per-second",
		precision: 4,
		units: [
			linearUnit("bit-per-second", "Bit / Second", "bps", 0.000001),
			linearUnit("kilobit-per-second", "Kilobit / Second", "Kbps", 0.001),
			linearUnit("megabit-per-second", "Megabit / Second", "Mbps", 1),
			linearUnit("gigabit-per-second", "Gigabit / Second", "Gbps", 1000),
			linearUnit("byte-per-second", "Byte / Second", "Bps", 0.000008),
			linearUnit("kilobyte-per-second", "Kilobyte / Second", "KBps", 0.008),
			linearUnit("megabyte-per-second", "Megabyte / Second", "MBps", 8),
			linearUnit("gigabyte-per-second", "Gigabyte / Second", "GBps", 8000),
		],
	},
	"energy-converter": {
		id: "energy-converter",
		title: "Energy Converter",
		baseUnitLabel: "joule",
		defaultValue: 1,
		defaultFrom: "kilowatt-hour",
		defaultTo: "joule",
		units: [
			linearUnit("joule", "Joule", "J", 1),
			linearUnit("kilojoule", "Kilojoule", "kJ", 1000),
			linearUnit("calorie", "Calorie", "cal", 4.184),
			linearUnit("kilocalorie", "Kilocalorie", "kcal", 4184),
			linearUnit("watt-hour", "Watt Hour", "Wh", 3600),
			linearUnit("kilowatt-hour", "Kilowatt Hour", "kWh", 3_600_000),
			linearUnit("btu", "British Thermal Unit", "BTU", 1055.05585262),
			linearUnit("electronvolt", "Electronvolt", "eV", 1.602176634e-19),
		],
	},
	"pressure-converter": {
		id: "pressure-converter",
		title: "Pressure Converter",
		baseUnitLabel: "pascal",
		defaultValue: 1,
		defaultFrom: "bar",
		defaultTo: "psi",
		units: [
			linearUnit("pascal", "Pascal", "Pa", 1),
			linearUnit("kilopascal", "Kilopascal", "kPa", 1000),
			linearUnit("megapascal", "Megapascal", "MPa", 1_000_000),
			linearUnit("bar", "Bar", "bar", 100_000),
			linearUnit("millibar", "Millibar", "mbar", 100),
			linearUnit("psi", "Pound / Square Inch", "psi", 6894.757293),
			linearUnit("atmosphere", "Atmosphere", "atm", 101325),
			linearUnit("torr", "Torr", "Torr", 133.322368),
		],
	},
	"land-area-converter": {
		id: "land-area-converter",
		title: "Land Area Converter",
		baseUnitLabel: "square meter",
		defaultValue: 1,
		defaultFrom: "bigha-common",
		defaultTo: "gaj",
		note: "Bigha varies by state. This converter uses the common 1 bigha = 3,025 gaj = 27,225 sq ft reference often used in North India.",
		units: [
			linearUnit("square-meter", "Square Meter", "m2", 1),
			linearUnit("square-foot", "Square Foot", "sq ft", 0.09290304),
			linearUnit("gaj", "Gaj / Square Yard", "gaj", 0.83612736),
			linearUnit("bigha-common", "Bigha", "bigha", 2529.285264),
			linearUnit("biswa", "Biswa", "biswa", 126.4642632),
			linearUnit("katha", "Katha", "katha", 126.4411488),
			linearUnit("marla", "Marla", "marla", 25.29285264),
			linearUnit("kanal", "Kanal", "kanal", 505.8570528),
			linearUnit("acre", "Acre", "acre", 4046.8564224),
			linearUnit("hectare", "Hectare", "ha", 10_000),
			linearUnit("cent", "Cent", "cent", 40.468564224),
			linearUnit("guntha", "Guntha", "guntha", 101.17141056),
		],
	},
};
