import type { ComponentType, LazyExoticComponent } from "react";

export type ToolCategory = "text" | "pdf" | "image" | "developer" | "encoding-security" | "calculators" | "design" | "data";

export interface ToolCategoryDefinition {
	id: ToolCategory;
	title: string;
	description: string;
	path: string;
}

export interface ToolDefinition {
	id: string;
	slug: string;
	title: string;
	description: string;
	category: ToolCategory;
	categoryLabel: string;
	path: string;
	keywords: string[];
	component: LazyExoticComponent<ComponentType>;
}
