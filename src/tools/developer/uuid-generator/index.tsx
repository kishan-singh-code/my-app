import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Input, InputNumber, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { generateUuids } from "./helper";

const { TextArea } = Input;

const UuidGenerator = () => {
	const [count, setCount] = useState(5);
	const [output, setOutput] = useState(() => generateUuids(5));
	const copyToClipboard = useCopyToClipboard();

	const handleGenerate = () => setOutput(generateUuids(count));

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Space wrap>
					<Space.Compact>
						<Button disabled>Count</Button>
						<InputNumber min={1} max={100} value={count} onChange={(value) => setCount(value ?? 1)} />
					</Space.Compact>
					<Button type="primary" icon={<ReloadOutlined />} onClick={handleGenerate}>
						Generate
					</Button>
					<Button icon={<CopyOutlined />} onClick={() => copyToClipboard(output)} disabled={!output}>
						Copy
					</Button>
				</Space>
				<Card title="UUID v4">
					<TextArea value={output} rows={12} readOnly />
				</Card>
			</Space>
		</ToolContainer>
	);
};

export default UuidGenerator;
