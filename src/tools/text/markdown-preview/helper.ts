const escapeHtml = (value: string) =>
	value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};

		return entities[character];
	});

const renderInlineMarkdown = (value: string) =>
	escapeHtml(value)
		.replace(/`([^`]+)`/g, "<code>$1</code>")
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/\*([^*]+)\*/g, "<em>$1</em>")
		.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

export const renderMarkdown = (markdown: string) => {
	const lines = markdown.split(/\r?\n/);
	let inList = false;
	const htmlLines: string[] = [];

	const closeList = () => {
		if (inList) {
			htmlLines.push("</ul>");
			inList = false;
		}
	};

	for (const line of lines) {
		if (!line.trim()) {
			closeList();
			continue;
		}

		const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
		const listMatch = line.match(/^[-*]\s+(.*)$/);

		if (headingMatch) {
			closeList();
			const level = headingMatch[1].length;
			htmlLines.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
		} else if (listMatch) {
			if (!inList) {
				htmlLines.push("<ul>");
				inList = true;
			}

			htmlLines.push(`<li>${renderInlineMarkdown(listMatch[1])}</li>`);
		} else {
			closeList();
			htmlLines.push(`<p>${renderInlineMarkdown(line)}</p>`);
		}
	}

	closeList();
	return htmlLines.join("\n");
};
