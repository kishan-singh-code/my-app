import { CopyOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Typography } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { cronPresets, getCronDescription } from "./helper";

const CronGenerator = () => {
	const [expression, setExpression] = useState(cronPresets[0].value);
	const copyToClipboard = useCopyToClipboard();

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Space wrap>
					<Select
						value={expression}
						options={cronPresets.map((preset) => ({ label: preset.label, value: preset.value }))}
						style={{ minWidth: 240 }}
						onChange={setExpression}
					/>
					<Button icon={<CopyOutlined />} onClick={() => copyToClipboard(expression)}>
						Copy
					</Button>
				</Space>
				<Card title="Cron expression">
					<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
						<Input value={expression} onChange={(event) => setExpression(event.target.value)} />
						<Typography.Text type="secondary">{getCronDescription(expression)}</Typography.Text>
					</Space>
				</Card>
			</Space>
		</ToolContainer>
	);
};

export default CronGenerator;
