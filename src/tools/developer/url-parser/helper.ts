export interface IUrlParseResult {
	ok: boolean;
	output: string;
	error?: string;
}

const appendQueryValue = (params: Record<string, string | string[]>, key: string, value: string) => {
	const existingValue = params[key];

	if (Array.isArray(existingValue)) {
		existingValue.push(value);
	} else if (existingValue !== undefined) {
		params[key] = [existingValue, value];
	} else {
		params[key] = value;
	}
};

export const parseUrl = (value: string): IUrlParseResult => {
	if (!value.trim()) {
		return { ok: true, output: "" };
	}

	try {
		const url = new URL(value);
		const query: Record<string, string | string[]> = {};
		url.searchParams.forEach((paramValue, paramKey) => appendQueryValue(query, paramKey, paramValue));

		return {
			ok: true,
			output: JSON.stringify(
				{
					protocol: url.protocol.replace(":", ""),
					host: url.host,
					hostname: url.hostname,
					port: url.port,
					pathname: url.pathname,
					query,
					hash: url.hash.replace("#", ""),
				},
				null,
				2,
			),
		};
	} catch (error) {
		return { ok: false, output: "", error: error instanceof Error ? error.message : "Invalid URL" };
	}
};
