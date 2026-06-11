import type { ColumnsType } from "antd/es/table";

export type IDailyUseCalculatorId = "advanced-age" | "fuel-cost" | "electricity-bill" | "water-intake" | "tip-calculator" | "split-bill";

export type IDailyInputValue = number | string;

export interface IDailyInputOption {
	label: string;
	value: string;
}

export interface IDailyInputDefinition {
	key: string;
	label: string;
	type?: "number" | "select" | "date" | "datetime-local" | "time";
	min?: number;
	max?: number;
	step?: number;
	prefix?: string;
	addonAfter?: string;
	options?: IDailyInputOption[];
}

export interface IDailyMetric {
	label: string;
	value: string;
	tone?: "default" | "success" | "warning" | "danger";
}

export interface IDailyDataPoint {
	name: string;
	[key: string]: string | number;
}

export interface IDailyTableRow {
	key: string;
	[label: string]: string | number;
}

export interface IDailyCalculationResult {
	metrics: IDailyMetric[];
	pieData?: IDailyDataPoint[];
	barData?: IDailyDataPoint[];
	areaData?: IDailyDataPoint[];
	radialData?: IDailyDataPoint[];
	tableColumns?: ColumnsType<IDailyTableRow>;
	tableData?: IDailyTableRow[];
	note?: string;
}

export interface IDailyCalculatorDefinition {
	id: IDailyUseCalculatorId;
	title: string;
	inputs: IDailyInputDefinition[];
	defaults: Record<string, IDailyInputValue>;
	calculate: (values: Record<string, IDailyInputValue>) => IDailyCalculationResult;
}

const msPerHour = 60 * 60 * 1000;
const msPerDay = 24 * msPerHour;

const toNumber = (value: IDailyInputValue) => (typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0);
const round = (value: number, digits = 0) => Number(value.toFixed(digits));

export const formatMoney = (value: number) =>
	new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(Number.isFinite(value) ? value : 0);

export const formatNumber = (value: number, digits = 2) =>
	new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const today = new Date();
const birthSample = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());

const parseDate = (value: IDailyInputValue) => {
	const date = new Date(String(value));
	return Number.isFinite(date.getTime()) ? date : new Date();
};

const addMonths = (date: Date, months: number) => {
	const nextDate = new Date(date);
	nextDate.setMonth(nextDate.getMonth() + months);
	return nextDate;
};

const calculateAgeParts = (birthDate: Date, asOfDate: Date) => {
	if (asOfDate < birthDate) {
		return { years: 0, months: 0, days: 0, totalDays: 0, totalHours: 0, nextBirthdayDays: 0 };
	}

	let years = asOfDate.getFullYear() - birthDate.getFullYear();
	let cursor = new Date(birthDate);
	cursor.setFullYear(birthDate.getFullYear() + years);

	if (cursor > asOfDate) {
		years -= 1;
		cursor = new Date(birthDate);
		cursor.setFullYear(birthDate.getFullYear() + years);
	}

	let months = 0;
	while (addMonths(cursor, 1) <= asOfDate) {
		cursor = addMonths(cursor, 1);
		months += 1;
	}

	const days = Math.floor((asOfDate.getTime() - cursor.getTime()) / msPerDay);
	const totalMs = asOfDate.getTime() - birthDate.getTime();
	let nextBirthday = new Date(asOfDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());

	if (nextBirthday < asOfDate) {
		nextBirthday = new Date(asOfDate.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
	}

	return {
		years,
		months,
		days,
		totalDays: Math.floor(totalMs / msPerDay),
		totalHours: Math.floor(totalMs / msPerHour),
		nextBirthdayDays: Math.ceil((nextBirthday.getTime() - asOfDate.getTime()) / msPerDay),
	};
};

const calculateAdvancedAge: IDailyCalculatorDefinition["calculate"] = (values) => {
	const birthDate = parseDate(values.birthDate);
	const asOfDate = parseDate(values.asOfDate);
	const age = calculateAgeParts(birthDate, asOfDate);

	return {
		metrics: [
			{ label: "Age", value: `${age.years}y ${age.months}m ${age.days}d`, tone: "success" },
			{ label: "Total Days", value: formatNumber(age.totalDays, 0) },
			{ label: "Total Hours", value: formatNumber(age.totalHours, 0) },
			{ label: "Next Birthday", value: `${age.nextBirthdayDays} days` },
		],
	};
};

const calculateFuelCost: IDailyCalculatorDefinition["calculate"] = (values) => {
	const distance = toNumber(values.distance);
	const mileage = Math.max(toNumber(values.mileage), 0.1);
	const fuelPrice = toNumber(values.fuelPrice);
	const tolls = toNumber(values.tolls);
	const parking = toNumber(values.parking);
	const passengers = Math.max(toNumber(values.passengers), 1);
	const fuelNeeded = distance / mileage;
	const fuelCost = fuelNeeded * fuelPrice;
	const totalCost = fuelCost + tolls + parking;

	return {
		metrics: [
			{ label: "Trip Cost", value: formatMoney(totalCost), tone: "success" },
			{ label: "Fuel Needed", value: `${formatNumber(fuelNeeded)} L` },
			{ label: "Cost / Person", value: formatMoney(totalCost / passengers) },
			{ label: "Cost / Km", value: formatMoney(totalCost / Math.max(distance, 1)) },
		],
		pieData: [
			{ name: "Fuel", value: round(fuelCost) },
			{ name: "Tolls", value: round(tolls) },
			{ name: "Parking", value: round(parking) },
		],
	};
};

const calculateElectricityBill: IDailyCalculatorDefinition["calculate"] = (values) => {
	const units = toNumber(values.units);
	const rate = toNumber(values.rate);
	const fixedCharge = toNumber(values.fixedCharge);
	const taxPercent = toNumber(values.taxPercent);
	const energyCharge = units * rate;
	const tax = (energyCharge + fixedCharge) * (taxPercent / 100);
	const total = energyCharge + fixedCharge + tax;

	return {
		metrics: [
			{ label: "Total Bill", value: formatMoney(total), tone: "success" },
			{ label: "Energy Charge", value: formatMoney(energyCharge) },
			{ label: "Tax", value: formatMoney(tax), tone: "warning" },
		],
		pieData: [
			{ name: "Energy", value: round(energyCharge) },
			{ name: "Fixed", value: round(fixedCharge) },
			{ name: "Tax", value: round(tax) },
		],
	};
};

const calculateWaterIntake: IDailyCalculatorDefinition["calculate"] = (values) => {
	const weight = toNumber(values.weight);
	const activityMinutes = toNumber(values.activityMinutes);
	const climate = String(values.climate);
	const cupSize = Math.max(toNumber(values.cupSize), 100);
	const baseMl = weight * 35;
	const activityMl = activityMinutes * 12;
	const climateMl = climate === "hot" ? 500 : climate === "humid" ? 350 : 0;
	const totalMl = baseMl + activityMl + climateMl;
	const liters = totalMl / 1000;
	const cups = Math.ceil(totalMl / cupSize);

	return {
		metrics: [
			{ label: "Daily Water", value: `${formatNumber(liters)} L`, tone: "success" },
			{ label: "Glasses", value: `${cups}` },
			{ label: "Glass Size", value: `${formatNumber(cupSize, 0)} ml` },
		],
		pieData: [
			{ name: "Base", value: round(baseMl) },
			{ name: "Activity", value: round(activityMl) },
			{ name: "Climate", value: round(climateMl) },
		],
	};
};

const calculateTip: IDailyCalculatorDefinition["calculate"] = (values) => {
	const bill = toNumber(values.bill);
	const tipPercent = toNumber(values.tipPercent);
	const taxPercent = toNumber(values.taxPercent);
	const people = Math.max(toNumber(values.people), 1);
	const tax = bill * (taxPercent / 100);
	const tip = bill * (tipPercent / 100);
	const total = bill + tax + tip;

	return {
		metrics: [
			{ label: "Total", value: formatMoney(total), tone: "success" },
			{ label: "Tip", value: formatMoney(tip) },
			{ label: "Per Person", value: formatMoney(total / people) },
		],
		pieData: [
			{ name: "Bill", value: round(bill) },
			{ name: "Tax", value: round(tax) },
			{ name: "Tip", value: round(tip) },
		],
	};
};

const calculateSplitBill: IDailyCalculatorDefinition["calculate"] = (values) => {
	const subtotal = toNumber(values.subtotal);
	const tax = subtotal * (toNumber(values.taxPercent) / 100);
	const service = subtotal * (toNumber(values.servicePercent) / 100);
	const extra = toNumber(values.extraCharges);
	const people = Math.max(toNumber(values.people), 1);
	const total = subtotal + tax + service + extra;
	const perPerson = total / people;

	return {
		metrics: [
			{ label: "Total Bill", value: formatMoney(total), tone: "success" },
			{ label: "People", value: `${people}` },
			{ label: "Each Pays", value: formatMoney(perPerson), tone: "success" },
		],
		pieData: [
			{ name: "Subtotal", value: round(subtotal) },
			{ name: "Tax", value: round(tax) },
			{ name: "Service", value: round(service) },
			{ name: "Extra", value: round(extra) },
		],
	};
};

export const dailyUseCalculators: Record<IDailyUseCalculatorId, IDailyCalculatorDefinition> = {
	"advanced-age": {
		id: "advanced-age",
		title: "Advanced Age Calculator",
		defaults: { birthDate: formatDateInput(birthSample), asOfDate: formatDateInput(today) },
		inputs: [
			{ key: "birthDate", label: "Birth Date", type: "date" },
			{ key: "asOfDate", label: "Calculate On", type: "date" },
		],
		calculate: calculateAdvancedAge,
	},
	"fuel-cost": {
		id: "fuel-cost",
		title: "Fuel Cost Calculator",
		defaults: { distance: 250, mileage: 16, fuelPrice: 105, passengers: 2, tolls: 500, parking: 100 },
		inputs: [
			{ key: "distance", label: "Trip Distance", addonAfter: "km", min: 0, step: 10 },
			{ key: "mileage", label: "Mileage", addonAfter: "km/L", min: 0.1, step: 0.5 },
			{ key: "fuelPrice", label: "Fuel Price", prefix: "₹", min: 0, step: 1 },
			{ key: "passengers", label: "People Sharing", min: 1, step: 1 },
			{ key: "tolls", label: "Tolls", prefix: "₹", min: 0, step: 50 },
			{ key: "parking", label: "Parking / Extra", prefix: "₹", min: 0, step: 50 },
		],
		calculate: calculateFuelCost,
	},
	"electricity-bill": {
		id: "electricity-bill",
		title: "Electricity Bill Calculator",
		defaults: { units: 250, rate: 8, fixedCharge: 150, taxPercent: 5 },
		inputs: [
			{ key: "units", label: "Units Used", addonAfter: "kWh", min: 0, step: 10 },
			{ key: "rate", label: "Rate / Unit", prefix: "₹", min: 0, step: 0.5 },
			{ key: "fixedCharge", label: "Fixed Charge", prefix: "₹", min: 0, step: 10 },
			{ key: "taxPercent", label: "Tax", addonAfter: "%", min: 0, step: 0.5 },
		],
		calculate: calculateElectricityBill,
	},
	"water-intake": {
		id: "water-intake",
		title: "Water Intake Calculator",
		defaults: { weight: 70, activityMinutes: 30, climate: "normal", cupSize: 250 },
		inputs: [
			{ key: "weight", label: "Body Weight", addonAfter: "kg", min: 1, step: 1 },
			{ key: "activityMinutes", label: "Activity", addonAfter: "min", min: 0, step: 5 },
			{
				key: "climate",
				label: "Climate",
				type: "select",
				options: [
					{ label: "Normal", value: "normal" },
					{ label: "Hot", value: "hot" },
					{ label: "Humid", value: "humid" },
				],
			},
			{ key: "cupSize", label: "Glass Size", addonAfter: "ml", min: 100, step: 50 },
		],
		calculate: calculateWaterIntake,
	},
	"tip-calculator": {
		id: "tip-calculator",
		title: "Tip Calculator",
		defaults: { bill: 2000, tipPercent: 10, taxPercent: 5, people: 2 },
		inputs: [
			{ key: "bill", label: "Bill Amount", prefix: "₹", min: 0, step: 100 },
			{ key: "tipPercent", label: "Tip", addonAfter: "%", min: 0, step: 1 },
			{ key: "taxPercent", label: "Tax", addonAfter: "%", min: 0, step: 0.5 },
			{ key: "people", label: "People", min: 1, step: 1 },
		],
		calculate: calculateTip,
	},
	"split-bill": {
		id: "split-bill",
		title: "Split Bill Calculator",
		defaults: { subtotal: 3200, taxPercent: 5, servicePercent: 10, extraCharges: 0, people: 4 },
		inputs: [
			{ key: "subtotal", label: "Subtotal", prefix: "₹", min: 0, step: 100 },
			{ key: "taxPercent", label: "Tax", addonAfter: "%", min: 0, step: 0.5 },
			{ key: "servicePercent", label: "Service / Tip", addonAfter: "%", min: 0, step: 1 },
			{ key: "extraCharges", label: "Extra Charges", prefix: "₹", min: 0, step: 50 },
			{ key: "people", label: "People", min: 1, max: 20, step: 1 },
		],
		calculate: calculateSplitBill,
	},
};
