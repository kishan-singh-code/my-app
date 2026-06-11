import { Button, Card, Col, DatePicker, InputNumber, Row, Select, Space, Statistic, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";

export type IHealthFitnessToolId =
	| "bmi-calculator"
	| "calorie-calculator"
	| "body-fat-calculator"
	| "bmr-calculator"
	| "ideal-weight-calculator"
	| "pace-calculator"
	| "army-body-fat-calculator"
	| "lean-body-mass-calculator"
	| "healthy-weight-calculator"
	| "calories-burned-calculator"
	| "one-rep-max-calculator"
	| "target-heart-rate-calculator"
	| "macro-calculator"
	| "carbohydrate-calculator"
	| "protein-calculator"
	| "fat-intake-calculator"
	| "tdee-calculator"
	| "gfr-calculator"
	| "body-type-calculator"
	| "body-surface-area-calculator"
	| "bac-calculator"
	| "pregnancy-calculator"
	| "pregnancy-weight-gain-calculator"
	| "pregnancy-conception-calculator"
	| "due-date-calculator"
	| "ovulation-calculator"
	| "conception-calculator"
	| "period-calculator";

type IHealthInputValue = number | string;
type IHealthMetricTone = "default" | "success" | "warning" | "danger";

interface IHealthInputOption {
	label: string;
	value: string;
}

interface IHealthInputDefinition {
	key: string;
	label: string;
	type?: "number" | "select" | "date";
	min?: number;
	max?: number;
	step?: number;
	prefix?: string;
	addonAfter?: string;
	options?: IHealthInputOption[];
}

interface IHealthMetric {
	label: string;
	value: string;
	tone?: IHealthMetricTone;
}

interface IHealthTableRow {
	key: string;
	[label: string]: string | number;
}

interface IHealthCalculationResult {
	metrics: IHealthMetric[];
	tableColumns?: ColumnsType<IHealthTableRow>;
	tableData?: IHealthTableRow[];
	note?: string;
}

interface IHealthCalculatorDefinition {
	id: IHealthFitnessToolId;
	title: string;
	inputs: IHealthInputDefinition[];
	defaults: Record<string, IHealthInputValue>;
	calculate: (values: Record<string, IHealthInputValue>) => IHealthCalculationResult;
}

const msPerDay = 24 * 60 * 60 * 1000;
const today = new Date();
const defaultLastPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 21, 12);
const defaultDueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 180, 12);

const sexOptions = [
	{ label: "Male", value: "male" },
	{ label: "Female", value: "female" },
];

const activityOptions = [
	{ label: "Sedentary", value: "1.2" },
	{ label: "Light exercise", value: "1.375" },
	{ label: "Moderate exercise", value: "1.55" },
	{ label: "Very active", value: "1.725" },
	{ label: "Athlete / physical job", value: "1.9" },
];

const calorieGoalOptions = [
	{ label: "Fat loss", value: "loss" },
	{ label: "Maintain", value: "maintain" },
	{ label: "Gain", value: "gain" },
];

const macroGoalOptions = [
	{ label: "Balanced", value: "balanced" },
	{ label: "Fat loss", value: "cut" },
	{ label: "Muscle gain", value: "bulk" },
	{ label: "Lower carb", value: "low-carb" },
];

const proteinGoalOptions = [
	{ label: "General health", value: "general" },
	{ label: "Active", value: "active" },
	{ label: "Muscle gain", value: "muscle" },
	{ label: "Endurance athlete", value: "athlete" },
];

const exerciseOptions = [
	{ label: "Walking", value: "3.5" },
	{ label: "Yoga", value: "3" },
	{ label: "Cycling", value: "7.5" },
	{ label: "Running", value: "9.8" },
	{ label: "Swimming", value: "8" },
	{ label: "Strength training", value: "6" },
	{ label: "HIIT", value: "10" },
];

const pregnancyTypeOptions = [
	{ label: "Singleton", value: "singleton" },
	{ label: "Twins", value: "twins" },
];

const metricColumns: ColumnsType<IHealthTableRow> = [
	{ title: "Metric", dataIndex: "metric", key: "metric" },
	{ title: "Value", dataIndex: "value", key: "value" },
];

const toNumber = (value: IHealthInputValue) => (typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatNumber = (value: number, digits = 1) =>
	new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);
const formatKg = (value: number) => `${formatNumber(value)} kg`;
const formatCalories = (value: number) => `${formatNumber(value, 0)} kcal`;
const formatPercent = (value: number) => `${formatNumber(value)}%`;

const formatDateInput = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const parseDateInput = (value: IHealthInputValue) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));

	if (!match) {
		return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
	}

	return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
};

const addDays = (date: Date, days: number) => {
	const nextDate = new Date(date);
	nextDate.setDate(nextDate.getDate() + days);
	return nextDate;
};

const daysBetween = (startDate: Date, endDate: Date) => Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);

const formatDate = (date: Date) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);

const buildRows = (entries: Array<[string, string | number]>): IHealthTableRow[] =>
	entries.map(([metric, value], index) => ({ key: String(index), metric, value }));

const getMetricColor = (tone: IHealthMetricTone = "default") => {
	if (tone === "success") {
		return "#15803d";
	}

	if (tone === "warning") {
		return "#b45309";
	}

	if (tone === "danger") {
		return "#b91c1c";
	}

	return undefined;
};

const getSex = (value: IHealthInputValue) => (String(value) === "female" ? "female" : "male");

const getBmi = (weightKg: number, heightCm: number) => weightKg / (heightCm / 100) ** 2;

const getBmiCategory = (bmi: number) => {
	if (bmi < 18.5) {
		return { label: "Underweight", tone: "warning" as const };
	}

	if (bmi < 25) {
		return { label: "Healthy", tone: "success" as const };
	}

	if (bmi < 30) {
		return { label: "Overweight", tone: "warning" as const };
	}

	return { label: "Obesity range", tone: "danger" as const };
};

const getBmr = (sex: string, weightKg: number, heightCm: number, age: number) =>
	10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);

const getBodyFatCategory = (sex: string, bodyFat: number) => {
	if (sex === "male") {
		if (bodyFat < 6) return "Essential";
		if (bodyFat < 14) return "Athlete";
		if (bodyFat < 18) return "Fitness";
		if (bodyFat < 25) return "Average";
		return "Obesity range";
	}

	if (bodyFat < 14) return "Essential";
	if (bodyFat < 21) return "Athlete";
	if (bodyFat < 25) return "Fitness";
	if (bodyFat < 32) return "Average";
	return "Obesity range";
};

const calculateNavyBodyFat = (sex: string, heightCm: number, neckCm: number, waistCm: number, hipCm: number) => {
	const heightIn = heightCm / 2.54;
	const neckIn = neckCm / 2.54;
	const waistIn = waistCm / 2.54;
	const hipIn = hipCm / 2.54;

	if (sex === "male") {
		const denominator = 1.0324 - 0.19077 * Math.log10(Math.max(waistIn - neckIn, 1)) + 0.15456 * Math.log10(heightIn);
		return clamp(495 / denominator - 450, 2, 75);
	}

	const denominator = 1.29579 - 0.35004 * Math.log10(Math.max(waistIn + hipIn - neckIn, 1)) + 0.221 * Math.log10(heightIn);
	return clamp(495 / denominator - 450, 2, 75);
};

const formatDuration = (totalSeconds: number) => {
	const seconds = Math.max(Math.round(totalSeconds), 0);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
	}

	return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const calculateBmi: IHealthCalculatorDefinition["calculate"] = (values) => {
	const weight = Math.max(toNumber(values.weight), 1);
	const height = Math.max(toNumber(values.height), 1);
	const bmi = getBmi(weight, height);
	const category = getBmiCategory(bmi);
	const healthyMin = 18.5 * (height / 100) ** 2;
	const healthyMax = 24.9 * (height / 100) ** 2;

	return {
		metrics: [
			{ label: "BMI", value: formatNumber(bmi), tone: category.tone },
			{ label: "Category", value: category.label, tone: category.tone },
			{ label: "Healthy Range", value: `${formatKg(healthyMin)} - ${formatKg(healthyMax)}` },
		],
	};
};

const calculateCalorie: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const bmr = getBmr(sex, Math.max(toNumber(values.weight), 1), Math.max(toNumber(values.height), 1), Math.max(toNumber(values.age), 1));
	const tdee = bmr * Math.max(toNumber(values.activity), 1);
	const goal = String(values.goal);
	const adjustment = goal === "loss" ? -500 : goal === "gain" ? 300 : 0;

	return {
		metrics: [
			{ label: "Maintenance", value: formatCalories(tdee), tone: "success" },
			{ label: "Target Calories", value: formatCalories(tdee + adjustment), tone: adjustment === 0 ? "default" : "warning" },
			{ label: "BMR", value: formatCalories(bmr) },
		],
		note: "Estimates are based on the Mifflin-St Jeor equation and activity multiplier.",
	};
};

const calculateBodyFat: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const weight = Math.max(toNumber(values.weight), 1);
	const bodyFat = calculateNavyBodyFat(
		sex,
		Math.max(toNumber(values.height), 1),
		Math.max(toNumber(values.neck), 1),
		Math.max(toNumber(values.waist), 1),
		Math.max(toNumber(values.hip), 1),
	);
	const fatMass = weight * (bodyFat / 100);

	return {
		metrics: [
			{ label: "Body Fat", value: formatPercent(bodyFat), tone: bodyFat < 32 ? "success" : "warning" },
			{ label: "Category", value: getBodyFatCategory(sex, bodyFat) },
			{ label: "Fat Mass", value: formatKg(fatMass) },
			{ label: "Lean Mass", value: formatKg(weight - fatMass) },
		],
		note: "Uses the US Navy circumference method with metric inputs converted internally.",
	};
};

const calculateBmr: IHealthCalculatorDefinition["calculate"] = (values) => {
	const bmr = getBmr(
		getSex(values.sex),
		Math.max(toNumber(values.weight), 1),
		Math.max(toNumber(values.height), 1),
		Math.max(toNumber(values.age), 1),
	);

	return {
		metrics: [
			{ label: "BMR", value: formatCalories(bmr), tone: "success" },
			{ label: "Sedentary", value: formatCalories(bmr * 1.2) },
			{ label: "Moderately Active", value: formatCalories(bmr * 1.55) },
		],
	};
};

const calculateIdealWeight: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const heightIn = Math.max(toNumber(values.height), 1) / 2.54;
	const overFiveFeet = Math.max(heightIn - 60, 0);
	const devine = (sex === "male" ? 50 : 45.5) + 2.3 * overFiveFeet;
	const robinson = (sex === "male" ? 52 : 49) + (sex === "male" ? 1.9 : 1.7) * overFiveFeet;
	const miller = (sex === "male" ? 56.2 : 53.1) + (sex === "male" ? 1.41 : 1.36) * overFiveFeet;
	const average = (devine + robinson + miller) / 3;

	return {
		metrics: [
			{ label: "Average Ideal", value: formatKg(average), tone: "success" },
			{ label: "Devine", value: formatKg(devine) },
			{ label: "Robinson", value: formatKg(robinson) },
		],
		tableColumns: metricColumns,
		tableData: buildRows([
			["Devine", formatKg(devine)],
			["Robinson", formatKg(robinson)],
			["Miller", formatKg(miller)],
			["Average", formatKg(average)],
		]),
	};
};

const calculatePace: IHealthCalculatorDefinition["calculate"] = (values) => {
	const distance = Math.max(toNumber(values.distance), 0.01);
	const totalSeconds = Math.max(toNumber(values.hours) * 3600 + toNumber(values.minutes) * 60 + toNumber(values.seconds), 1);
	const paceSecondsPerKm = totalSeconds / distance;
	const speedKmh = distance / (totalSeconds / 3600);

	return {
		metrics: [
			{ label: "Pace", value: `${formatDuration(paceSecondsPerKm)} / km`, tone: "success" },
			{ label: "Pace / Mile", value: `${formatDuration(paceSecondsPerKm * 1.60934)} / mi` },
			{ label: "Speed", value: `${formatNumber(speedKmh)} km/h` },
			{ label: "5K Projection", value: formatDuration(paceSecondsPerKm * 5) },
		],
	};
};

const calculateArmyBodyFat: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const age = Math.max(toNumber(values.age), 17);
	const bodyFat = calculateNavyBodyFat(
		sex,
		Math.max(toNumber(values.height), 1),
		Math.max(toNumber(values.neck), 1),
		Math.max(toNumber(values.waist), 1),
		Math.max(toNumber(values.hip), 1),
	);
	const maxAllowed =
		sex === "male" ? (age <= 20 ? 20 : age <= 27 ? 22 : age <= 39 ? 24 : 26) : age <= 20 ? 30 : age <= 27 ? 32 : age <= 39 ? 34 : 36;

	return {
		metrics: [
			{ label: "Army Body Fat", value: formatPercent(bodyFat), tone: bodyFat <= maxAllowed ? "success" : "warning" },
			{ label: "Reference Max", value: formatPercent(maxAllowed) },
			{
				label: "Status",
				value: bodyFat <= maxAllowed ? "Within reference" : "Above reference",
				tone: bodyFat <= maxAllowed ? "success" : "warning",
			},
		],
		note: "Reference max uses common US Army screening table ranges; official assessments may differ.",
	};
};

const calculateLeanBodyMass: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const weight = Math.max(toNumber(values.weight), 1);
	const height = Math.max(toNumber(values.height), 1);
	const bodyFat = clamp(toNumber(values.bodyFat), 2, 75);
	const boer = sex === "male" ? 0.407 * weight + 0.267 * height - 19.2 : 0.252 * weight + 0.473 * height - 48.3;
	const byBodyFat = weight * (1 - bodyFat / 100);

	return {
		metrics: [
			{ label: "Lean Body Mass", value: formatKg(byBodyFat), tone: "success" },
			{ label: "Boer Estimate", value: formatKg(boer) },
			{ label: "Fat Mass", value: formatKg(weight - byBodyFat) },
		],
	};
};

const calculateHealthyWeight: IHealthCalculatorDefinition["calculate"] = (values) => {
	const height = Math.max(toNumber(values.height), 1);
	const currentWeight = Math.max(toNumber(values.weight), 1);
	const minWeight = 18.5 * (height / 100) ** 2;
	const maxWeight = 24.9 * (height / 100) ** 2;
	const bmi = getBmi(currentWeight, height);
	const category = getBmiCategory(bmi);
	const adjustment = currentWeight < minWeight ? minWeight - currentWeight : currentWeight > maxWeight ? currentWeight - maxWeight : 0;

	return {
		metrics: [
			{ label: "Healthy Range", value: `${formatKg(minWeight)} - ${formatKg(maxWeight)}`, tone: "success" },
			{ label: "Current BMI", value: formatNumber(bmi), tone: category.tone },
			{ label: "Status", value: category.label, tone: category.tone },
			{ label: "Adjustment", value: adjustment ? formatKg(adjustment) : "In range" },
		],
	};
};

const calculateCaloriesBurned: IHealthCalculatorDefinition["calculate"] = (values) => {
	const weight = Math.max(toNumber(values.weight), 1);
	const minutes = Math.max(toNumber(values.minutes), 1);
	const met = Math.max(toNumber(values.activity), 1);
	const calories = (met * 3.5 * weight * minutes) / 200;

	return {
		metrics: [
			{ label: "Calories Burned", value: formatCalories(calories), tone: "success" },
			{ label: "Per Hour", value: formatCalories((calories / minutes) * 60) },
			{ label: "MET", value: formatNumber(met) },
		],
	};
};

const calculateOneRepMax: IHealthCalculatorDefinition["calculate"] = (values) => {
	const weight = Math.max(toNumber(values.weight), 1);
	const reps = clamp(Math.trunc(toNumber(values.reps)), 1, 36);
	const epley = weight * (1 + reps / 30);
	const brzycki = weight * (36 / (37 - reps));
	const average = (epley + brzycki) / 2;

	return {
		metrics: [
			{ label: "Estimated 1RM", value: formatKg(average), tone: "success" },
			{ label: "Epley", value: formatKg(epley) },
			{ label: "Brzycki", value: formatKg(brzycki) },
		],
		tableColumns: metricColumns,
		tableData: buildRows([95, 90, 85, 80, 75, 70, 65, 60].map((percent) => [`${percent}%`, formatKg(average * (percent / 100))])),
	};
};

const calculateTargetHeartRate: IHealthCalculatorDefinition["calculate"] = (values) => {
	const age = Math.max(toNumber(values.age), 1);
	const resting = Math.max(toNumber(values.restingHeartRate), 30);
	const low = clamp(toNumber(values.lowIntensity), 1, 100) / 100;
	const high = clamp(toNumber(values.highIntensity), 1, 100) / 100;
	const maxHeartRate = 220 - age;
	const reserve = maxHeartRate - resting;
	const lowTarget = reserve * low + resting;
	const highTarget = reserve * high + resting;

	return {
		metrics: [
			{ label: "Target Zone", value: `${formatNumber(lowTarget, 0)} - ${formatNumber(highTarget, 0)} bpm`, tone: "success" },
			{ label: "Max Heart Rate", value: `${formatNumber(maxHeartRate, 0)} bpm` },
			{ label: "Heart Rate Reserve", value: `${formatNumber(reserve, 0)} bpm` },
		],
	};
};

const calculateMacro: IHealthCalculatorDefinition["calculate"] = (values) => {
	const calories = Math.max(toNumber(values.calories), 1);
	const goal = String(values.goal);
	const ratios =
		goal === "cut"
			? { protein: 0.35, carbs: 0.35, fat: 0.3 }
			: goal === "bulk"
				? { protein: 0.25, carbs: 0.5, fat: 0.25 }
				: goal === "low-carb"
					? { protein: 0.35, carbs: 0.2, fat: 0.45 }
					: { protein: 0.3, carbs: 0.4, fat: 0.3 };

	return {
		metrics: [
			{ label: "Protein", value: `${formatNumber((calories * ratios.protein) / 4, 0)} g`, tone: "success" },
			{ label: "Carbs", value: `${formatNumber((calories * ratios.carbs) / 4, 0)} g` },
			{ label: "Fat", value: `${formatNumber((calories * ratios.fat) / 9, 0)} g` },
		],
		tableColumns: metricColumns,
		tableData: buildRows([
			["Protein calories", formatCalories(calories * ratios.protein)],
			["Carbohydrate calories", formatCalories(calories * ratios.carbs)],
			["Fat calories", formatCalories(calories * ratios.fat)],
		]),
	};
};

const calculateCarbohydrate: IHealthCalculatorDefinition["calculate"] = (values) => {
	const calories = Math.max(toNumber(values.calories), 1);
	const percent = clamp(toNumber(values.percent), 1, 90);
	const grams = (calories * (percent / 100)) / 4;

	return {
		metrics: [
			{ label: "Carbohydrates", value: `${formatNumber(grams, 0)} g`, tone: "success" },
			{ label: "Carb Calories", value: formatCalories(grams * 4) },
			{ label: "45-65% Range", value: `${formatNumber((calories * 0.45) / 4, 0)} - ${formatNumber((calories * 0.65) / 4, 0)} g` },
		],
	};
};

const calculateProtein: IHealthCalculatorDefinition["calculate"] = (values) => {
	const weight = Math.max(toNumber(values.weight), 1);
	const goal = String(values.goal);
	const factor = goal === "active" ? 1.2 : goal === "muscle" ? 1.6 : goal === "athlete" ? 2 : 0.8;
	const target = weight * factor;

	return {
		metrics: [
			{ label: "Protein Target", value: `${formatNumber(target, 0)} g`, tone: "success" },
			{ label: "Per kg", value: `${formatNumber(factor)} g/kg` },
			{ label: "Daily Range", value: `${formatNumber(target * 0.85, 0)} - ${formatNumber(target * 1.15, 0)} g` },
		],
	};
};

const calculateFatIntake: IHealthCalculatorDefinition["calculate"] = (values) => {
	const calories = Math.max(toNumber(values.calories), 1);
	const percent = clamp(toNumber(values.percent), 1, 70);
	const grams = (calories * (percent / 100)) / 9;

	return {
		metrics: [
			{ label: "Fat Intake", value: `${formatNumber(grams, 0)} g`, tone: "success" },
			{ label: "Fat Calories", value: formatCalories(grams * 9) },
			{ label: "20-35% Range", value: `${formatNumber((calories * 0.2) / 9, 0)} - ${formatNumber((calories * 0.35) / 9, 0)} g` },
		],
	};
};

const calculateTdee: IHealthCalculatorDefinition["calculate"] = (values) => {
	const bmr = getBmr(
		getSex(values.sex),
		Math.max(toNumber(values.weight), 1),
		Math.max(toNumber(values.height), 1),
		Math.max(toNumber(values.age), 1),
	);
	const factor = Math.max(toNumber(values.activity), 1);
	const tdee = bmr * factor;

	return {
		metrics: [
			{ label: "TDEE", value: formatCalories(tdee), tone: "success" },
			{ label: "BMR", value: formatCalories(bmr) },
			{ label: "Fat Loss Target", value: formatCalories(tdee - 500), tone: "warning" },
			{ label: "Gain Target", value: formatCalories(tdee + 300) },
		],
	};
};

const calculateGfr: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const age = Math.max(toNumber(values.age), 1);
	const creatinine = Math.max(toNumber(values.creatinine), 0.1);
	const kappa = sex === "female" ? 0.7 : 0.9;
	const alpha = sex === "female" ? -0.241 : -0.302;
	const ratio = creatinine / kappa;
	const egfr = 142 * Math.min(ratio, 1) ** alpha * Math.max(ratio, 1) ** -1.2 * 0.9938 ** age * (sex === "female" ? 1.012 : 1);
	const stage = egfr >= 90 ? "G1" : egfr >= 60 ? "G2" : egfr >= 45 ? "G3a" : egfr >= 30 ? "G3b" : egfr >= 15 ? "G4" : "G5";

	return {
		metrics: [
			{ label: "eGFR", value: `${formatNumber(egfr, 0)} mL/min/1.73m2`, tone: egfr >= 60 ? "success" : "warning" },
			{ label: "Stage", value: stage },
			{ label: "Creatinine", value: `${formatNumber(creatinine, 2)} mg/dL` },
		],
		note: "Uses the CKD-EPI 2021 creatinine equation. Lab interpretation should come from a clinician.",
	};
};

const calculateBodyType: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const chest = Math.max(toNumber(values.chest), 1);
	const waist = Math.max(toNumber(values.waist), 1);
	const hip = Math.max(toNumber(values.hip), 1);
	const whr = waist / hip;
	const shape =
		waist >= Math.max(chest, hip) * 0.9
			? "Apple"
			: hip > chest * 1.05
				? "Pear"
				: chest > hip * 1.05
					? "Inverted triangle"
					: waist <= Math.min(chest, hip) * 0.75
						? "Hourglass"
						: "Rectangle";
	const riskLimit = sex === "male" ? 0.9 : 0.85;

	return {
		metrics: [
			{ label: "Body Type", value: shape, tone: "success" },
			{ label: "Waist-Hip Ratio", value: formatNumber(whr, 2), tone: whr <= riskLimit ? "success" : "warning" },
			{ label: "Reference Limit", value: formatNumber(riskLimit, 2) },
		],
	};
};

const calculateBodySurfaceArea: IHealthCalculatorDefinition["calculate"] = (values) => {
	const height = Math.max(toNumber(values.height), 1);
	const weight = Math.max(toNumber(values.weight), 1);
	const mosteller = Math.sqrt((height * weight) / 3600);
	const dubois = 0.007184 * height ** 0.725 * weight ** 0.425;
	const haycock = 0.024265 * height ** 0.3964 * weight ** 0.5378;

	return {
		metrics: [
			{ label: "Mosteller BSA", value: `${formatNumber(mosteller, 2)} m2`, tone: "success" },
			{ label: "Du Bois", value: `${formatNumber(dubois, 2)} m2` },
			{ label: "Haycock", value: `${formatNumber(haycock, 2)} m2` },
		],
	};
};

const calculateBac: IHealthCalculatorDefinition["calculate"] = (values) => {
	const sex = getSex(values.sex);
	const drinks = Math.max(toNumber(values.drinks), 0);
	const volumeMl = Math.max(toNumber(values.volume), 0);
	const abv = Math.max(toNumber(values.abv), 0);
	const weight = Math.max(toNumber(values.weight), 1);
	const hours = Math.max(toNumber(values.hours), 0);
	const alcoholGrams = drinks * volumeMl * (abv / 100) * 0.789;
	const widmark = sex === "male" ? 0.68 : 0.55;
	const bac = Math.max((alcoholGrams / (weight * 1000 * widmark)) * 100 - 0.015 * hours, 0);

	return {
		metrics: [
			{ label: "Estimated BAC", value: `${formatNumber(bac, 3)}%`, tone: bac >= 0.05 ? "danger" : bac > 0 ? "warning" : "success" },
			{ label: "Alcohol", value: `${formatNumber(alcoholGrams, 0)} g` },
			{ label: "Time to Zero", value: `${formatNumber(bac / 0.015, 1)} h` },
		],
		note: "BAC is only a rough Widmark estimate; legal limits and metabolism vary.",
	};
};

const pregnancyDatesFromLmp = (lmpValue: IHealthInputValue, cycleLengthValue: IHealthInputValue) => {
	const lmp = parseDateInput(lmpValue);
	const cycleLength = Math.max(toNumber(cycleLengthValue), 20);
	const adjustedLmp = addDays(lmp, cycleLength - 28);
	const dueDate = addDays(adjustedLmp, 280);

	return { lmp, adjustedLmp, dueDate };
};

const calculatePregnancy: IHealthCalculatorDefinition["calculate"] = (values) => {
	const { adjustedLmp, dueDate } = pregnancyDatesFromLmp(values.lastPeriod, values.cycleLength);
	const gestationalDays = Math.max(daysBetween(adjustedLmp, today), 0);
	const weeks = Math.floor(gestationalDays / 7);
	const days = gestationalDays % 7;
	const daysLeft = Math.max(daysBetween(today, dueDate), 0);
	const trimester = weeks < 13 ? "First" : weeks < 28 ? "Second" : "Third";

	return {
		metrics: [
			{ label: "Due Date", value: formatDate(dueDate), tone: "success" },
			{ label: "Gestational Age", value: `${weeks}w ${days}d` },
			{ label: "Trimester", value: trimester },
			{ label: "Days Left", value: `${daysLeft} days` },
		],
	};
};

const getPregnancyGainRange = (bmi: number, pregnancyType: string) => {
	if (pregnancyType === "twins") {
		if (bmi >= 30) return { min: 11.3, max: 19.1 };
		if (bmi >= 25) return { min: 14.1, max: 22.7 };
		return { min: 16.8, max: 24.5 };
	}

	if (bmi < 18.5) return { min: 12.5, max: 18 };
	if (bmi < 25) return { min: 11.5, max: 16 };
	if (bmi < 30) return { min: 7, max: 11.5 };
	return { min: 5, max: 9 };
};

const calculatePregnancyWeightGain: IHealthCalculatorDefinition["calculate"] = (values) => {
	const preWeight = Math.max(toNumber(values.preWeight), 1);
	const currentWeight = Math.max(toNumber(values.currentWeight), 1);
	const height = Math.max(toNumber(values.height), 1);
	const week = clamp(toNumber(values.week), 1, 42);
	const bmi = getBmi(preWeight, height);
	const range = getPregnancyGainRange(bmi, String(values.pregnancyType));
	const gained = currentWeight - preWeight;
	const progress = week / 40;

	return {
		metrics: [
			{ label: "Weight Gained", value: formatKg(gained), tone: gained >= 0 ? "success" : "warning" },
			{ label: "Total Range", value: `${formatKg(range.min)} - ${formatKg(range.max)}` },
			{ label: "Approx. By Week", value: `${formatKg(range.min * progress)} - ${formatKg(range.max * progress)}` },
			{ label: "Pre-pregnancy BMI", value: formatNumber(bmi) },
		],
		note: "Pregnancy weight-gain ranges are broad screening estimates and depend on clinical context.",
	};
};

const calculatePregnancyConception: IHealthCalculatorDefinition["calculate"] = (values) => {
	const dueDate = parseDateInput(values.dueDate);
	const conception = addDays(dueDate, -266);
	const lmp = addDays(dueDate, -280);

	return {
		metrics: [
			{ label: "Estimated Conception", value: formatDate(conception), tone: "success" },
			{ label: "Fertile Window", value: `${formatDate(addDays(conception, -2))} - ${formatDate(addDays(conception, 2))}` },
			{ label: "Estimated LMP", value: formatDate(lmp) },
		],
	};
};

const calculateDueDate: IHealthCalculatorDefinition["calculate"] = (values) => {
	const { dueDate } = pregnancyDatesFromLmp(values.lastPeriod, values.cycleLength);
	const conception = addDays(dueDate, -266);

	return {
		metrics: [
			{ label: "Due Date", value: formatDate(dueDate), tone: "success" },
			{ label: "Estimated Conception", value: formatDate(conception) },
			{ label: "Days Until Due", value: `${Math.max(daysBetween(today, dueDate), 0)} days` },
		],
	};
};

const getCycleDates = (
	lastPeriodValue: IHealthInputValue,
	cycleLengthValue: IHealthInputValue,
	lutealLengthValue: IHealthInputValue = 14,
) => {
	const lastPeriod = parseDateInput(lastPeriodValue);
	const cycleLength = Math.max(toNumber(cycleLengthValue), 20);
	const lutealLength = clamp(toNumber(lutealLengthValue), 10, 18);
	const nextPeriod = addDays(lastPeriod, cycleLength);
	const ovulation = addDays(lastPeriod, cycleLength - lutealLength);
	const fertileStart = addDays(ovulation, -5);
	const fertileEnd = addDays(ovulation, 1);

	return { lastPeriod, nextPeriod, ovulation, fertileStart, fertileEnd };
};

const calculateOvulation: IHealthCalculatorDefinition["calculate"] = (values) => {
	const dates = getCycleDates(values.lastPeriod, values.cycleLength, values.lutealLength);

	return {
		metrics: [
			{ label: "Ovulation", value: formatDate(dates.ovulation), tone: "success" },
			{ label: "Fertile Window", value: `${formatDate(dates.fertileStart)} - ${formatDate(dates.fertileEnd)}` },
			{ label: "Next Period", value: formatDate(dates.nextPeriod) },
		],
	};
};

const calculateConception: IHealthCalculatorDefinition["calculate"] = (values) => {
	const dates = getCycleDates(values.lastPeriod, values.cycleLength, values.lutealLength);
	const possibleDueDate = addDays(dates.ovulation, 266);

	return {
		metrics: [
			{ label: "Best Estimate", value: formatDate(dates.ovulation), tone: "success" },
			{ label: "Fertile Window", value: `${formatDate(dates.fertileStart)} - ${formatDate(dates.fertileEnd)}` },
			{ label: "Possible Due Date", value: formatDate(possibleDueDate) },
		],
	};
};

const calculatePeriod: IHealthCalculatorDefinition["calculate"] = (values) => {
	const periodLength = clamp(toNumber(values.periodLength), 1, 14);
	const dates = getCycleDates(values.lastPeriod, values.cycleLength);
	const nextPeriodEnd = addDays(dates.nextPeriod, periodLength - 1);

	return {
		metrics: [
			{ label: "Next Period", value: formatDate(dates.nextPeriod), tone: "success" },
			{ label: "Period Ends", value: formatDate(nextPeriodEnd) },
			{ label: "Ovulation", value: formatDate(dates.ovulation) },
			{ label: "Fertile Window", value: `${formatDate(dates.fertileStart)} - ${formatDate(dates.fertileEnd)}` },
		],
	};
};

const commonBodyDefaults = { sex: "male", age: 30, height: 170, weight: 70 };
const commonBodyInputs: IHealthInputDefinition[] = [
	{ key: "sex", label: "Sex", type: "select", options: sexOptions },
	{ key: "age", label: "Age", min: 1, max: 120, step: 1 },
	{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
	{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
];

const circumferenceInputs: IHealthInputDefinition[] = [
	{ key: "sex", label: "Sex", type: "select", options: sexOptions },
	{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
	{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
	{ key: "neck", label: "Neck", addonAfter: "cm", min: 1, step: 0.5 },
	{ key: "waist", label: "Waist", addonAfter: "cm", min: 1, step: 0.5 },
	{ key: "hip", label: "Hip", addonAfter: "cm", min: 1, step: 0.5 },
];

const periodDefaults = { lastPeriod: formatDateInput(defaultLastPeriod), cycleLength: 28, lutealLength: 14 };

const healthFitnessCalculators: Record<IHealthFitnessToolId, IHealthCalculatorDefinition> = {
	"bmi-calculator": {
		id: "bmi-calculator",
		title: "BMI Calculator",
		defaults: { height: 170, weight: 70 },
		inputs: [
			{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
			{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
		],
		calculate: calculateBmi,
	},
	"calorie-calculator": {
		id: "calorie-calculator",
		title: "Calorie Calculator",
		defaults: { ...commonBodyDefaults, activity: "1.55", goal: "maintain" },
		inputs: [
			...commonBodyInputs,
			{ key: "activity", label: "Activity", type: "select", options: activityOptions },
			{ key: "goal", label: "Goal", type: "select", options: calorieGoalOptions },
		],
		calculate: calculateCalorie,
	},
	"body-fat-calculator": {
		id: "body-fat-calculator",
		title: "Body Fat Calculator",
		defaults: { sex: "male", height: 170, weight: 70, neck: 38, waist: 84, hip: 95 },
		inputs: circumferenceInputs,
		calculate: calculateBodyFat,
	},
	"bmr-calculator": {
		id: "bmr-calculator",
		title: "BMR Calculator",
		defaults: commonBodyDefaults,
		inputs: commonBodyInputs,
		calculate: calculateBmr,
	},
	"ideal-weight-calculator": {
		id: "ideal-weight-calculator",
		title: "Ideal Weight Calculator",
		defaults: { sex: "male", height: 170 },
		inputs: [
			{ key: "sex", label: "Sex", type: "select", options: sexOptions },
			{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
		],
		calculate: calculateIdealWeight,
	},
	"pace-calculator": {
		id: "pace-calculator",
		title: "Pace Calculator",
		defaults: { distance: 5, hours: 0, minutes: 30, seconds: 0 },
		inputs: [
			{ key: "distance", label: "Distance", addonAfter: "km", min: 0.01, step: 0.1 },
			{ key: "hours", label: "Hours", min: 0, step: 1 },
			{ key: "minutes", label: "Minutes", min: 0, step: 1 },
			{ key: "seconds", label: "Seconds", min: 0, step: 1 },
		],
		calculate: calculatePace,
	},
	"army-body-fat-calculator": {
		id: "army-body-fat-calculator",
		title: "Army Body Fat Calculator",
		defaults: { sex: "male", age: 30, height: 170, neck: 38, waist: 84, hip: 95 },
		inputs: [
			{ key: "sex", label: "Sex", type: "select", options: sexOptions },
			{ key: "age", label: "Age", min: 17, max: 80, step: 1 },
			{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
			{ key: "neck", label: "Neck", addonAfter: "cm", min: 1, step: 0.5 },
			{ key: "waist", label: "Waist", addonAfter: "cm", min: 1, step: 0.5 },
			{ key: "hip", label: "Hip", addonAfter: "cm", min: 1, step: 0.5 },
		],
		calculate: calculateArmyBodyFat,
	},
	"lean-body-mass-calculator": {
		id: "lean-body-mass-calculator",
		title: "Lean Body Mass Calculator",
		defaults: { sex: "male", height: 170, weight: 70, bodyFat: 20 },
		inputs: [
			{ key: "sex", label: "Sex", type: "select", options: sexOptions },
			{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
			{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
			{ key: "bodyFat", label: "Body Fat", addonAfter: "%", min: 2, max: 75, step: 0.5 },
		],
		calculate: calculateLeanBodyMass,
	},
	"healthy-weight-calculator": {
		id: "healthy-weight-calculator",
		title: "Healthy Weight Calculator",
		defaults: { height: 170, weight: 70 },
		inputs: [
			{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
			{ key: "weight", label: "Current Weight", addonAfter: "kg", min: 1, step: 0.5 },
		],
		calculate: calculateHealthyWeight,
	},
	"calories-burned-calculator": {
		id: "calories-burned-calculator",
		title: "Calories Burned Calculator",
		defaults: { weight: 70, minutes: 45, activity: "7.5" },
		inputs: [
			{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
			{ key: "minutes", label: "Duration", addonAfter: "min", min: 1, step: 5 },
			{ key: "activity", label: "Activity", type: "select", options: exerciseOptions },
		],
		calculate: calculateCaloriesBurned,
	},
	"one-rep-max-calculator": {
		id: "one-rep-max-calculator",
		title: "One Rep Max Calculator",
		defaults: { weight: 80, reps: 5 },
		inputs: [
			{ key: "weight", label: "Lifted Weight", addonAfter: "kg", min: 1, step: 0.5 },
			{ key: "reps", label: "Repetitions", min: 1, max: 36, step: 1 },
		],
		calculate: calculateOneRepMax,
	},
	"target-heart-rate-calculator": {
		id: "target-heart-rate-calculator",
		title: "Target Heart Rate Calculator",
		defaults: { age: 30, restingHeartRate: 65, lowIntensity: 60, highIntensity: 80 },
		inputs: [
			{ key: "age", label: "Age", min: 1, max: 120, step: 1 },
			{ key: "restingHeartRate", label: "Resting Heart Rate", addonAfter: "bpm", min: 30, step: 1 },
			{ key: "lowIntensity", label: "Low Intensity", addonAfter: "%", min: 1, max: 100, step: 1 },
			{ key: "highIntensity", label: "High Intensity", addonAfter: "%", min: 1, max: 100, step: 1 },
		],
		calculate: calculateTargetHeartRate,
	},
	"macro-calculator": {
		id: "macro-calculator",
		title: "Macro Calculator",
		defaults: { calories: 2200, goal: "balanced" },
		inputs: [
			{ key: "calories", label: "Daily Calories", addonAfter: "kcal", min: 1, step: 50 },
			{ key: "goal", label: "Macro Goal", type: "select", options: macroGoalOptions },
		],
		calculate: calculateMacro,
	},
	"carbohydrate-calculator": {
		id: "carbohydrate-calculator",
		title: "Carbohydrate Calculator",
		defaults: { calories: 2200, percent: 50 },
		inputs: [
			{ key: "calories", label: "Daily Calories", addonAfter: "kcal", min: 1, step: 50 },
			{ key: "percent", label: "Carb Calories", addonAfter: "%", min: 1, max: 90, step: 1 },
		],
		calculate: calculateCarbohydrate,
	},
	"protein-calculator": {
		id: "protein-calculator",
		title: "Protein Calculator",
		defaults: { weight: 70, goal: "active" },
		inputs: [
			{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
			{ key: "goal", label: "Goal", type: "select", options: proteinGoalOptions },
		],
		calculate: calculateProtein,
	},
	"fat-intake-calculator": {
		id: "fat-intake-calculator",
		title: "Fat Intake Calculator",
		defaults: { calories: 2200, percent: 30 },
		inputs: [
			{ key: "calories", label: "Daily Calories", addonAfter: "kcal", min: 1, step: 50 },
			{ key: "percent", label: "Fat Calories", addonAfter: "%", min: 1, max: 70, step: 1 },
		],
		calculate: calculateFatIntake,
	},
	"tdee-calculator": {
		id: "tdee-calculator",
		title: "TDEE Calculator",
		defaults: { ...commonBodyDefaults, activity: "1.55" },
		inputs: [...commonBodyInputs, { key: "activity", label: "Activity", type: "select", options: activityOptions }],
		calculate: calculateTdee,
	},
	"gfr-calculator": {
		id: "gfr-calculator",
		title: "GFR Calculator",
		defaults: { sex: "male", age: 45, creatinine: 1 },
		inputs: [
			{ key: "sex", label: "Sex", type: "select", options: sexOptions },
			{ key: "age", label: "Age", min: 1, max: 120, step: 1 },
			{ key: "creatinine", label: "Serum Creatinine", addonAfter: "mg/dL", min: 0.1, step: 0.1 },
		],
		calculate: calculateGfr,
	},
	"body-type-calculator": {
		id: "body-type-calculator",
		title: "Body Type Calculator",
		defaults: { sex: "female", chest: 92, waist: 72, hip: 98 },
		inputs: [
			{ key: "sex", label: "Sex", type: "select", options: sexOptions },
			{ key: "chest", label: "Chest / Bust", addonAfter: "cm", min: 1, step: 0.5 },
			{ key: "waist", label: "Waist", addonAfter: "cm", min: 1, step: 0.5 },
			{ key: "hip", label: "Hip", addonAfter: "cm", min: 1, step: 0.5 },
		],
		calculate: calculateBodyType,
	},
	"body-surface-area-calculator": {
		id: "body-surface-area-calculator",
		title: "Body Surface Area Calculator",
		defaults: { height: 170, weight: 70 },
		inputs: [
			{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
			{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
		],
		calculate: calculateBodySurfaceArea,
	},
	"bac-calculator": {
		id: "bac-calculator",
		title: "BAC Calculator",
		defaults: { sex: "male", weight: 70, drinks: 2, volume: 330, abv: 5, hours: 2 },
		inputs: [
			{ key: "sex", label: "Sex", type: "select", options: sexOptions },
			{ key: "weight", label: "Weight", addonAfter: "kg", min: 1, step: 0.5 },
			{ key: "drinks", label: "Drinks", min: 0, step: 1 },
			{ key: "volume", label: "Volume / Drink", addonAfter: "ml", min: 0, step: 10 },
			{ key: "abv", label: "ABV", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "hours", label: "Hours Since First Drink", addonAfter: "h", min: 0, step: 0.25 },
		],
		calculate: calculateBac,
	},
	"pregnancy-calculator": {
		id: "pregnancy-calculator",
		title: "Pregnancy Calculator",
		defaults: { lastPeriod: formatDateInput(defaultLastPeriod), cycleLength: 28 },
		inputs: [
			{ key: "lastPeriod", label: "Last Period", type: "date" },
			{ key: "cycleLength", label: "Cycle Length", addonAfter: "days", min: 20, max: 45, step: 1 },
		],
		calculate: calculatePregnancy,
	},
	"pregnancy-weight-gain-calculator": {
		id: "pregnancy-weight-gain-calculator",
		title: "Pregnancy Weight Gain Calculator",
		defaults: { preWeight: 62, currentWeight: 68, height: 162, week: 24, pregnancyType: "singleton" },
		inputs: [
			{ key: "preWeight", label: "Pre-pregnancy Weight", addonAfter: "kg", min: 1, step: 0.5 },
			{ key: "currentWeight", label: "Current Weight", addonAfter: "kg", min: 1, step: 0.5 },
			{ key: "height", label: "Height", addonAfter: "cm", min: 1, step: 1 },
			{ key: "week", label: "Pregnancy Week", min: 1, max: 42, step: 1 },
			{ key: "pregnancyType", label: "Pregnancy Type", type: "select", options: pregnancyTypeOptions },
		],
		calculate: calculatePregnancyWeightGain,
	},
	"pregnancy-conception-calculator": {
		id: "pregnancy-conception-calculator",
		title: "Pregnancy Conception Calculator",
		defaults: { dueDate: formatDateInput(defaultDueDate) },
		inputs: [{ key: "dueDate", label: "Due Date", type: "date" }],
		calculate: calculatePregnancyConception,
	},
	"due-date-calculator": {
		id: "due-date-calculator",
		title: "Due Date Calculator",
		defaults: { lastPeriod: formatDateInput(defaultLastPeriod), cycleLength: 28 },
		inputs: [
			{ key: "lastPeriod", label: "Last Period", type: "date" },
			{ key: "cycleLength", label: "Cycle Length", addonAfter: "days", min: 20, max: 45, step: 1 },
		],
		calculate: calculateDueDate,
	},
	"ovulation-calculator": {
		id: "ovulation-calculator",
		title: "Ovulation Calculator",
		defaults: periodDefaults,
		inputs: [
			{ key: "lastPeriod", label: "Last Period", type: "date" },
			{ key: "cycleLength", label: "Cycle Length", addonAfter: "days", min: 20, max: 45, step: 1 },
			{ key: "lutealLength", label: "Luteal Phase", addonAfter: "days", min: 10, max: 18, step: 1 },
		],
		calculate: calculateOvulation,
	},
	"conception-calculator": {
		id: "conception-calculator",
		title: "Conception Calculator",
		defaults: periodDefaults,
		inputs: [
			{ key: "lastPeriod", label: "Last Period", type: "date" },
			{ key: "cycleLength", label: "Cycle Length", addonAfter: "days", min: 20, max: 45, step: 1 },
			{ key: "lutealLength", label: "Luteal Phase", addonAfter: "days", min: 10, max: 18, step: 1 },
		],
		calculate: calculateConception,
	},
	"period-calculator": {
		id: "period-calculator",
		title: "Period Calculator",
		defaults: { ...periodDefaults, periodLength: 5 },
		inputs: [
			{ key: "lastPeriod", label: "Last Period", type: "date" },
			{ key: "cycleLength", label: "Cycle Length", addonAfter: "days", min: 20, max: 45, step: 1 },
			{ key: "periodLength", label: "Period Length", addonAfter: "days", min: 1, max: 14, step: 1 },
		],
		calculate: calculatePeriod,
	},
};

const HealthInput = ({
	input,
	value,
	onChange,
}: {
	input: IHealthInputDefinition;
	value: IHealthInputValue;
	onChange: (value: IHealthInputValue) => void;
}) => {
	if (input.type === "select") {
		return <Select value={String(value)} options={input.options} onChange={onChange} />;
	}

	if (input.type === "date") {
		const pickerValue = String(value) ? dayjs(String(value), "YYYY-MM-DD") : null;

		return (
			<DatePicker
				value={pickerValue?.isValid() ? pickerValue : null}
				onChange={(nextValue) => onChange(nextValue ? nextValue.format("YYYY-MM-DD") : "")}
				format="YYYY-MM-DD"
				style={{ width: "100%" }}
			/>
		);
	}

	const numberInput = (
		<InputNumber
			value={Number(value)}
			onChange={(nextValue) => onChange(nextValue ?? 0)}
			min={input.min}
			max={input.max}
			step={input.step}
			prefix={input.prefix}
			style={{ width: "100%" }}
		/>
	);

	if (!input.addonAfter) {
		return numberInput;
	}

	return (
		<Space.Compact style={{ width: "100%" }}>
			{numberInput}
			<Button disabled>{input.addonAfter}</Button>
		</Space.Compact>
	);
};

export const HealthFitnessTool = ({ toolId }: { toolId: IHealthFitnessToolId }) => {
	const calculator = healthFitnessCalculators[toolId];
	const [values, setValues] = useState<Record<string, IHealthInputValue>>(calculator.defaults);
	const result = calculator.calculate(values);

	const updateValue = (key: string, value: IHealthInputValue) => setValues((currentValues) => ({ ...currentValues, [key]: value }));
	const resetValues = () => setValues(calculator.defaults);

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9} xl={8}>
						<Card
							title="Inputs"
							extra={
								<Button size="small" onClick={resetValues}>
									Reset
								</Button>
							}
						>
							<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
								{calculator.inputs.map((input) => (
									<Space orientation="vertical" size={4} style={{ width: "100%" }} key={input.key}>
										<Typography.Text strong>{input.label}</Typography.Text>
										<HealthInput input={input} value={values[input.key]} onChange={(value) => updateValue(input.key, value)} />
									</Space>
								))}
							</Space>
						</Card>
					</Col>
					<Col xs={24} lg={15} xl={16}>
						<Space orientation="vertical" size="large" style={{ width: "100%" }}>
							<Row gutter={[16, 16]}>
								{result.metrics.map((metric) => (
									<Col xs={24} sm={12} xl={8} key={metric.label}>
										<Card>
											<Statistic
												title={metric.label}
												value={metric.value}
												styles={{ content: { color: getMetricColor(metric.tone), fontSize: 22 } }}
											/>
										</Card>
									</Col>
								))}
							</Row>
							{result.note ? <Typography.Text type="secondary">{result.note}</Typography.Text> : null}
							{result.tableColumns?.length && result.tableData?.length ? (
								<Card title="Details">
									<Table columns={result.tableColumns} dataSource={result.tableData} pagination={false} scroll={{ x: true }} />
								</Card>
							) : null}
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};
