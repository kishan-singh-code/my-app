export const generateUuid = () => {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}

	const bytes = new Uint8Array(16);
	globalThis.crypto.getRandomValues(bytes);
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	const hexValues = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
	return `${hexValues.slice(0, 4).join("")}-${hexValues.slice(4, 6).join("")}-${hexValues.slice(6, 8).join("")}-${hexValues.slice(8, 10).join("")}-${hexValues.slice(10).join("")}`;
};

export const generateUuids = (count: number) => Array.from({ length: count }, generateUuid).join("\n");
