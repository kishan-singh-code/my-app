import { Card, Empty, Spin } from "antd";
import { Suspense, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToolHeader } from "../../components/shared/ToolHeader";
import { useAppContext } from "../../contexts/AppContext";
import { ToolLayout } from "../../app/layout/ToolLayout";
import { getToolByRoute } from "../../tools";

export const ToolPage = () => {
	const { category, toolSlug } = useParams();
	const { trackToolOpen } = useAppContext();
	const tool = getToolByRoute(category, toolSlug);

	useEffect(() => {
		if (tool) {
			trackToolOpen(tool.path);
		}
	}, [tool, trackToolOpen]);

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
