export type DiffPartType = "same" | "added" | "removed";

export interface DiffPart {
	type: DiffPartType;
	text: string;
	leftLine?: number;
	rightLine?: number;
}

const splitLines = (value: string) => (value ? value.split(/\r?\n/) : []);

export const buildLineDiff = (leftText: string, rightText: string): DiffPart[] => {
	const leftLines = splitLines(leftText);
	const rightLines = splitLines(rightText);
	const table = Array.from({ length: leftLines.length + 1 }, () => Array.from({ length: rightLines.length + 1 }, () => 0));

	for (let leftIndex = leftLines.length - 1; leftIndex >= 0; leftIndex -= 1) {
		for (let rightIndex = rightLines.length - 1; rightIndex >= 0; rightIndex -= 1) {
			table[leftIndex][rightIndex] =
				leftLines[leftIndex] === rightLines[rightIndex]
					? table[leftIndex + 1][rightIndex + 1] + 1
					: Math.max(table[leftIndex + 1][rightIndex], table[leftIndex][rightIndex + 1]);
		}
	}

	const diffParts: DiffPart[] = [];
	let leftIndex = 0;
	let rightIndex = 0;

	while (leftIndex < leftLines.length && rightIndex < rightLines.length) {
		if (leftLines[leftIndex] === rightLines[rightIndex]) {
			diffParts.push({ type: "same", text: leftLines[leftIndex], leftLine: leftIndex + 1, rightLine: rightIndex + 1 });
			leftIndex += 1;
			rightIndex += 1;
		} else if (table[leftIndex + 1][rightIndex] >= table[leftIndex][rightIndex + 1]) {
			diffParts.push({ type: "removed", text: leftLines[leftIndex], leftLine: leftIndex + 1 });
			leftIndex += 1;
		} else {
			diffParts.push({ type: "added", text: rightLines[rightIndex], rightLine: rightIndex + 1 });
			rightIndex += 1;
		}
	}

	while (leftIndex < leftLines.length) {
		diffParts.push({ type: "removed", text: leftLines[leftIndex], leftLine: leftIndex + 1 });
		leftIndex += 1;
	}

	while (rightIndex < rightLines.length) {
		diffParts.push({ type: "added", text: rightLines[rightIndex], rightLine: rightIndex + 1 });
		rightIndex += 1;
	}

	return diffParts;
};
