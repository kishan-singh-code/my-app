export const removeDuplicateLines = (value: string, ignoreCase: boolean) => {
	const seenLines = new Set<string>();

	return value
		.split(/\r?\n/)
		.filter((line) => {
			const key = ignoreCase ? line.toLowerCase() : line;

			if (seenLines.has(key)) {
				return false;
			}

			seenLines.add(key);
			return true;
		})
		.join("\n");
};
