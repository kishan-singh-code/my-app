import { Space } from "antd";
import type { ReactNode } from "react";

export const ToolLayout = ({ children }: { children: ReactNode }) => {
	return (
		<Space orientation="vertical" size="large" style={{ width: "100%" }}>
			{children}
		</Space>
	);
};
