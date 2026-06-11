import type { ColumnsType } from "antd/es/table";

export type IFinanceCalculatorId =
	| "sip-calculator"
	| "compound-interest"
	| "simple-interest"
	| "fd-rd-calculator"
	| "loan-eligibility"
	| "credit-card-payoff"
	| "salary-breakup"
	| "inflation-calculator"
	| "discount-calculator"
	| "net-worth-calculator"
	| "emi-amortization"
	| "percentage-profit-margin";

export type IFinanceInputValue = number | string;

export interface IFinanceInputOption {
	label: string;
	value: string;
}

export interface IFinanceInputDefinition {
	key: string;
	label: string;
	type?: "number" | "select";
	min?: number;
	max?: number;
	step?: number;
	prefix?: string;
	addonAfter?: string;
	options?: IFinanceInputOption[];
}

export interface IFinanceMetric {
	label: string;
	value: string;
	tone?: "default" | "success" | "warning" | "danger";
}

export interface IFinanceDataPoint {
	name: string;
	[key: string]: string | number;
}

export interface IFinanceTableRow {
	key: string;
	[label: string]: string | number;
}

export interface IFinanceCalculationResult {
	metrics: IFinanceMetric[];
	pieData?: IFinanceDataPoint[];
	lineData?: IFinanceDataPoint[];
	barData?: IFinanceDataPoint[];
	tableColumns?: ColumnsType<IFinanceTableRow>;
	tableData?: IFinanceTableRow[];
	note?: string;
}

export interface IFinanceCalculatorDefinition {
	id: IFinanceCalculatorId;
	title: string;
	inputs: IFinanceInputDefinition[];
	defaults: Record<string, IFinanceInputValue>;
	calculate: (values: Record<string, IFinanceInputValue>) => IFinanceCalculationResult;
}

const toNumber = (value: IFinanceInputValue) => (typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0);
const monthlyRate = (annualRate: number) => annualRate / 12 / 100;
const yearlyRate = (annualRate: number) => annualRate / 100;
const roundMoney = (value: number) => Math.round(value);

export const formatMoney = (value: number) =>
	new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(Number.isFinite(value) ? value : 0);

export const formatNumber = (value: number) =>
	new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);

export const formatPercent = (value: number) => `${formatNumber(value)}%`;

const moneyColumn = (title: string, dataIndex: string) => ({
	title,
	dataIndex,
	key: dataIndex,
});

const buildEmi = (principal: number, annualRate: number, months: number) => {
	const rate = monthlyRate(annualRate);

	if (months <= 0) {
		return 0;
	}

	if (rate === 0) {
		return principal / months;
	}

	return (principal * rate * (1 + rate) ** months) / ((1 + rate) ** months - 1);
};

const buildAmortization = (principal: number, annualRate: number, months: number, emi: number) => {
	const rate = monthlyRate(annualRate);
	let balance = principal;
	const rows: IFinanceTableRow[] = [];
	const lineData: IFinanceDataPoint[] = [];
	let yearlyPrincipal = 0;
	let yearlyInterest = 0;

	for (let month = 1; month <= months; month += 1) {
		const interest = balance * rate;
		const principalPaid = Math.min(Math.max(emi - interest, 0), balance);
		balance = Math.max(balance - principalPaid, 0);
		yearlyPrincipal += principalPaid;
		yearlyInterest += interest;

		if (month % 12 === 0 || month === months || balance === 0) {
			const year = Math.ceil(month / 12);
			rows.push({
				key: String(year),
				year,
				principal: formatMoney(yearlyPrincipal),
				interest: formatMoney(yearlyInterest),
				balance: formatMoney(balance),
			});
			lineData.push({ name: `Year ${year}`, Balance: roundMoney(balance) });
			yearlyPrincipal = 0;
			yearlyInterest = 0;
		}

		if (balance === 0) {
			break;
		}
	}

	return { rows, lineData };
};

const calculateSip: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const monthlyInvestment = toNumber(values.monthlyInvestment);
	const annualReturn = toNumber(values.annualReturn);
	const years = toNumber(values.years);
	const months = Math.max(Math.round(years * 12), 0);
	const rate = monthlyRate(annualReturn);
	const futureValue = rate === 0 ? monthlyInvestment * months : monthlyInvestment * (((1 + rate) ** months - 1) / rate) * (1 + rate);
	const invested = monthlyInvestment * months;
	const returns = futureValue - invested;
	const lineData = Array.from({ length: Math.max(Math.ceil(years), 1) }, (_, index) => {
		const year = index + 1;
		const elapsedMonths = year * 12;
		const value =
			rate === 0 ? monthlyInvestment * elapsedMonths : monthlyInvestment * (((1 + rate) ** elapsedMonths - 1) / rate) * (1 + rate);

		return { name: `Year ${year}`, Value: roundMoney(value), Invested: roundMoney(monthlyInvestment * elapsedMonths) };
	});

	return {
		metrics: [
			{ label: "Future Value", value: formatMoney(futureValue), tone: "success" },
			{ label: "Invested", value: formatMoney(invested) },
			{ label: "Estimated Returns", value: formatMoney(returns), tone: "success" },
		],
		lineData,
	};
};

const calculateCompoundInterest: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const principal = toNumber(values.principal);
	const annualRate = toNumber(values.annualRate);
	const years = toNumber(values.years);
	const compoundsPerYear = Math.max(toNumber(values.compoundsPerYear), 1);
	const amount = principal * (1 + yearlyRate(annualRate) / compoundsPerYear) ** (compoundsPerYear * years);
	const interest = amount - principal;
	const lineData = Array.from({ length: Math.max(Math.ceil(years), 1) }, (_, index) => {
		const year = index + 1;
		const value = principal * (1 + yearlyRate(annualRate) / compoundsPerYear) ** (compoundsPerYear * year);

		return { name: `Year ${year}`, Amount: roundMoney(value), Principal: roundMoney(principal) };
	});

	return {
		metrics: [
			{ label: "Maturity Amount", value: formatMoney(amount), tone: "success" },
			{ label: "Principal", value: formatMoney(principal) },
			{ label: "Compound Interest", value: formatMoney(interest), tone: "success" },
		],
		lineData,
	};
};

const calculateSimpleInterest: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const principal = toNumber(values.principal);
	const annualRate = toNumber(values.annualRate);
	const years = toNumber(values.years);
	const interest = (principal * annualRate * years) / 100;
	const amount = principal + interest;

	return {
		metrics: [
			{ label: "Total Amount", value: formatMoney(amount), tone: "success" },
			{ label: "Principal", value: formatMoney(principal) },
			{ label: "Simple Interest", value: formatMoney(interest), tone: "success" },
		],
		lineData: Array.from({ length: Math.max(Math.ceil(years), 1) }, (_, index) => ({
			name: `Year ${index + 1}`,
			Amount: roundMoney(principal + (principal * annualRate * (index + 1)) / 100),
		})),
	};
};

const calculateFdRd: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const mode = String(values.mode);
	const deposit = toNumber(values.deposit);
	const annualRate = toNumber(values.annualRate);
	const years = toNumber(values.years);
	const compoundsPerYear = mode === "FD" ? Math.max(toNumber(values.compoundsPerYear), 1) : 12;
	let maturity = 0;
	let invested = 0;

	if (mode === "FD") {
		invested = deposit;
		maturity = deposit * (1 + yearlyRate(annualRate) / compoundsPerYear) ** (compoundsPerYear * years);
	} else {
		const months = Math.max(Math.round(years * 12), 0);
		const rate = monthlyRate(annualRate);
		invested = deposit * months;
		maturity = Array.from({ length: months }, (_, index) => deposit * (1 + rate) ** (months - index)).reduce(
			(total, value) => total + value,
			0,
		);
	}

	const interest = maturity - invested;

	return {
		metrics: [
			{ label: "Maturity Value", value: formatMoney(maturity), tone: "success" },
			{ label: mode === "FD" ? "Deposit" : "Total Deposits", value: formatMoney(invested) },
			{ label: "Interest Earned", value: formatMoney(interest), tone: "success" },
		],
		lineData: Array.from({ length: Math.max(Math.ceil(years), 1) }, (_, index) => ({
			name: `Year ${index + 1}`,
			Value: roundMoney(
				mode === "FD"
					? deposit * (1 + yearlyRate(annualRate) / compoundsPerYear) ** (compoundsPerYear * (index + 1))
					: (invested + interest) * ((index + 1) / years),
			),
		})),
	};
};

const calculateLoanEligibility: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const monthlyIncome = toNumber(values.monthlyIncome);
	const obligations = toNumber(values.obligations);
	const annualRate = toNumber(values.annualRate);
	const tenureYears = toNumber(values.tenureYears);
	const foir = toNumber(values.foir);
	const availableEmi = Math.max(monthlyIncome * (foir / 100) - obligations, 0);
	const months = tenureYears * 12;
	const rate = monthlyRate(annualRate);
	const eligibleLoan = rate === 0 ? availableEmi * months : availableEmi * ((1 - (1 + rate) ** -months) / rate);

	return {
		metrics: [
			{ label: "Eligible Loan", value: formatMoney(eligibleLoan), tone: "success" },
			{ label: "Affordable EMI", value: formatMoney(availableEmi) },
			{ label: "FOIR Limit", value: formatMoney(monthlyIncome * (foir / 100)) },
		],
		barData: [
			{ name: "Income", Amount: roundMoney(monthlyIncome) },
			{ name: "FOIR Limit", Amount: roundMoney(monthlyIncome * (foir / 100)) },
			{ name: "Obligations", Amount: roundMoney(obligations) },
			{ name: "Available EMI", Amount: roundMoney(availableEmi) },
		],
		note: "Eligibility is an estimate; lenders also evaluate credit score, age, employer profile, and existing liabilities.",
	};
};

const calculateCreditCardPayoff: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const balance = toNumber(values.balance);
	const apr = toNumber(values.apr);
	const monthlyPayment = toNumber(values.monthlyPayment);
	const rate = monthlyRate(apr);
	let remainingBalance = balance;
	let totalInterest = 0;
	let months = 0;
	const tableData: IFinanceTableRow[] = [];
	const lineData: IFinanceDataPoint[] = [];
	const minimumFirstInterest = remainingBalance * rate;

	if (monthlyPayment <= minimumFirstInterest) {
		return {
			metrics: [
				{ label: "Payoff Time", value: "Never", tone: "danger" },
				{ label: "First Month Interest", value: formatMoney(minimumFirstInterest), tone: "warning" },
				{ label: "Monthly Payment", value: formatMoney(monthlyPayment) },
			],
			note: "Monthly payment must be higher than the first month interest to reduce the balance.",
		};
	}

	while (remainingBalance > 0 && months < 600) {
		months += 1;
		const interest = remainingBalance * rate;
		const principalPaid = Math.min(monthlyPayment - interest, remainingBalance);
		remainingBalance = Math.max(remainingBalance - principalPaid, 0);
		totalInterest += interest;

		if (months <= 12 || months % 12 === 0 || remainingBalance === 0) {
			tableData.push({
				key: String(months),
				month: months,
				payment: formatMoney(Math.min(monthlyPayment, principalPaid + interest)),
				interest: formatMoney(interest),
				balance: formatMoney(remainingBalance),
			});
			lineData.push({ name: `M${months}`, Balance: roundMoney(remainingBalance) });
		}
	}

	return {
		metrics: [
			{ label: "Payoff Time", value: `${months} months`, tone: "success" },
			{ label: "Total Interest", value: formatMoney(totalInterest), tone: "warning" },
			{ label: "Total Paid", value: formatMoney(balance + totalInterest) },
		],
		lineData,
		tableColumns: [
			moneyColumn("Month", "month"),
			moneyColumn("Payment", "payment"),
			moneyColumn("Interest", "interest"),
			moneyColumn("Balance", "balance"),
		],
		tableData,
	};
};

const calculateSalaryBreakup: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const annualCtc = toNumber(values.annualCtc);
	const basicPercent = toNumber(values.basicPercent);
	const hraPercent = toNumber(values.hraPercent);
	const pfPercent = toNumber(values.pfPercent);
	const annualTax = toNumber(values.annualTax);
	const professionalTaxMonthly = toNumber(values.professionalTaxMonthly);
	const otherDeductionsMonthly = toNumber(values.otherDeductionsMonthly);
	const annualBasic = annualCtc * (basicPercent / 100);
	const annualHra = annualBasic * (hraPercent / 100);
	const annualSpecial = Math.max(annualCtc - annualBasic - annualHra, 0);
	const employeePfMonthly = (annualBasic / 12) * (pfPercent / 100);
	const taxMonthly = annualTax / 12;
	const grossMonthly = annualCtc / 12;
	const totalDeductionsMonthly = employeePfMonthly + taxMonthly + professionalTaxMonthly + otherDeductionsMonthly;
	const inHandMonthly = grossMonthly - totalDeductionsMonthly;

	return {
		metrics: [
			{ label: "Monthly In-hand", value: formatMoney(inHandMonthly), tone: "success" },
			{ label: "Monthly Gross", value: formatMoney(grossMonthly) },
			{ label: "Monthly Deductions", value: formatMoney(totalDeductionsMonthly), tone: "warning" },
		],
		tableColumns: [moneyColumn("Component", "component"), moneyColumn("Monthly", "monthly"), moneyColumn("Annual", "annual")],
		tableData: [
			{ key: "basic", component: "Basic", monthly: formatMoney(annualBasic / 12), annual: formatMoney(annualBasic) },
			{ key: "hra", component: "HRA", monthly: formatMoney(annualHra / 12), annual: formatMoney(annualHra) },
			{ key: "special", component: "Special Allowance", monthly: formatMoney(annualSpecial / 12), annual: formatMoney(annualSpecial) },
			{ key: "pf", component: "Employee PF", monthly: formatMoney(employeePfMonthly), annual: formatMoney(employeePfMonthly * 12) },
			{ key: "tax", component: "Income Tax", monthly: formatMoney(taxMonthly), annual: formatMoney(annualTax) },
		],
	};
};

const calculateInflation: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const currentCost = toNumber(values.currentCost);
	const inflationRate = toNumber(values.inflationRate);
	const years = toNumber(values.years);
	const futureCost = currentCost * (1 + yearlyRate(inflationRate)) ** years;
	const purchasingPower = currentCost / (1 + yearlyRate(inflationRate)) ** years;

	return {
		metrics: [
			{ label: "Future Cost", value: formatMoney(futureCost), tone: "warning" },
			{ label: "Cost Increase", value: formatMoney(futureCost - currentCost) },
			{ label: "Today's Value Later", value: formatMoney(purchasingPower) },
		],
		lineData: Array.from({ length: Math.max(Math.ceil(years), 1) }, (_, index) => ({
			name: `Year ${index + 1}`,
			Cost: roundMoney(currentCost * (1 + yearlyRate(inflationRate)) ** (index + 1)),
		})),
	};
};

const calculateDiscount: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const originalPrice = toNumber(values.originalPrice);
	const discountPercent = toNumber(values.discountPercent);
	const taxPercent = toNumber(values.taxPercent);
	const discount = originalPrice * (discountPercent / 100);
	const salePrice = originalPrice - discount;
	const tax = salePrice * (taxPercent / 100);
	const finalPrice = salePrice + tax;

	return {
		metrics: [
			{ label: "Final Price", value: formatMoney(finalPrice), tone: "success" },
			{ label: "You Save", value: formatMoney(discount), tone: "success" },
			{ label: "Sale Price", value: formatMoney(salePrice) },
		],
		pieData: [
			{ name: "Sale Price", value: roundMoney(salePrice) },
			{ name: "Discount", value: roundMoney(discount) },
			{ name: "Tax", value: roundMoney(tax) },
		],
	};
};

const calculateNetWorth: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const assets = toNumber(values.cash) + toNumber(values.investments) + toNumber(values.property) + toNumber(values.otherAssets);
	const liabilities =
		toNumber(values.homeLoan) + toNumber(values.personalLoan) + toNumber(values.creditCardDebt) + toNumber(values.otherLiabilities);
	const netWorth = assets - liabilities;

	return {
		metrics: [
			{ label: "Net Worth", value: formatMoney(netWorth), tone: netWorth >= 0 ? "success" : "danger" },
			{ label: "Total Assets", value: formatMoney(assets), tone: "success" },
			{ label: "Total Liabilities", value: formatMoney(liabilities), tone: "warning" },
		],
		barData: [
			{ name: "Cash", Amount: roundMoney(toNumber(values.cash)) },
			{ name: "Investments", Amount: roundMoney(toNumber(values.investments)) },
			{ name: "Property", Amount: roundMoney(toNumber(values.property)) },
			{ name: "Loans", Amount: roundMoney(liabilities) },
		],
	};
};

const calculateEmiAmortization: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const principal = toNumber(values.principal);
	const annualRate = toNumber(values.annualRate);
	const tenureYears = toNumber(values.tenureYears);
	const months = Math.round(tenureYears * 12);
	const emi = buildEmi(principal, annualRate, months);
	const totalPayment = emi * months;
	const totalInterest = totalPayment - principal;
	const amortization = buildAmortization(principal, annualRate, months, emi);

	return {
		metrics: [
			{ label: "Monthly EMI", value: formatMoney(emi), tone: "success" },
			{ label: "Total Interest", value: formatMoney(totalInterest), tone: "warning" },
			{ label: "Total Payment", value: formatMoney(totalPayment) },
		],
		lineData: amortization.lineData,
		tableColumns: [
			moneyColumn("Year", "year"),
			moneyColumn("Principal", "principal"),
			moneyColumn("Interest", "interest"),
			moneyColumn("Balance", "balance"),
		],
		tableData: amortization.rows,
	};
};

const calculatePercentageProfitMargin: IFinanceCalculatorDefinition["calculate"] = (values) => {
	const initialValue = toNumber(values.initialValue);
	const finalValue = toNumber(values.finalValue);
	const costPrice = toNumber(values.costPrice);
	const sellingPrice = toNumber(values.sellingPrice);
	const change = finalValue - initialValue;
	const percentChange = initialValue === 0 ? 0 : (change / initialValue) * 100;
	const profit = sellingPrice - costPrice;
	const margin = sellingPrice === 0 ? 0 : (profit / sellingPrice) * 100;
	const markup = costPrice === 0 ? 0 : (profit / costPrice) * 100;

	return {
		metrics: [
			{ label: "Change", value: `${formatMoney(change)} (${formatPercent(percentChange)})`, tone: change >= 0 ? "success" : "danger" },
			{ label: "Profit", value: formatMoney(profit), tone: profit >= 0 ? "success" : "danger" },
			{ label: "Profit Margin", value: formatPercent(margin) },
			{ label: "Markup", value: formatPercent(markup) },
		],
		barData: [
			{ name: "Initial", Amount: roundMoney(initialValue) },
			{ name: "Final", Amount: roundMoney(finalValue) },
			{ name: "Cost", Amount: roundMoney(costPrice) },
			{ name: "Selling", Amount: roundMoney(sellingPrice) },
		],
	};
};

export const financeCalculators: Record<IFinanceCalculatorId, IFinanceCalculatorDefinition> = {
	"sip-calculator": {
		id: "sip-calculator",
		title: "SIP Calculator",
		defaults: { monthlyInvestment: 10000, annualReturn: 12, years: 10 },
		inputs: [
			{ key: "monthlyInvestment", label: "Monthly Investment", prefix: "₹", min: 0, step: 500 },
			{ key: "annualReturn", label: "Expected Return", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "years", label: "Time Period", addonAfter: "years", min: 1, step: 1 },
		],
		calculate: calculateSip,
	},
	"compound-interest": {
		id: "compound-interest",
		title: "Compound Interest Calculator",
		defaults: { principal: 100000, annualRate: 8, years: 5, compoundsPerYear: 4 },
		inputs: [
			{ key: "principal", label: "Principal", prefix: "₹", min: 0, step: 1000 },
			{ key: "annualRate", label: "Annual Rate", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "years", label: "Time Period", addonAfter: "years", min: 1, step: 1 },
			{ key: "compoundsPerYear", label: "Compounds / Year", min: 1, step: 1 },
		],
		calculate: calculateCompoundInterest,
	},
	"simple-interest": {
		id: "simple-interest",
		title: "Simple Interest Calculator",
		defaults: { principal: 100000, annualRate: 8, years: 3 },
		inputs: [
			{ key: "principal", label: "Principal", prefix: "₹", min: 0, step: 1000 },
			{ key: "annualRate", label: "Annual Rate", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "years", label: "Time Period", addonAfter: "years", min: 1, step: 1 },
		],
		calculate: calculateSimpleInterest,
	},
	"fd-rd-calculator": {
		id: "fd-rd-calculator",
		title: "FD / RD Calculator",
		defaults: { mode: "FD", deposit: 100000, annualRate: 7, years: 5, compoundsPerYear: 4 },
		inputs: [
			{
				key: "mode",
				label: "Deposit Type",
				type: "select",
				options: [
					{ label: "Fixed Deposit", value: "FD" },
					{ label: "Recurring Deposit", value: "RD" },
				],
			},
			{ key: "deposit", label: "Deposit Amount", prefix: "₹", min: 0, step: 1000 },
			{ key: "annualRate", label: "Interest Rate", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "years", label: "Tenure", addonAfter: "years", min: 1, step: 1 },
			{ key: "compoundsPerYear", label: "FD Compounds / Year", min: 1, step: 1 },
		],
		calculate: calculateFdRd,
	},
	"loan-eligibility": {
		id: "loan-eligibility",
		title: "Loan Eligibility Calculator",
		defaults: { monthlyIncome: 120000, obligations: 20000, annualRate: 9, tenureYears: 20, foir: 50 },
		inputs: [
			{ key: "monthlyIncome", label: "Monthly Income", prefix: "₹", min: 0, step: 1000 },
			{ key: "obligations", label: "Existing EMIs", prefix: "₹", min: 0, step: 1000 },
			{ key: "annualRate", label: "Interest Rate", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "tenureYears", label: "Tenure", addonAfter: "years", min: 1, step: 1 },
			{ key: "foir", label: "FOIR", addonAfter: "%", min: 10, max: 80, step: 1 },
		],
		calculate: calculateLoanEligibility,
	},
	"credit-card-payoff": {
		id: "credit-card-payoff",
		title: "Credit Card Payoff Calculator",
		defaults: { balance: 75000, apr: 36, monthlyPayment: 8000 },
		inputs: [
			{ key: "balance", label: "Card Balance", prefix: "₹", min: 0, step: 1000 },
			{ key: "apr", label: "APR", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "monthlyPayment", label: "Monthly Payment", prefix: "₹", min: 0, step: 500 },
		],
		calculate: calculateCreditCardPayoff,
	},
	"salary-breakup": {
		id: "salary-breakup",
		title: "Salary Breakup Calculator",
		defaults: {
			annualCtc: 1800000,
			basicPercent: 40,
			hraPercent: 50,
			pfPercent: 12,
			annualTax: 180000,
			professionalTaxMonthly: 200,
			otherDeductionsMonthly: 0,
		},
		inputs: [
			{ key: "annualCtc", label: "Annual CTC", prefix: "₹", min: 0, step: 10000 },
			{ key: "basicPercent", label: "Basic % of CTC", addonAfter: "%", min: 0, max: 100, step: 1 },
			{ key: "hraPercent", label: "HRA % of Basic", addonAfter: "%", min: 0, max: 100, step: 1 },
			{ key: "pfPercent", label: "Employee PF", addonAfter: "%", min: 0, max: 12, step: 1 },
			{ key: "annualTax", label: "Annual Income Tax", prefix: "₹", min: 0, step: 1000 },
			{ key: "professionalTaxMonthly", label: "Professional Tax", prefix: "₹", min: 0, step: 100 },
			{ key: "otherDeductionsMonthly", label: "Other Monthly Deductions", prefix: "₹", min: 0, step: 100 },
		],
		calculate: calculateSalaryBreakup,
	},
	"inflation-calculator": {
		id: "inflation-calculator",
		title: "Inflation Calculator",
		defaults: { currentCost: 100000, inflationRate: 6, years: 10 },
		inputs: [
			{ key: "currentCost", label: "Current Cost", prefix: "₹", min: 0, step: 1000 },
			{ key: "inflationRate", label: "Inflation Rate", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "years", label: "Time Period", addonAfter: "years", min: 1, step: 1 },
		],
		calculate: calculateInflation,
	},
	"discount-calculator": {
		id: "discount-calculator",
		title: "Discount Calculator",
		defaults: { originalPrice: 5000, discountPercent: 20, taxPercent: 18 },
		inputs: [
			{ key: "originalPrice", label: "Original Price", prefix: "₹", min: 0, step: 100 },
			{ key: "discountPercent", label: "Discount", addonAfter: "%", min: 0, max: 100, step: 1 },
			{ key: "taxPercent", label: "Tax", addonAfter: "%", min: 0, step: 0.1 },
		],
		calculate: calculateDiscount,
	},
	"net-worth-calculator": {
		id: "net-worth-calculator",
		title: "Net Worth Calculator",
		defaults: {
			cash: 250000,
			investments: 1500000,
			property: 8000000,
			otherAssets: 200000,
			homeLoan: 3500000,
			personalLoan: 200000,
			creditCardDebt: 50000,
			otherLiabilities: 0,
		},
		inputs: [
			{ key: "cash", label: "Cash / Bank", prefix: "₹", min: 0, step: 1000 },
			{ key: "investments", label: "Investments", prefix: "₹", min: 0, step: 1000 },
			{ key: "property", label: "Property", prefix: "₹", min: 0, step: 1000 },
			{ key: "otherAssets", label: "Other Assets", prefix: "₹", min: 0, step: 1000 },
			{ key: "homeLoan", label: "Home Loan", prefix: "₹", min: 0, step: 1000 },
			{ key: "personalLoan", label: "Personal Loan", prefix: "₹", min: 0, step: 1000 },
			{ key: "creditCardDebt", label: "Credit Card Debt", prefix: "₹", min: 0, step: 1000 },
			{ key: "otherLiabilities", label: "Other Liabilities", prefix: "₹", min: 0, step: 1000 },
		],
		calculate: calculateNetWorth,
	},
	"emi-amortization": {
		id: "emi-amortization",
		title: "EMI with Amortization Schedule",
		defaults: { principal: 5000000, annualRate: 8.5, tenureYears: 20 },
		inputs: [
			{ key: "principal", label: "Loan Amount", prefix: "₹", min: 0, step: 10000 },
			{ key: "annualRate", label: "Interest Rate", addonAfter: "%", min: 0, step: 0.1 },
			{ key: "tenureYears", label: "Tenure", addonAfter: "years", min: 1, step: 1 },
		],
		calculate: calculateEmiAmortization,
	},
	"percentage-profit-margin": {
		id: "percentage-profit-margin",
		title: "Percentage and Profit Margin Calculator",
		defaults: { initialValue: 1000, finalValue: 1250, costPrice: 800, sellingPrice: 1250 },
		inputs: [
			{ key: "initialValue", label: "Initial Value", prefix: "₹", step: 100 },
			{ key: "finalValue", label: "Final Value", prefix: "₹", step: 100 },
			{ key: "costPrice", label: "Cost Price", prefix: "₹", min: 0, step: 100 },
			{ key: "sellingPrice", label: "Selling Price", prefix: "₹", min: 0, step: 100 },
		],
		calculate: calculatePercentageProfitMargin,
	},
};
