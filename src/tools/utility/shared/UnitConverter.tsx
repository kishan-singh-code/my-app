import { SwapOutlined } from "@ant-design/icons";
import { Button, Card, Col, InputNumber, Row, Select, Space, Statistic, Table, Typography } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import {
	conversionTableColumns,
	convertUnit,
	createConversionTable,
	formatNumber,
	utilityConverters,
	type IUtilityConverterId,
} from "./converters";

export const UnitConverter = ({ converterId }: { converterId: IUtilityConverterId }) => {
	const converter = utilityConverters[converterId];
	const [value, setValue] = useState(converter.defaultValue);
	const [fromUnit, setFromUnit] = useState(converter.defaultFrom);
	const [toUnit, setToUnit] = useState(converter.defaultTo);
	const convertedValue = convertUnit(converter, value, fromUnit, toUnit);
	const selectedToUnit = converter.units.find((unit) => unit.key === toUnit) ?? converter.units[0];
	const tableData = createConversionTable(converter, value, fromUnit);
	const unitOptions = converter.units.map((unit) => ({ label: `${unit.label} (${unit.symbol})`, value: unit.key }));

	const resetConverter = () => {
		setValue(converter.defaultValue);
		setFromUnit(converter.defaultFrom);
		setToUnit(converter.defaultTo);
	};

	const swapUnits = () => {
		setFromUnit(toUnit);
		setToUnit(fromUnit);
	};

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9} xl={8}>
						<Card
							title="Convert"
							extra={
								<Button size="small" onClick={resetConverter}>
									Reset
								</Button>
							}
						>
							<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
								<Space orientation="vertical" size={4} style={{ width: "100%" }}>
									<Typography.Text strong>Value</Typography.Text>
									<InputNumber value={value} onChange={(nextValue) => setValue(nextValue ?? 0)} style={{ width: "100%" }} />
								</Space>
								<Space orientation="vertical" size={4} style={{ width: "100%" }}>
									<Typography.Text strong>From</Typography.Text>
									<Select value={fromUnit} options={unitOptions} onChange={setFromUnit} />
								</Space>
								<Space orientation="vertical" size={4} style={{ width: "100%" }}>
									<Typography.Text strong>To</Typography.Text>
									<Select value={toUnit} options={unitOptions} onChange={setToUnit} />
								</Space>
								<Button icon={<SwapOutlined />} onClick={swapUnits}>
									Swap Units
								</Button>
								{converter.note ? <Typography.Text type="secondary">{converter.note}</Typography.Text> : null}
							</Space>
						</Card>
					</Col>
					<Col xs={24} lg={15} xl={16}>
						<Space orientation="vertical" size="large" style={{ width: "100%" }}>
							<Row gutter={[16, 16]}>
								<Col xs={24} md={12}>
									<Card>
										<Statistic
											title="Converted Value"
											value={`${formatNumber(convertedValue, converter.precision)} ${selectedToUnit.symbol}`}
										/>
									</Card>
								</Col>
								<Col xs={24} md={12}>
									<Card>
										<Statistic title="Base Unit" value={converter.baseUnitLabel} />
									</Card>
								</Col>
							</Row>
							<Card title="All Conversions">
								<Table columns={conversionTableColumns} dataSource={tableData} pagination={false} scroll={{ x: true }} />
							</Card>
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};
