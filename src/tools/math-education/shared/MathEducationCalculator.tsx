import { Button, Card, Col, Input, InputNumber, Row, Select, Space, Statistic, Table, Typography } from "antd";
import { all, create } from "mathjs";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import {
	mathCalculators,
	type IMathEducationCalculatorId,
	type IMathInputDefinition,
	type IMathInputValue,
	type IMathMetric,
} from "./calculators";

const { TextArea } = Input;
const math = create(all, {});

const getMetricColor = (tone: IMathMetric["tone"]) => {
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

const formatScientificResult = (value: unknown) => {
	if (typeof value === "number") {
		return Number.isInteger(value) ? String(value) : value.toPrecision(12).replace(/\.0+$/, "");
	}

	return String(value ?? "");
};

const MathInput = ({
	input,
	value,
	onChange,
}: {
	input: IMathInputDefinition;
	value: IMathInputValue;
	onChange: (value: IMathInputValue) => void;
}) => {
	if (input.type === "select") {
		return <Select value={String(value)} options={input.options} onChange={onChange} />;
	}

	if (input.type === "textarea") {
		return <TextArea value={String(value)} rows={5} placeholder={input.placeholder} onChange={(event) => onChange(event.target.value)} />;
	}

	if (input.type === "text") {
		return <Input value={String(value)} placeholder={input.placeholder} onChange={(event) => onChange(event.target.value)} />;
	}

	const numberInput = (
		<InputNumber
			value={Number(value)}
			onChange={(nextValue) => onChange(nextValue ?? 0)}
			min={input.min}
			max={input.max}
			step={input.step}
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

const ScientificCalculator = () => {
	const [expression, setExpression] = useState("sin(30) + log(100) + 2^3");
	const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
	const [memory, setMemory] = useState(0);
	const [result, setResult] = useState("0");
	const [error, setError] = useState("");

	const evaluateExpression = (nextExpression = expression) => {
		try {
			const scope =
				angleMode === "deg"
					? {
							sin: (value: number) => Math.sin((value * Math.PI) / 180),
							cos: (value: number) => Math.cos((value * Math.PI) / 180),
							tan: (value: number) => Math.tan((value * Math.PI) / 180),
							asin: (value: number) => (Math.asin(value) * 180) / Math.PI,
							acos: (value: number) => (Math.acos(value) * 180) / Math.PI,
							atan: (value: number) => (Math.atan(value) * 180) / Math.PI,
							memory,
						}
					: { memory };
			const nextResult = math.evaluate(nextExpression, scope);
			const formattedResult = formatScientificResult(nextResult);

			setResult(formattedResult);
			setError("");
			return Number(nextResult);
		} catch (caughtError) {
			setError(caughtError instanceof Error ? caughtError.message : "Unable to evaluate expression");
			return Number.NaN;
		}
	};

	const appendToken = (token: string) => setExpression((currentExpression) => `${currentExpression}${token}`);
	const memoryValue = Number(result);
	const buttonGroups = [
		["7", "8", "9", "/", "sin("],
		["4", "5", "6", "*", "cos("],
		["1", "2", "3", "-", "tan("],
		["0", ".", "(", ")", "+"],
		["^", "sqrt(", "log10(", "log(", "pi"],
	];

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={10}>
						<Card title="Scientific Calculator">
							<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
								<Select
									value={angleMode}
									options={[
										{ label: "Degrees", value: "deg" },
										{ label: "Radians", value: "rad" },
									]}
									onChange={setAngleMode}
								/>
								<TextArea value={expression} rows={4} onChange={(event) => setExpression(event.target.value)} />
								<Row gutter={[8, 8]}>
									{buttonGroups.flat().map((token) => (
										<Col span={Math.floor(24 / 5)} key={token}>
											<Button block onClick={() => appendToken(token)}>
												{token}
											</Button>
										</Col>
									))}
								</Row>
								<Space wrap>
									<Button type="primary" onClick={() => evaluateExpression()}>
										Evaluate
									</Button>
									<Button onClick={() => setExpression("")}>Clear</Button>
									<Button onClick={() => setExpression(result)}>Use Result</Button>
								</Space>
								<Space wrap>
									<Button onClick={() => setMemory(0)}>MC</Button>
									<Button onClick={() => appendToken("memory")}>MR</Button>
									<Button onClick={() => Number.isFinite(memoryValue) && setMemory((currentMemory) => currentMemory + memoryValue)}>
										M+
									</Button>
									<Button onClick={() => Number.isFinite(memoryValue) && setMemory((currentMemory) => currentMemory - memoryValue)}>
										M-
									</Button>
								</Space>
							</Space>
						</Card>
					</Col>
					<Col xs={24} lg={14}>
						<Space orientation="vertical" size="large" style={{ width: "100%" }}>
							<Card>
								<Statistic title="Result" value={result} />
							</Card>
							<Card>
								<Statistic title="Memory" value={formatScientificResult(memory)} />
							</Card>
							{error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};

export const MathEducationCalculator = ({ calculatorId }: { calculatorId: IMathEducationCalculatorId }) => {
	const calculator = mathCalculators[calculatorId];
	const [values, setValues] = useState<Record<string, IMathInputValue>>(calculator.defaults);
	const result = calculator.calculate(values);

	if (calculatorId === "scientific-calculator") {
		return <ScientificCalculator />;
	}

	const updateValue = (key: string, value: IMathInputValue) => setValues((currentValues) => ({ ...currentValues, [key]: value }));
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
										<MathInput input={input} value={values[input.key]} onChange={(value) => updateValue(input.key, value)} />
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
							{result.output ? (
								<Card title="Output">
									<TextArea value={result.output} rows={6} readOnly />
								</Card>
							) : null}
							{result.tableColumns?.length && result.tableData?.length ? (
								<Card title="Details">
									<Table columns={result.tableColumns} dataSource={result.tableData} pagination={{ pageSize: 8 }} scroll={{ x: true }} />
								</Card>
							) : null}
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};
