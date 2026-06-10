import { Col, Empty, Row, Space, Typography } from "antd";
import { useParams } from "react-router-dom";
import { ToolCard } from "../../components/shared/ToolCard";
import { getCategoryById, getToolsByCategory } from "../../tools";

export const CategoryPage = () => {
	const { category } = useParams();
	const categoryDefinition = getCategoryById(category);
	const categoryTools = getToolsByCategory(category);

	if (!categoryDefinition) {
		return <Empty description="Category not found" />;
	}

	return (
		<Space orientation="vertical" size="large" style={{ width: "100%" }}>
			<div>
				<Typography.Title level={1} style={{ marginTop: 0, marginBottom: 8 }}>
					{categoryDefinition.title}
				</Typography.Title>
				<Typography.Text type="secondary">{categoryDefinition.description}</Typography.Text>
			</div>
			<Row gutter={[16, 16]}>
				{categoryTools.map((tool) => (
					<Col key={tool.id} xs={24} sm={12} lg={8} xxl={6}>
						<ToolCard tool={tool} />
					</Col>
				))}
			</Row>
		</Space>
	);
};
