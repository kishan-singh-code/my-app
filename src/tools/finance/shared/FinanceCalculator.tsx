import { Button, Card, Col, InputNumber, Row, Select, Space, Statistic, Table, Typography } from "antd";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import {
	financeCalculators,
	formatMoney,
	type IFinanceCalculatorId,
	type IFinanceInputDefinition,
	type IFinanceInputValue,
	type IFinanceMetric,
} from "./calculators";

const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#14b8a6", "#8b5cf6", "#64748b"];
const chartHeight = 280;

const ChartFrame = ({ children }: { children: (width: number) => ReactNode }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const container = containerRef.current;

		if (!container) {
			return;
		}

		const updateWidth = () => setWidth(Math.floor(container.clientWidth));
		updateWidth();

		const resizeObserver = new ResizeObserver(updateWidth);
		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	}, []);

	return (
		<div ref={containerRef} style={{ width: "100%", height: chartHeight, minWidth: 0, overflow: "hidden" }}>
			{width > 0 ? children(width) : null}
		</div>
	);
};

const getMetricColor = (tone: IFinanceMetric["tone"]) => {
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

const formatChartValue = (value: unknown) => (typeof value === "number" ? formatMoney(value) : String(value ?? ""));

const FinanceInput = ({
	input,
	value,
	onChange,
}: {
	input: IFinanceInputDefinition;
	value: IFinanceInputValue;
	onChange: (value: IFinanceInputValue) => void;
}) => {
	if (input.type === "select") {
		return <Select value={String(value)} options={input.options} onChange={onChange} />;
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

export const FinanceCalculator = ({ calculatorId }: { calculatorId: IFinanceCalculatorId }) => {
	const calculator = financeCalculators[calculatorId];
	const gradientIdPrefix = useId().replace(/:/g, "");
	const [values, setValues] = useState<Record<string, IFinanceInputValue>>(calculator.defaults);
	const result = calculator.calculate(values);
	const lineDataKeys = Object.keys(result.lineData?.[0] ?? {}).filter((key) => key !== "name");

	const updateValue = (key: string, value: IFinanceInputValue) => {
		setValues((currentValues) => ({ ...currentValues, [key]: value }));
	};

	const resetValues = () => setValues(calculator.defaults);
	const getGradientId = (key: string) => `${gradientIdPrefix}-${calculatorId}-${key}`;

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={9} xl={8}>
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
										<FinanceInput input={input} value={values[input.key]} onChange={(value) => updateValue(input.key, value)} />
									</Space>
								))}
							</Space>
						</Card>
					</Col>
					<Col xs={24} md={15} xl={16}>
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

							<Row gutter={[16, 16]}>
								{result.pieData?.length ? (
									<Col xs={24} xl={12}>
										<Card title="Breakdown">
											<ChartFrame>
												{(width) => {
													const outerRadius = Math.max(Math.min(width / 4, 92), 56);
													const innerRadius = Math.max(outerRadius - 38, 24);

													return (
														<PieChart width={width} height={chartHeight}>
															<Pie
																data={result.pieData}
																dataKey="value"
																nameKey="name"
																innerRadius={innerRadius}
																outerRadius={outerRadius}
																paddingAngle={3}
															>
																{result.pieData?.map((entry, index) => (
																	<Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
																))}
															</Pie>
															<Tooltip formatter={formatChartValue} />
															<Legend />
														</PieChart>
													);
												}}
											</ChartFrame>
										</Card>
									</Col>
								) : null}
								{result.lineData?.length ? (
									<Col xs={24} xl={result.pieData?.length ? 12 : 24}>
										<Card title="Timeline">
											<ChartFrame>
												{(width) => (
													<AreaChart
														width={width}
														height={chartHeight}
														data={result.lineData}
														margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
													>
														<defs>
															{lineDataKeys.map((key, index) => {
																const color = chartColors[index % chartColors.length];

																return (
																	<linearGradient key={key} id={getGradientId(key)} x1="0" y1="0" x2="0" y2="1">
																		<stop offset="5%" stopColor={color} stopOpacity={0.45} />
																		<stop offset="95%" stopColor={color} stopOpacity={0.03} />
																	</linearGradient>
																);
															})}
														</defs>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="name" />
														<YAxis tickFormatter={(value) => formatMoney(Number(value)).replace("₹", "₹ ")} width={90} />
														<Tooltip formatter={formatChartValue} />
														<Legend />
														{lineDataKeys.map((key, index) => {
															const color = chartColors[index % chartColors.length];

															return (
																<Area
																	key={key}
																	type="monotone"
																	dataKey={key}
																	stroke={color}
																	strokeWidth={2}
																	fillOpacity={1}
																	fill={`url(#${getGradientId(key)})`}
																	dot={false}
																/>
															);
														})}
													</AreaChart>
												)}
											</ChartFrame>
										</Card>
									</Col>
								) : null}
								{result.barData?.length ? (
									<Col xs={24}>
										<Card title="Comparison">
											<ChartFrame>
												{(width) => (
													<BarChart
														width={width}
														height={chartHeight}
														data={result.barData}
														margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
													>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="name" />
														<YAxis tickFormatter={(value) => formatMoney(Number(value)).replace("₹", "₹ ")} width={90} />
														<Tooltip formatter={formatChartValue} />
														<Bar dataKey="Amount" fill={chartColors[0]} radius={[6, 6, 0, 0]} />
													</BarChart>
												)}
											</ChartFrame>
										</Card>
									</Col>
								) : null}
							</Row>

							{result.tableColumns?.length && result.tableData?.length ? (
								<Card title="Schedule">
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
