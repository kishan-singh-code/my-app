import type { ColumnsType } from "antd/es/table";

export type IMathEducationCalculatorId =
	| "ratio-calculator"
	| "average-calculator"
	| "scientific-calculator"
	| "lcm-hcf-calculator"
	| "prime-checker"
	| "factorial-calculator"
	| "quadratic-solver"
	| "probability-calculator"
	| "permutation-combination"
	| "matrix-calculator"
	| "geometry-calculator";

export type IMathInputValue = number | string;

export interface IMathInputOption {
	label: string;
	value: string;
}

export interface IMathInputDefinition {
	key: string;
	label: string;
	type?: "number" | "select" | "textarea" | "text";
	min?: number;
	max?: number;
	step?: number;
	addonAfter?: string;
	options?: IMathInputOption[];
	placeholder?: string;
}

export interface IMathMetric {
	label: string;
	value: string;
	tone?: "default" | "success" | "warning" | "danger";
}

export interface IMathTableRow {
	key: string;
	[label: string]: string | number;
}

export interface IMathCalculationResult {
	metrics: IMathMetric[];
	tableColumns?: ColumnsType<IMathTableRow>;
	tableData?: IMathTableRow[];
	output?: string;
	note?: string;
}

export interface IMathCalculatorDefinition {
	id: IMathEducationCalculatorId;
	title: string;
	inputs: IMathInputDefinition[];
	defaults: Record<string, IMathInputValue>;
	calculate: (values: Record<string, IMathInputValue>) => IMathCalculationResult;
}

const toNumber = (value: IMathInputValue) => (typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0);
const toInteger = (value: IMathInputValue) => Math.trunc(toNumber(value));

export const formatNumber = (value: number, digits = 6) => {
	if (!Number.isFinite(value)) {
		return "0";
	}

	if (value !== 0 && (Math.abs(value) >= 1_000_000_000 || Math.abs(value) < 0.000001)) {
		return value.toExponential(6);
	}

	return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);
};

const parseNumberList = (value: IMathInputValue) =>
	String(value)
		.split(/[\s,]+/)
		.map((entry) => Number(entry.trim()))
		.filter((entry) => Number.isFinite(entry));

const gcdTwo = (firstNumber: number, secondNumber: number): number => {
	let first = Math.abs(Math.trunc(firstNumber));
	let second = Math.abs(Math.trunc(secondNumber));

	while (second !== 0) {
		const next = first % second;
		first = second;
		second = next;
	}

	return first;
};

const lcmTwo = (firstNumber: number, secondNumber: number) => {
	if (firstNumber === 0 || secondNumber === 0) {
		return 0;
	}

	return Math.abs((firstNumber * secondNumber) / gcdTwo(firstNumber, secondNumber));
};

const factorialBigInt = (value: number) => {
	let result = 1n;

	for (let index = 2n; index <= BigInt(value); index += 1n) {
		result *= index;
	}

	return result;
};

const parseMatrix = (value: IMathInputValue) =>
	String(value)
		.trim()
		.split(/\r?\n/)
		.filter(Boolean)
		.map((row) => row.split(/[\s,]+/).map(Number));

const isValidMatrix = (matrix: number[][]) =>
	matrix.length > 0 && matrix.every((row) => row.length === matrix[0].length && row.every(Number.isFinite));

const matrixToText = (matrix: number[][]) => matrix.map((row) => row.map((value) => formatNumber(value)).join("\t")).join("\n");

const matrixRows = (matrix: number[][]): IMathTableRow[] =>
	matrix.map((row, rowIndex) => ({ key: String(rowIndex), row: rowIndex + 1, values: row.map((value) => formatNumber(value)).join(", ") }));

const matrixTableColumns: ColumnsType<IMathTableRow> = [
	{ title: "Row", dataIndex: "row", key: "row" },
	{ title: "Values", dataIndex: "values", key: "values" },
];

const calculateRatio: IMathCalculatorDefinition["calculate"] = (values) => {
	const first = toNumber(values.first);
	const second = toNumber(values.second);
	const divisor = gcdTwo(first, second);
	const simplifiedFirst = divisor ? first / divisor : first;
	const simplifiedSecond = divisor ? second / divisor : second;
	const ratioValue = second === 0 ? 0 : first / second;

	return {
		metrics: [
			{ label: "Simplified Ratio", value: `${formatNumber(simplifiedFirst)} : ${formatNumber(simplifiedSecond)}`, tone: "success" },
			{ label: "Decimal", value: formatNumber(ratioValue) },
			{ label: "Percent", value: `${formatNumber(ratioValue * 100)}%` },
		],
		note: second === 0 ? "Second value is zero, so decimal and percent are shown as zero." : undefined,
	};
};

const calculateAverage: IMathCalculatorDefinition["calculate"] = (values) => {
	const numbers = parseNumberList(values.values);
	const weights = parseNumberList(values.weights);
	const sum = numbers.reduce((total, value) => total + value, 0);
	const average = numbers.length ? sum / numbers.length : 0;
	const weightedTotal = numbers.reduce((total, value, index) => total + value * (weights[index] ?? 1), 0);
	const weightSum = numbers.reduce((total, _value, index) => total + (weights[index] ?? 1), 0);
	const weightedAverage = weightSum ? weightedTotal / weightSum : 0;

	return {
		metrics: [
			{ label: "Average", value: formatNumber(average), tone: "success" },
			{ label: "Weighted Average", value: formatNumber(weightedAverage), tone: "success" },
			{ label: "Count", value: String(numbers.length) },
			{ label: "Sum", value: formatNumber(sum) },
		],
		tableColumns: [
			{ title: "Index", dataIndex: "index", key: "index" },
			{ title: "Value", dataIndex: "value", key: "value" },
			{ title: "Weight", dataIndex: "weight", key: "weight" },
		],
		tableData: numbers.map((value, index) => ({
			key: String(index),
			index: index + 1,
			value: formatNumber(value),
			weight: formatNumber(weights[index] ?? 1),
		})),
	};
};

const calculateLcmHcf: IMathCalculatorDefinition["calculate"] = (values) => {
	const numbers = parseNumberList(values.numbers)
		.map(Math.trunc)
		.filter((value) => value >= 0);
	const hcf = numbers.reduce((result, value) => gcdTwo(result, value), numbers[0] ?? 0);
	const lcm = numbers.reduce((result, value) => lcmTwo(result, value), numbers[0] ?? 0);

	return {
		metrics: [
			{ label: "HCF / GCD", value: formatNumber(hcf, 0), tone: "success" },
			{ label: "LCM", value: formatNumber(lcm, 0), tone: "success" },
			{ label: "Numbers", value: String(numbers.length) },
		],
	};
};

const calculatePrime: IMathCalculatorDefinition["calculate"] = (values) => {
	const value = Math.abs(toInteger(values.number));
	let isPrime = value > 1;

	for (let divisor = 2; divisor <= Math.sqrt(value); divisor += 1) {
		if (value % divisor === 0) {
			isPrime = false;
			break;
		}
	}

	const factors = Array.from({ length: value }, (_entry, index) => index + 1).filter((factor) => value % factor === 0);

	return {
		metrics: [
			{ label: "Result", value: isPrime ? "Prime" : "Not Prime", tone: isPrime ? "success" : "warning" },
			{ label: "Number", value: formatNumber(value, 0) },
			{ label: "Factor Count", value: String(factors.length) },
		],
		output: factors.length <= 100 ? `Factors: ${factors.join(", ")}` : "Too many factors to list neatly.",
	};
};

const calculateFactorial: IMathCalculatorDefinition["calculate"] = (values) => {
	const value = Math.max(Math.min(toInteger(values.number), 500), 0);
	const factorial = factorialBigInt(value).toString();

	return {
		metrics: [
			{ label: "n!", value: factorial.length > 18 ? `${factorial.slice(0, 18)}...` : factorial, tone: "success" },
			{ label: "Digits", value: String(factorial.length) },
			{ label: "n", value: String(value) },
		],
		output: factorial,
		note: "Input is capped at 500 to keep browser calculation responsive.",
	};
};

const calculateQuadratic: IMathCalculatorDefinition["calculate"] = (values) => {
	const a = toNumber(values.a);
	const b = toNumber(values.b);
	const c = toNumber(values.c);
	const discriminant = b ** 2 - 4 * a * c;

	if (a === 0) {
		return { metrics: [{ label: "Result", value: "a cannot be 0", tone: "danger" }] };
	}

	if (discriminant >= 0) {
		const rootOne = (-b + Math.sqrt(discriminant)) / (2 * a);
		const rootTwo = (-b - Math.sqrt(discriminant)) / (2 * a);

		return {
			metrics: [
				{ label: "Discriminant", value: formatNumber(discriminant), tone: "success" },
				{ label: "Root 1", value: formatNumber(rootOne) },
				{ label: "Root 2", value: formatNumber(rootTwo) },
			],
		};
	}

	const real = -b / (2 * a);
	const imaginary = Math.sqrt(Math.abs(discriminant)) / (2 * a);

	return {
		metrics: [
			{ label: "Discriminant", value: formatNumber(discriminant), tone: "warning" },
			{ label: "Root 1", value: `${formatNumber(real)} + ${formatNumber(Math.abs(imaginary))}i` },
			{ label: "Root 2", value: `${formatNumber(real)} - ${formatNumber(Math.abs(imaginary))}i` },
		],
	};
};

const calculateProbability: IMathCalculatorDefinition["calculate"] = (values) => {
	const eventA = Math.min(Math.max(toNumber(values.eventA) / 100, 0), 1);
	const eventB = Math.min(Math.max(toNumber(values.eventB) / 100, 0), 1);
	const both = eventA * eventB;
	const either = eventA + eventB - both;

	return {
		metrics: [
			{ label: "P(A and B)", value: `${formatNumber(both * 100)}%`, tone: "success" },
			{ label: "P(A or B)", value: `${formatNumber(either * 100)}%`, tone: "success" },
			{ label: "P(not A)", value: `${formatNumber((1 - eventA) * 100)}%` },
		],
		note: "This assumes events A and B are independent.",
	};
};

const calculatePermutationCombination: IMathCalculatorDefinition["calculate"] = (values) => {
	const n = Math.max(Math.min(toInteger(values.n), 170), 0);
	const r = Math.max(Math.min(toInteger(values.r), n), 0);
	const factorial = (entry: number) => Number(factorialBigInt(entry));
	const permutation = factorial(n) / factorial(n - r);
	const combination = permutation / factorial(r);

	return {
		metrics: [
			{ label: "nPr", value: formatNumber(permutation, 0), tone: "success" },
			{ label: "nCr", value: formatNumber(combination, 0), tone: "success" },
			{ label: "n / r", value: `${n} / ${r}` },
		],
		note: "n is capped at 170 for numeric precision.",
	};
};

const calculateMatrix: IMathCalculatorDefinition["calculate"] = (values) => {
	const operation = String(values.operation);
	const matrixA = parseMatrix(values.matrixA);
	const matrixB = parseMatrix(values.matrixB);

	if (!isValidMatrix(matrixA)) {
		return { metrics: [{ label: "Result", value: "Matrix A is invalid", tone: "danger" }] };
	}

	let resultMatrix: number[][] = [];
	let scalarResult: number | null = null;

	if (operation === "transpose") {
		resultMatrix = matrixA[0].map((_entry, columnIndex) => matrixA.map((row) => row[columnIndex]));
	} else if (operation === "determinant-2x2") {
		if (matrixA.length !== 2 || matrixA[0].length !== 2) {
			return { metrics: [{ label: "Result", value: "Matrix A must be 2x2", tone: "danger" }] };
		}

		scalarResult = matrixA[0][0] * matrixA[1][1] - matrixA[0][1] * matrixA[1][0];
	} else {
		if (!isValidMatrix(matrixB)) {
			return { metrics: [{ label: "Result", value: "Matrix B is invalid", tone: "danger" }] };
		}

		if (operation === "add" || operation === "subtract") {
			if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
				return { metrics: [{ label: "Result", value: "Matrices must be same size", tone: "danger" }] };
			}

			resultMatrix = matrixA.map((row, rowIndex) =>
				row.map((value, columnIndex) =>
					operation === "add" ? value + matrixB[rowIndex][columnIndex] : value - matrixB[rowIndex][columnIndex],
				),
			);
		} else if (operation === "multiply") {
			if (matrixA[0].length !== matrixB.length) {
				return { metrics: [{ label: "Result", value: "A columns must equal B rows", tone: "danger" }] };
			}

			resultMatrix = matrixA.map((row) =>
				matrixB[0].map((_entry, columnIndex) => row.reduce((sum, value, rowIndex) => sum + value * matrixB[rowIndex][columnIndex], 0)),
			);
		}
	}

	return {
		metrics: [
			{ label: "Operation", value: operation },
			{ label: "Rows", value: String(resultMatrix.length || matrixA.length) },
			{ label: "Columns", value: String(resultMatrix[0]?.length ?? matrixA[0].length) },
			...(scalarResult === null ? [] : [{ label: "Determinant", value: formatNumber(scalarResult), tone: "success" as const }]),
		],
		tableColumns: matrixTableColumns,
		tableData: scalarResult === null ? matrixRows(resultMatrix) : [{ key: "determinant", row: "det", values: formatNumber(scalarResult) }],
		output: scalarResult === null ? matrixToText(resultMatrix) : formatNumber(scalarResult),
	};
};

const calculateGeometry: IMathCalculatorDefinition["calculate"] = (values) => {
	const mode = String(values.mode);
	const radius = toNumber(values.radius);
	const base = toNumber(values.base);
	const height = toNumber(values.height);
	const length = toNumber(values.length);
	const width = toNumber(values.width);
	const depth = toNumber(values.depth);
	let label = "Result";
	let result = 0;

	if (mode === "circle-area") {
		label = "Circle Area";
		result = Math.PI * radius ** 2;
	} else if (mode === "triangle-area") {
		label = "Triangle Area";
		result = (base * height) / 2;
	} else if (mode === "rectangle-area") {
		label = "Rectangle Area";
		result = length * width;
	} else if (mode === "box-volume") {
		label = "Box Volume";
		result = length * width * depth;
	} else if (mode === "cylinder-volume") {
		label = "Cylinder Volume";
		result = Math.PI * radius ** 2 * height;
	} else if (mode === "sphere-volume") {
		label = "Sphere Volume";
		result = (4 / 3) * Math.PI * radius ** 3;
	} else if (mode === "cone-volume") {
		label = "Cone Volume";
		result = (Math.PI * radius ** 2 * height) / 3;
	}

	return {
		metrics: [
			{ label, value: formatNumber(result), tone: "success" },
			{ label: "Mode", value: mode.replace(/-/g, " ") },
		],
	};
};

export const mathCalculators: Record<IMathEducationCalculatorId, IMathCalculatorDefinition> = {
	"ratio-calculator": {
		id: "ratio-calculator",
		title: "Ratio Calculator",
		defaults: { first: 16, second: 24 },
		inputs: [
			{ key: "first", label: "First Value", min: 0, step: 1 },
			{ key: "second", label: "Second Value", min: 0, step: 1 },
		],
		calculate: calculateRatio,
	},
	"average-calculator": {
		id: "average-calculator",
		title: "Average and Weighted Average",
		defaults: { values: "80, 90, 75, 85", weights: "3, 4, 2, 1" },
		inputs: [
			{ key: "values", label: "Values", type: "textarea", placeholder: "80, 90, 75, 85" },
			{ key: "weights", label: "Weights", type: "textarea", placeholder: "3, 4, 2, 1" },
		],
		calculate: calculateAverage,
	},
	"scientific-calculator": {
		id: "scientific-calculator",
		title: "Basic and Scientific Calculator",
		defaults: {},
		inputs: [],
		calculate: () => ({ metrics: [] }),
	},
	"lcm-hcf-calculator": {
		id: "lcm-hcf-calculator",
		title: "LCM / HCF Calculator",
		defaults: { numbers: "12, 18, 30" },
		inputs: [{ key: "numbers", label: "Numbers", type: "textarea", placeholder: "12, 18, 30" }],
		calculate: calculateLcmHcf,
	},
	"prime-checker": {
		id: "prime-checker",
		title: "Prime Number Checker",
		defaults: { number: 97 },
		inputs: [{ key: "number", label: "Number", min: 0, step: 1 }],
		calculate: calculatePrime,
	},
	"factorial-calculator": {
		id: "factorial-calculator",
		title: "Factorial Calculator",
		defaults: { number: 10 },
		inputs: [{ key: "number", label: "n", min: 0, max: 500, step: 1 }],
		calculate: calculateFactorial,
	},
	"quadratic-solver": {
		id: "quadratic-solver",
		title: "Quadratic Equation Solver",
		defaults: { a: 1, b: -3, c: 2 },
		inputs: [
			{ key: "a", label: "a", step: 1 },
			{ key: "b", label: "b", step: 1 },
			{ key: "c", label: "c", step: 1 },
		],
		calculate: calculateQuadratic,
	},
	"probability-calculator": {
		id: "probability-calculator",
		title: "Probability Calculator",
		defaults: { eventA: 40, eventB: 25 },
		inputs: [
			{ key: "eventA", label: "P(A)", addonAfter: "%", min: 0, max: 100, step: 1 },
			{ key: "eventB", label: "P(B)", addonAfter: "%", min: 0, max: 100, step: 1 },
		],
		calculate: calculateProbability,
	},
	"permutation-combination": {
		id: "permutation-combination",
		title: "Permutation and Combination",
		defaults: { n: 10, r: 3 },
		inputs: [
			{ key: "n", label: "n", min: 0, max: 170, step: 1 },
			{ key: "r", label: "r", min: 0, max: 170, step: 1 },
		],
		calculate: calculatePermutationCombination,
	},
	"matrix-calculator": {
		id: "matrix-calculator",
		title: "Matrix Calculator",
		defaults: { operation: "multiply", matrixA: "1 2\n3 4", matrixB: "5 6\n7 8" },
		inputs: [
			{
				key: "operation",
				label: "Operation",
				type: "select",
				options: [
					{ label: "Add", value: "add" },
					{ label: "Subtract", value: "subtract" },
					{ label: "Multiply", value: "multiply" },
					{ label: "Transpose A", value: "transpose" },
					{ label: "Determinant 2x2 A", value: "determinant-2x2" },
				],
			},
			{ key: "matrixA", label: "Matrix A", type: "textarea", placeholder: "1 2\n3 4" },
			{ key: "matrixB", label: "Matrix B", type: "textarea", placeholder: "5 6\n7 8" },
		],
		calculate: calculateMatrix,
	},
	"geometry-calculator": {
		id: "geometry-calculator",
		title: "Geometry Calculators",
		defaults: { mode: "circle-area", radius: 7, base: 10, height: 5, length: 10, width: 4, depth: 3 },
		inputs: [
			{
				key: "mode",
				label: "Mode",
				type: "select",
				options: [
					{ label: "Circle Area", value: "circle-area" },
					{ label: "Triangle Area", value: "triangle-area" },
					{ label: "Rectangle Area", value: "rectangle-area" },
					{ label: "Box Volume", value: "box-volume" },
					{ label: "Cylinder Volume", value: "cylinder-volume" },
					{ label: "Sphere Volume", value: "sphere-volume" },
					{ label: "Cone Volume", value: "cone-volume" },
				],
			},
			{ key: "radius", label: "Radius", min: 0, step: 0.1 },
			{ key: "base", label: "Base", min: 0, step: 0.1 },
			{ key: "height", label: "Height", min: 0, step: 0.1 },
			{ key: "length", label: "Length", min: 0, step: 0.1 },
			{ key: "width", label: "Width", min: 0, step: 0.1 },
			{ key: "depth", label: "Depth", min: 0, step: 0.1 },
		],
		calculate: calculateGeometry,
	},
};
