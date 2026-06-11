export interface IRegexMatchResult {
	index: number;
	value: string;
	groups: string[];
}

export interface IRegexTestResult {
	ok: boolean;
	matches: IRegexMatchResult[];
	error?: string;
}

const normalizeFlags = (flags: string) => Array.from(new Set(flags.replace(/[^dgimsuvy]/g, "").split(""))).join("");

export const testRegex = (pattern: string, flags: string, text: string): IRegexTestResult => {
	if (!pattern) {
		return { ok: true, matches: [] };
	}

	try {
		const normalizedFlags = normalizeFlags(flags);
		const searchFlags = normalizedFlags.includes("g") ? normalizedFlags : `${normalizedFlags}g`;
		const regex = new RegExp(pattern, searchFlags);
		const matches: IRegexMatchResult[] = [];
		let match = regex.exec(text);

		while (match) {
			matches.push({ index: match.index, value: match[0], groups: match.slice(1) });

			if (match[0] === "") {
				regex.lastIndex += 1;
			}

			match = regex.exec(text);
		}

		return { ok: true, matches };
	} catch (error) {
		return { ok: false, matches: [], error: error instanceof Error ? error.message : "Invalid regular expression" };
	}
};
