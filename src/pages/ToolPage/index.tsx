import { Card, Empty, Spin } from "antd";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { ToolHeader } from "../../components/shared/ToolHeader";
import { ToolLayout } from "../../layout/ToolLayout";
import { getToolByRoute } from "../../tools";

export const ToolPage = () => {
	const { category, toolSlug } = useParams();
	const tool = getToolByRoute(category, toolSlug);

	if (!tool) {
		return <Empty description="Tool not found" />;
	}

	const ToolComponent = tool.component;

	return (
		<ToolLayout>
			<ToolHeader tool={tool} />
			<Suspense
				fallback={
					<Card>
						<Spin />
					</Card>
				}
			>
				<ToolComponent />
			</Suspense>
		</ToolLayout>
	);
};
