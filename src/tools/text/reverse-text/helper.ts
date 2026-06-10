export type ReverseMode = "characters" | "words" | "lines";

export const reverseText = (value: string, mode: ReverseMode) => {
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
