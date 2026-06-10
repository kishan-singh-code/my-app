import { Card } from "antd";
import type { ReactNode } from "react";

export const ToolContainer = ({ children }: { children: ReactNode }) => {
	return <Card>{children}</Card>;
};
