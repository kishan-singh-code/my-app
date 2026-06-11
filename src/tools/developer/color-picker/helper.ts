export interface IColorValues {
	hex: string;
	rgb: string;
	hsl: string;
	cssVariable: string;
}

const clampColor = (value: number) => Math.min(255, Math.max(0, value));

const normalizeHex = (value: string) => {
	const sanitizedValue = value.replace(/[^0-9a-f]/gi, "").slice(0, 6);
	const paddedValue = sanitizedValue.padEnd(6, "0");
	return `#${paddedValue.toLowerCase()}`;
};

const hexToRgb = (hex: string) => {
	const normalizedHex = normalizeHex(hex);
	return {
		red: clampColor(Number.parseInt(normalizedHex.slice(1, 3), 16)),
		green: clampColor(Number.parseInt(normalizedHex.slice(3, 5), 16)),
		blue: clampColor(Number.parseInt(normalizedHex.slice(5, 7), 16)),
	};
};

const rgbToHsl = (red: number, green: number, blue: number) => {
	const normalizedRed = red / 255;
	const normalizedGreen = green / 255;
	const normalizedBlue = blue / 255;
	const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
	const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
	const lightness = (max + min) / 2;

	if (max === min) {
		return { hue: 0, saturation: 0, lightness: Math.round(lightness * 100) };
	}

	const delta = max - min;
	const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
	const hueValue =
		max === normalizedRed
			? (normalizedGreen - normalizedBlue) / delta + (normalizedGreen < normalizedBlue ? 6 : 0)
			: max === normalizedGreen
				? (normalizedBlue - normalizedRed) / delta + 2
				: (normalizedRed - normalizedGreen) / delta + 4;

	return {
		hue: Math.round(hueValue * 60),
		saturation: Math.round(saturation * 100),
		lightness: Math.round(lightness * 100),
	};
};

export const getColorValues = (value: string): IColorValues => {
	const hex = normalizeHex(value);
	const { red, green, blue } = hexToRgb(hex);
	const { hue, saturation, lightness } = rgbToHsl(red, green, blue);

	return {
		hex,
		rgb: `rgb(${red}, ${green}, ${blue})`,
		hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
		cssVariable: `--color: ${hex};`,
	};
};
