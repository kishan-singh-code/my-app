export type SortDirection = "asc" | "desc";

export const sortLines = (value: string, direction: SortDirection, ignoreCase: boolean) => {
	const sortedLines = value.split(/\r?\n/).sort((leftLine, rightLine) => {
		const leftValue = ignoreCase ? leftLine.toLowerCase() : leftLine;
		const rightValue = ignoreCase ? rightLine.toLowerCase() : rightLine;
		return leftValue.localeCompare(rightValue, undefined, { sensitivity: ignoreCase ? "base" : "variant" });
	});

	return direction === "asc" ? sortedLines.join("\n") : sortedLines.reverse().join("\n");
};
