import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";

export type IAesMode = "encrypt" | "decrypt";

export interface IAesResult {
	ok: boolean;
	output: string;
	error?: string;
}

export const convertAes = (value: string, secret: string, mode: IAesMode): IAesResult => {
	if (!secret) {
		return { ok: false, output: "", error: "Secret key is required" };
	}

	try {
		if (mode === "encrypt") {
			return { ok: true, output: AES.encrypt(value, secret).toString() };
		}

		const decryptedValue = AES.decrypt(value, secret).toString(Utf8);

		if (!decryptedValue) {
			return { ok: false, output: "", error: "Unable to decrypt with this secret key" };
		}

		return { ok: true, output: decryptedValue };
	} catch {
		return { ok: false, output: "", error: mode === "encrypt" ? "Unable to encrypt text" : "Unable to decrypt text" };
	}
};
