export type ICodecMode = "encode" | "decode";

export interface ICodecResult {
	ok: boolean;
	output: string;
	error?: string;
}

const encodeBase64 = (value: string) => {
	const bytes = new TextEncoder().encode(value);
	const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
	return btoa(binary);
};

const decodeBase64 = (value: string) => {
	const binary = atob(value);
	const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
	return new TextDecoder().decode(bytes);
};

export const convertBase64 = (value: string, mode: ICodecMode): ICodecResult => {
	try {
		return { ok: true, output: mode === "encode" ? encodeBase64(value) : decodeBase64(value.trim()) };
	} catch {
		return { ok: false, output: "", error: "Invalid Base64 input" };
	}
};
