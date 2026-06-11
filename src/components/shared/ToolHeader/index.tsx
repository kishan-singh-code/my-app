import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import type { IToolDefinition } from "../../../types/toolTypes";

export const ToolHeader = ({ tool }: { tool: IToolDefinition }) => {
	const navigate = useNavigate();

	return (
		<div>
			<Flex align="flex-start" justify="space-between" gap="middle" wrap>
				<div>
					<Typography.Title level={4} style={{ marginTop: 0, marginBottom: 6 }}>
						{tool.title}
					</Typography.Title>
					<Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 820 }}>
						{tool.description}
					</Typography.Paragraph>
				</div>
				<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
					Back
				</Button>
			</Flex>
		</div>
	);
};
