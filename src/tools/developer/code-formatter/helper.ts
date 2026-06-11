import prettier from "prettier/standalone";
import type { Plugin } from "prettier";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import htmlPlugin from "prettier/plugins/html";
import postcssPlugin from "prettier/plugins/postcss";
import typescriptPlugin from "prettier/plugins/typescript";

export type ICodeLanguage = "javascript" | "typescript" | "json" | "html" | "css";

export interface IFormatCodeResult {
	ok: boolean;
	output: string;
	error?: string;
}

const parserByLanguage: Record<ICodeLanguage, string> = {
	javascript: "babel",
	typescript: "typescript",
	json: "json",
	html: "html",
	css: "css",
};

const pluginsByLanguage: Record<ICodeLanguage, Plugin[]> = {
	javascript: [babelPlugin, estreePlugin],
	typescript: [typescriptPlugin, estreePlugin],
	json: [babelPlugin, estreePlugin],
	html: [htmlPlugin],
	css: [postcssPlugin],
};

export const formatCode = async (value: string, language: ICodeLanguage): Promise<IFormatCodeResult> => {
	if (!value.trim()) {
		return { ok: true, output: "" };
	}

	try {
		const output = await prettier.format(value, {
			parser: parserByLanguage[language],
			plugins: pluginsByLanguage[language],
			tabWidth: 2,
			useTabs: false,
			semi: true,
			singleQuote: false,
		});

		return { ok: true, output: output.trimEnd() };
	} catch (error) {
		return { ok: false, output: "", error: error instanceof Error ? error.message : "Unable to format code" };
	}
};
