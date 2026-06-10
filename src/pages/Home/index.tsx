import { Card, Col, Flex, Row, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { getToolsByCategory, toolCategories } from "../../tools";

export const HomePage = () => {
	return (
		<Space orientation="vertical" size="large" style={{ width: "100%" }}>
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<Typography.Title level={3} style={{ margin: 0 }}>
					Categories
				</Typography.Title>
				<Row gutter={[16, 16]}>
					{toolCategories.map((category) => {
						const hasTools = getToolsByCategory(category.id).length > 0;
						const card = (
							<Card hoverable style={{ height: "100%" }}>
								<Flex vertical gap="middle" style={{ height: "100%" }}>
									<Typography.Title level={4} style={{ margin: 0 }}>
										{category.title.toUpperCase()}
									</Typography.Title>
									<Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
										{category.description}
									</Typography.Paragraph>
									<Tag color={hasTools ? "success" : "default"} style={{ width: "fit-content", marginTop: "auto" }}>
										{hasTools ? "Available" : "Planned"}
									</Tag>
								</Flex>
							</Card>
						);

						return (
							<Col key={category.title} xs={24} sm={12} lg={8} xxl={6}>
								<Link to={category.path} style={{ display: "block", height: "100%" }}>
									{card}
								</Link>
							</Col>
						);
					})}
				</Row>
			</Space>
		</Space>
	);
};
