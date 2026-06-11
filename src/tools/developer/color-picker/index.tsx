import { CopyOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Space, Typography } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { getColorValues } from "./helper";

const ColorPicker = () => {
	const [color, setColor] = useState("#1677ff");
	const colorValues = getColorValues(color);
	const copyToClipboard = useCopyToClipboard();

	const entries = [
		{ label: "HEX", value: colorValues.hex },
		{ label: "RGB", value: colorValues.rgb },
		{ label: "HSL", value: colorValues.hsl },
		{ label: "CSS", value: colorValues.cssVariable },
	];

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} md={8}>
						<Input
							type="color"
							value={colorValues.hex}
							onChange={(event) => setColor(event.target.value)}
							style={{ height: 72, padding: 8 }}
						/>
					</Col>
					<Col xs={24} md={16}>
						<Input value={colorValues.hex} onChange={(event) => setColor(event.target.value)} addonBefore="Color" />
					</Col>
				</Row>
				<div style={{ height: 120, borderRadius: 8, background: colorValues.hex }} />
				<Row gutter={[16, 16]}>
					{entries.map((entry) => (
						<Col xs={24} md={12} key={entry.label}>
							<Card
								title={entry.label}
								extra={
									<Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(entry.value)}>
										Copy
									</Button>
								}
							>
								<Typography.Text code copyable>
									{entry.value}
								</Typography.Text>
							</Card>
						</Col>
					))}
				</Row>
			</Space>
		</ToolContainer>
	);
};

export default ColorPicker;
