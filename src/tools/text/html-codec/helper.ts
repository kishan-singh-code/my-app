export type HtmlMode = "encode" | "decode";

const htmlEntities: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export const encodeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => htmlEntities[character]);

export const decodeHtml = (value: string) => {
	const textArea = document.createElement("textarea");
	textArea.innerHTML = value;
	return textArea.value;
};

export const convertHtml = (value: string, mode: HtmlMode) => (mode === "encode" ? encodeHtml(value) : decodeHtml(value));
