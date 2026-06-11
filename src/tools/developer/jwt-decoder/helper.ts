export interface IJwtDecodeResult {
	ok: boolean;
	output: string;
	error?: string;
}

const decodeBase64Url = (value: string) => {
	const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
	const paddedValue = normalizedValue.padEnd(normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4), "=");
	const binaryValue = atob(paddedValue);
	const bytes = Uint8Array.from(binaryValue, (character) => character.charCodeAt(0));
	return new TextDecoder().decode(bytes);
};

export const decodeJwt = (token: string): IJwtDecodeResult => {
	const tokenParts = token.trim().split(".");

	if (tokenParts.length !== 3) {
		return { ok: false, output: "", error: "JWT must contain header, payload, and signature parts" };
	}

	try {
		const [headerPart, payloadPart, signature] = tokenParts;
		const header = JSON.parse(decodeBase64Url(headerPart)) as unknown;
		const payload = JSON.parse(decodeBase64Url(payloadPart)) as unknown;

		return {
			ok: true,
			output: JSON.stringify({ header, payload, signature }, null, 2),
		};
	} catch (error) {
		return { ok: false, output: "", error: error instanceof Error ? error.message : "Unable to decode JWT" };
	}
};
