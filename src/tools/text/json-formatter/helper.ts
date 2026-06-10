export interface JsonFormatResult {
	ok: boolean;
	output: string;
	error?: string;
}

const parseJson = (value: string) => JSON.parse(value) as unknown;

export const formatJson = (value: string, spaces: number): JsonFormatResult => {
	if (!value.trim()) {
		return { ok: true, output: "" };
	}

	try {
		return { ok: true, output: JSON.stringify(parseJson(value), null, spaces) };
	} catch (error) {
		return { ok: false, output: "", error: error instanceof Error ? error.message : "Invalid JSON" };
	}
};

export const minifyJson = (value: string): JsonFormatResult => {
	if (!value.trim()) {
		return { ok: true, output: "" };
	}

	try {
		return { ok: true, output: JSON.stringify(parseJson(value)) };
	} catch (error) {
		return { ok: false, output: "", error: error instanceof Error ? error.message : "Invalid JSON" };
	}
};
