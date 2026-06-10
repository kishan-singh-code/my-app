import { lazy } from "react";
import type { ToolCategory, ToolCategoryDefinition, ToolDefinition } from "../types/tool";

const textCategory: ToolCategory = "text";
const textCategoryLabel = "Text";

export const toolCategories: ToolCategoryDefinition[] = [
	{
		id: textCategory,
		title: "Text Tools",
		description: "Format, clean, validate, compare, encode, and preview text directly in the browser.",
		path: "/tools/text",
	},
	{
		id: "pdf",
		title: "PDF Tools",
		description: "Merge, split, rotate, reorder, watermark, and preview PDFs.",
		path: "/tools/pdf",
	},
	{
		id: "image",
		title: "Image Tools",
		description: "Resize, crop, compress, convert, rotate, watermark, and filter images.",
		path: "/tools/image",
	},
	{
		id: "developer",
		title: "Developer Tools",
		description: "Format code, decode JWTs, generate UUIDs, parse URLs, and inspect headers.",
		path: "/tools/developer",
	},
	{
		id: "encoding-security",
		title: "Encoding & Security Tools",
		description: "Hash, encrypt, decrypt, encode, and decode browser-safe data.",
		path: "/tools/encoding-security",
	},
	{
		id: "calculators",
		title: "Calculators",
		description: "Age, EMI, percentage, units, and timezone calculations.",
		path: "/tools/calculators",
	},
	{
		id: "design",
		title: "Design Tools",
		description: "Generate palettes, gradients, QR codes, previews, and font tests.",
		path: "/tools/design",
	},
	{
		id: "data",
		title: "Data Tools",
		description: "View CSV, convert JSON tables, clean records, and inspect spreadsheets.",
		path: "/tools/data",
	},
];

export const tools: ToolDefinition[] = [
	{
		id: "case-converter",
		slug: "case-converter",
		title: "Case Converter",
		description: "Convert text to uppercase, lowercase, title case, sentence case, and developer-friendly slugs.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/case-converter",
		keywords: ["case", "uppercase", "lowercase", "title", "sentence", "slug"],
		component: lazy(() => import("./text/case-converter")),
	},
	{
		id: "remove-duplicate-lines",
		slug: "remove-duplicate-lines",
		title: "Remove Duplicate Lines",
		description: "Keep the first occurrence of each line and remove repeated lines.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/remove-duplicate-lines",
		keywords: ["duplicate", "lines", "unique", "dedupe"],
		component: lazy(() => import("./text/remove-duplicate-lines")),
	},
	{
		id: "sort-text",
		slug: "sort-text",
		title: "Sort Text",
		description: "Sort lines alphabetically from A to Z or Z to A.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/sort-text",
		keywords: ["sort", "alphabetical", "lines", "az", "za"],
		component: lazy(() => import("./text/sort-text")),
	},
	{
		id: "reverse-text",
		slug: "reverse-text",
		title: "Reverse Text",
		description: "Reverse characters, words, or lines.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/reverse-text",
		keywords: ["reverse", "words", "characters", "lines"],
		component: lazy(() => import("./text/reverse-text")),
	},
	{
		id: "word-character-counter",
		slug: "word-character-counter",
		title: "Word and Character Counter",
		description: "Count words, characters, lines, paragraphs, and estimated reading time.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/word-character-counter",
		keywords: ["counter", "words", "characters", "reading", "stats"],
		component: lazy(() => import("./text/word-character-counter")),
	},
	{
		id: "remove-extra-spaces",
		slug: "remove-extra-spaces",
		title: "Remove Extra Spaces",
		description: "Normalize repeated spaces and blank lines.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/remove-extra-spaces",
		keywords: ["spaces", "blank lines", "trim", "normalize", "cleanup"],
		component: lazy(() => import("./text/remove-extra-spaces")),
	},
	{
		id: "text-diff-checker",
		slug: "text-diff-checker",
		title: "Text Diff Checker",
		description: "Compare two text blocks line by line.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/text-diff-checker",
		keywords: ["diff", "compare", "changes", "lines"],
		component: lazy(() => import("./text/text-diff-checker")),
	},
	{
		id: "regex-tester",
		slug: "regex-tester",
		title: "Regex Tester",
		description: "Test regular expressions and inspect matches in text.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/regex-tester",
		keywords: ["regex", "regexp", "matches", "pattern"],
		component: lazy(() => import("./text/regex-tester")),
	},
	{
		id: "json-formatter",
		slug: "json-formatter",
		title: "JSON Formatter",
		description: "Validate, format, and minify JSON.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/json-formatter",
		keywords: ["json", "formatter", "validator", "minify", "pretty"],
		component: lazy(() => import("./text/json-formatter")),
	},
	{
		id: "xml-formatter",
		slug: "xml-formatter",
		title: "XML Formatter",
		description: "Validate and format XML with browser parsing APIs.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/xml-formatter",
		keywords: ["xml", "formatter", "validator", "pretty"],
		component: lazy(() => import("./text/xml-formatter")),
	},
	{
		id: "csv-json-converter",
		slug: "csv-json-converter",
		title: "CSV and JSON Converter",
		description: "Convert CSV to JSON and JSON arrays back to CSV.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/csv-json-converter",
		keywords: ["csv", "json", "convert", "table", "data"],
		component: lazy(() => import("./text/csv-json-converter")),
	},
	{
		id: "base64-codec",
		slug: "base64-codec",
		title: "Base64 Encode Decode",
		description: "Encode text to Base64 or decode Base64 back to text.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/base64-codec",
		keywords: ["base64", "encode", "decode"],
		component: lazy(() => import("./text/base64-codec")),
	},
	{
		id: "url-codec",
		slug: "url-codec",
		title: "URL Encode Decode",
		description: "Encode or decode URL components safely in the browser.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/url-codec",
		keywords: ["url", "uri", "encode", "decode", "percent"],
		component: lazy(() => import("./text/url-codec")),
	},
	{
		id: "html-codec",
		slug: "html-codec",
		title: "HTML Encode Decode",
		description: "Encode HTML entities or decode entity strings back to text.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/html-codec",
		keywords: ["html", "entities", "escape", "encode", "decode"],
		component: lazy(() => import("./text/html-codec")),
	},
	{
		id: "markdown-preview",
		slug: "markdown-preview",
		title: "Markdown Preview",
		description: "Preview safe Markdown output without sending content to a server.",
		category: textCategory,
		categoryLabel: textCategoryLabel,
		path: "/tools/text/markdown-preview",
		keywords: ["markdown", "preview", "md", "render"],
		component: lazy(() => import("./text/markdown-preview")),
	},
];

export const getCategoryById = (categoryId: string | undefined) => toolCategories.find((category) => category.id === categoryId);

export const getToolsByCategory = (categoryId: string | undefined) => tools.filter((tool) => tool.category === categoryId);

export const getToolByRoute = (categoryId: string | undefined, slug: string | undefined) =>
	tools.find((tool) => tool.category === categoryId && tool.slug === slug);

export const searchTools = (query: string) => {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return tools;
	}

	return tools.filter((tool) =>
		[tool.title, tool.description, tool.categoryLabel, ...tool.keywords].join(" ").toLowerCase().includes(normalizedQuery),
	);
};
