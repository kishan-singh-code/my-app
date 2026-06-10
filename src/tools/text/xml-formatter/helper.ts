export interface XmlFormatResult {
	ok: boolean;
	output: string;
	error?: string;
}

const prettifyXml = (xml: string) => {
	let depth = 0;
	return xml
		.replace(/>\s*</g, ">\n<")
		.split("\n")
		.map((line) => {
			const trimmedLine = line.trim();
			const isClosingTag = /^<\//.test(trimmedLine);
			const isOpeningTag = /^<[^!?/][^>]*[^/]?>$/.test(trimmedLine);

			if (isClosingTag) {
				depth = Math.max(depth - 1, 0);
			}

			const formattedLine = `${"  ".repeat(depth)}${trimmedLine}`;

			if (isOpeningTag) {
				depth += 1;
			}

			return formattedLine;
		})
		.join("\n");
};

export const formatXml = (value: string): XmlFormatResult => {
	if (!value.trim()) {
		return { ok: true, output: "" };
	}

	const parser = new DOMParser();
	const documentResult = parser.parseFromString(value, "application/xml");
	const parserError = documentResult.querySelector("parsererror");

	if (parserError) {
		return { ok: false, output: "", error: parserError.textContent?.trim() || "Invalid XML" };
	}

	return { ok: true, output: prettifyXml(new XMLSerializer().serializeToString(documentResult)) };
};
