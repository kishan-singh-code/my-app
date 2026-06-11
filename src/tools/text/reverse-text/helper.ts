export type IReverseMode = "characters" | "words" | "lines";

export const reverseText = (value: string, mode: IReverseMode) => {
	switch (mode) {
		case "characters":
			return Array.from(value).reverse().join("");
		case "words":
			return value.split(/(\s+)/).reverse().join("");
		case "lines":
			return value.split(/\r?\n/).reverse().join("\n");
		default:
			return value;
	}
};
