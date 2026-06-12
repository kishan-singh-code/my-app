export type IVTracerColorMode = "color" | "binary";
export type IVTracerHierarchicalMode = "stacked" | "cutout";
export type IVTracerPathMode = "none" | "polygon" | "spline";

export interface IVTracerConfig {
	colorMode: IVTracerColorMode;
	hierarchicalMode: IVTracerHierarchicalMode;
	pathMode: IVTracerPathMode;
	filterSpeckle: number;
	colorPrecision: number;
	layerDifference: number;
	pathPrecision: number;
	cornerThreshold: number;
	lengthThreshold: number;
	spliceThreshold: number;
	maxIterations: number;
}

export const defaultVTracerConfig: IVTracerConfig = {
	colorMode: "color",
	hierarchicalMode: "stacked",
	pathMode: "spline",
	filterSpeckle: 4,
	colorPrecision: 8,
	layerDifference: 25,
	pathPrecision: 8,
	cornerThreshold: 60,
	lengthThreshold: 4,
	spliceThreshold: 45,
	maxIterations: 10,
};

export const colorModeOptions = [
	{ label: "Color", value: "color" },
	{ label: "Binary", value: "binary" },
];

export const hierarchicalModeOptions = [
	{ label: "Stacked", value: "stacked" },
	{ label: "Cutout", value: "cutout" },
];

export const pathModeOptions = [
	{ label: "Spline", value: "spline" },
	{ label: "Polygon", value: "polygon" },
	{ label: "None", value: "none" },
];

export const toVTracerParams = (config: IVTracerConfig, canvasId: string, svgId: string) => ({
	canvas_id: canvasId,
	svg_id: svgId,
	mode: config.pathMode,
	clustering_mode: config.colorMode,
	hierarchical: config.hierarchicalMode,
	corner_threshold: (config.cornerThreshold / 180) * Math.PI,
	length_threshold: config.lengthThreshold,
	max_iterations: config.maxIterations,
	splice_threshold: (config.spliceThreshold / 180) * Math.PI,
	filter_speckle: config.filterSpeckle * config.filterSpeckle,
	color_precision: 8 - config.colorPrecision,
	layer_difference: config.layerDifference,
	path_precision: config.pathPrecision,
});
