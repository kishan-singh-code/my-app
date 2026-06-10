export type CaseMode = "upper" | "lower" | "title" | "sentence" | "camel" | "kebab" | "snake";

const wordsFrom = (value: string) =>
	value
		.trim()
		.split(/[\s_-]+/)
		.filter(Boolean);

const capitalize = (value: string) => (value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : value);

export const convertCase = (value: string, mode: CaseMode) => {
	switch (mode) {
		case "upper":
			return value.toUpperCase();
		case "lower":
			return value.toLowerCase();
		case "title":
			return value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
		case "sentence":
			return value.toLowerCase().replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (letter) => letter.toUpperCase());
		case "camel": {
			const [firstWord = "", ...restWords] = wordsFrom(value).map((word) => word.toLowerCase());
			return `${firstWord}${restWords.map(capitalize).join("")}`;
		}
		case "kebab":
			return wordsFrom(value)
				.map((word) => word.toLowerCase())
				.join("-");
		case "snake":
			return wordsFrom(value)
				.map((word) => word.toLowerCase())
				.join("_");
		default:
			return value;
	}
};
