export interface IImageMetadata {
	name: string;
	mimeType: string;
	size: number;
	width: number;
	height: number;
	aspectRatio: string;
	lastModified?: number;
}

export type IImageMimeType = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

const getAspectRatio = (width: number, height: number) => {
	const divisor = gcd(width, height);

	return divisor ? `${width / divisor}:${height / divisor}` : "0:0";
};

const gcd = (firstNumber: number, secondNumber: number): number => {
	let first = Math.abs(Math.trunc(firstNumber));
	let second = Math.abs(Math.trunc(secondNumber));

	while (second !== 0) {
		const next = first % second;
		first = second;
		second = next;
	}

	return first;
};

export const formatBytes = (bytes: number) => {
	if (!Number.isFinite(bytes) || bytes <= 0) {
		return "0 B";
	}

	const units = ["B", "KB", "MB", "GB"];
	const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	const value = bytes / 1024 ** unitIndex;

	return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: unitIndex ? 2 : 0 }).format(value)} ${units[unitIndex]}`;
};

export const loadImageElement = (source: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("Unable to load this image."));
		image.src = source;
	});

export const fileToDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error("Unable to read this image file."));
		reader.readAsDataURL(file);
	});

export const getImageMetadata = async (file: File): Promise<IImageMetadata> => {
	const objectUrl = URL.createObjectURL(file);

	try {
		const image = await loadImageElement(objectUrl);

		return {
			name: file.name,
			mimeType: file.type || "image/*",
			size: file.size,
			width: image.naturalWidth,
			height: image.naturalHeight,
			aspectRatio: getAspectRatio(image.naturalWidth, image.naturalHeight),
			lastModified: file.lastModified,
		};
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
};

export const normalizeImageDataUrl = (value: string, fallbackMimeType = "image/png") => {
	const trimmedValue = value.trim();

	if (trimmedValue.startsWith("data:image/")) {
		return trimmedValue;
	}

	const compactBase64 = trimmedValue.replace(/\s/g, "");

	return `data:${fallbackMimeType};base64,${compactBase64}`;
};

export const dataUrlToBlob = (dataUrl: string) => {
	const [header, base64Value] = dataUrl.split(",");
	const mimeType = /data:(.*?);base64/.exec(header)?.[1] ?? "application/octet-stream";
	const binary = atob(base64Value ?? "");
	const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

	return new Blob([bytes], { type: mimeType });
};

export const getImageMetadataFromDataUrl = async (dataUrl: string, name = "decoded-image"): Promise<IImageMetadata> => {
	const blob = dataUrlToBlob(dataUrl);
	const image = await loadImageElement(dataUrl);

	return {
		name,
		mimeType: blob.type || "image/*",
		size: blob.size,
		width: image.naturalWidth,
		height: image.naturalHeight,
		aspectRatio: getAspectRatio(image.naturalWidth, image.naturalHeight),
	};
};

export const getImageMetadataFromBlob = async (
	blob: Blob,
	name = "processed-image",
	mimeType = blob.type || "image/*",
): Promise<IImageMetadata> => {
	const objectUrl = URL.createObjectURL(blob);

	try {
		const image = await loadImageElement(objectUrl);

		return {
			name,
			mimeType,
			size: blob.size,
			width: image.naturalWidth,
			height: image.naturalHeight,
			aspectRatio: getAspectRatio(image.naturalWidth, image.naturalHeight),
		};
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
};

export const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number) =>
	new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
					return;
				}

				reject(new Error("Unable to export this image."));
			},
			mimeType,
			quality,
		);
	});

export const drawImageToCanvas = (image: CanvasImageSource, width: number, height: number) => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	if (!context) {
		throw new Error("Canvas is not available in this browser.");
	}

	canvas.width = width;
	canvas.height = height;
	context.drawImage(image, 0, 0, width, height);

	return canvas;
};

export const imageMetadataRows = (metadata: IImageMetadata) => [
	{ key: "name", metric: "File Name", value: metadata.name },
	{ key: "type", metric: "Type", value: metadata.mimeType },
	{ key: "size", metric: "File Size", value: formatBytes(metadata.size) },
	{ key: "dimensions", metric: "Dimensions", value: `${metadata.width} x ${metadata.height}px` },
	{ key: "ratio", metric: "Aspect Ratio", value: metadata.aspectRatio },
	{
		key: "lastModified",
		metric: "Last Modified",
		value: metadata.lastModified
			? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(metadata.lastModified)
			: "-",
	},
];
