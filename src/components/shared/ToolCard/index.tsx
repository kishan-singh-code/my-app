import { ArrowRightOutlined } from "@ant-design/icons";
import { Card, Flex, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import type { IToolDefinition } from "../../../types/toolTypes";

export const ToolCard = ({ tool }: { tool: IToolDefinition }) => {
	return (
		<Link to={tool.path} style={{ display: "block", height: "100%" }}>
			<Card hoverable style={{ height: "100%" }}>
				<Flex vertical gap="middle" style={{ height: "100%" }}>
					<div>
						<Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
							{tool.title}
						</Typography.Title>
						<Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
							{tool.description}
						</Typography.Paragraph>
					</div>
					<Flex align="center" justify="space-between" gap="small" style={{ marginTop: "auto" }}>
						<Tag>{tool.categoryLabel}</Tag>
						<ArrowRightOutlined />
					</Flex>
				</Flex>
			</Card>
		</Link>
	);
};
