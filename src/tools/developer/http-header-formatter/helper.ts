export interface IHeaderFormatResult {
	ok: boolean;
	output: string;
	error?: string;
}

export const formatHeaders = (value: string): IHeaderFormatResult => {
	if (!value.trim()) {
		return { ok: true, output: "" };
	}

	const headers: Record<string, string> = {};
	const invalidLines: string[] = [];

	value.split(/\r?\n/).forEach((line) => {
		const trimmedLine = line.trim();

		if (!trimmedLine) {
			return;
		}

		const separatorIndex = trimmedLine.indexOf(":");

		if (separatorIndex === -1) {
			invalidLines.push(trimmedLine);
			return;
		}

		const name = trimmedLine.slice(0, separatorIndex).trim();
		const headerValue = trimmedLine.slice(separatorIndex + 1).trim();

		if (!name) {
			invalidLines.push(trimmedLine);
			return;
		}

		headers[name] = headerValue;
	});

	if (invalidLines.length) {
		return { ok: false, output: "", error: `Invalid header line: ${invalidLines[0]}` };
	}

	return { ok: true, output: JSON.stringify(headers, null, 2) };
};
