export type IUrlMode = "encode" | "decode";

export interface IUrlResult {
	ok: boolean;
	output: string;
	error?: string;
}

export const convertUrl = (value: string, mode: IUrlMode): IUrlResult => {
	try {
		return { ok: true, output: mode === "encode" ? encodeURIComponent(value) : decodeURIComponent(value) };
	} catch {
		return { ok: false, output: "", error: "Invalid URL encoded input" };
	}
};
