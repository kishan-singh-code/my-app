export type UrlMode = "encode" | "decode";

export interface UrlResult {
	ok: boolean;
	output: string;
	error?: string;
}

export const convertUrl = (value: string, mode: UrlMode): UrlResult => {
	try {
		return { ok: true, output: mode === "encode" ? encodeURIComponent(value) : decodeURIComponent(value) };
	} catch {
		return { ok: false, output: "", error: "Invalid URL encoded input" };
	}
};
