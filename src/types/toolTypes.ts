import type { ComponentType, LazyExoticComponent } from "react";

export type IToolCategory =
	| "text"
	| "pdf"
	| "image"
	| "developer"
	| "real-life"
	| "time-global"
	| "health-fitness"
	| "finance"
	| "utility"
	| "math-education";

export interface IToolCategoryDefinition {
	id: IToolCategory;
	title: string;
	description: string;
	path: string;
}

export interface IToolDefinition {
	id: string;
	slug: string;
	title: string;
	description: string;
	category: IToolCategory;
	categoryLabel: string;
	path: string;
	keywords: string[];
	component: LazyExoticComponent<ComponentType>;
}
