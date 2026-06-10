export type CleanMode = "spaces" | "blank-lines" | "both";

const normalizeSpaces = (value: string) =>
	value
		.split(/\r?\n/)
		.map((line) => line.replace(/[\t ]+/g, " ").trim())
		.join("\n");

const normalizeBlankLines = (value: string) => value.replace(/(?:\r?\n){2,}/g, "\n");

export const cleanText = (value: string, mode: CleanMode) => {
	if (mode === "spaces") {
		return normalizeSpaces(value);
	}

	if (mode === "blank-lines") {
		return normalizeBlankLines(value);
	}

	return normalizeBlankLines(normalizeSpaces(value));
};
