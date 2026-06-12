import { expose } from "comlink";
import type { IImageMimeType } from "../imageCanvas";

type IWorkerOperation = "resize" | "rotate-flip" | "convert" | "filters" | "watermark" | "crop" | "compress-target";

type IWorkerOptions = Record<string, number | string | boolean>;

const getCanvasContext = (canvas: OffscreenCanvas) => {
	const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D | null;

	if (!context) {
		throw new Error("Canvas processing is not available in this browser.");
	}

	return context;
};

const createCanvas = (width: number, height: number, mimeType: string) => {
	const canvas = new OffscreenCanvas(Math.max(Math.round(width), 1), Math.max(Math.round(height), 1));
	const context = getCanvasContext(canvas);

	if (mimeType === "image/jpeg") {
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	return { canvas, context };
};

const hexToRgb = (color: string) => {
	const hex = color.replace("#", "");
	const normalizedHex =
		hex.length === 3
			? hex
					.split("")
					.map((character) => `${character}${character}`)
					.join("")
			: hex;
	const value = Number.parseInt(normalizedHex, 16);

	return {
		r: (value >> 16) & 255,
		g: (value >> 8) & 255,
		b: value & 255,
	};
};

const getQuality = (options: IWorkerOptions) => Math.min(Math.max(Number(options.quality ?? 0.92), 0.05), 1);
const getMimeType = (options: IWorkerOptions) => String(options.mimeType ?? "image/png") as IImageMimeType;

const exportCanvas = async (canvas: OffscreenCanvas, options: IWorkerOptions) => {
	const mimeType = getMimeType(options);
	return canvas.convertToBlob({ type: mimeType, quality: getQuality(options) });
};

const createSourceCanvas = (bitmap: ImageBitmap) => {
	const { canvas, context } = createCanvas(bitmap.width, bitmap.height, "image/png");

	context.drawImage(bitmap, 0, 0);

	return canvas;
};

const drawSourceToBlob = (source: OffscreenCanvas, width: number, height: number, mimeType: string, quality: number) => {
	const { canvas, context } = createCanvas(width, height, mimeType);

	context.drawImage(source, 0, 0, source.width, source.height, 0, 0, canvas.width, canvas.height);

	return canvas.convertToBlob({ type: mimeType, quality });
};

const getTargetCompressedBlob = async (bitmap: ImageBitmap, options: IWorkerOptions) => {
	const mimeType = getMimeType(options);
	const targetBytes = Math.max(Number(options.targetBytes) || 1, 1);
	const maxQuality = Math.min(Math.max(Number(options.quality) || 0.82, 0.05), 0.95);
	const minQuality = 0.05;
	const dimensionFloor = 32;
	const source = createSourceCanvas(bitmap);
	let scale = 1;
	let bestBlob: Blob | null = null;

	for (let scaleAttempt = 0; scaleAttempt < 16; scaleAttempt += 1) {
		const width = Math.max(Math.round(source.width * scale), 1);
		const height = Math.max(Math.round(source.height * scale), 1);

		if (mimeType === "image/png") {
			const blob = await drawSourceToBlob(source, width, height, mimeType, maxQuality);

			if (!bestBlob || blob.size < bestBlob.size) {
				bestBlob = blob;
			}

			if (blob.size <= targetBytes) {
				return blob;
			}
		} else {
			let low = minQuality;
			let high = maxQuality;
			let bestUnderTarget: Blob | null = null;

			for (let qualityAttempt = 0; qualityAttempt < 9; qualityAttempt += 1) {
				const quality = (low + high) / 2;
				const blob = await drawSourceToBlob(source, width, height, mimeType, quality);

				if (!bestBlob || Math.abs(blob.size - targetBytes) < Math.abs(bestBlob.size - targetBytes)) {
					bestBlob = blob;
				}

				if (blob.size <= targetBytes) {
					bestUnderTarget = blob;
					low = quality;
				} else {
					high = quality;
				}
			}

			if (bestUnderTarget) {
				return bestUnderTarget;
			}
		}

		if (width <= dimensionFloor || height <= dimensionFloor) {
			break;
		}

		const reductionRatio = bestBlob ? Math.sqrt(targetBytes / Math.max(bestBlob.size, 1)) * 0.92 : 0.82;
		scale *= Math.min(Math.max(reductionRatio, 0.45), 0.86);
	}

	if (!bestBlob) {
		throw new Error("Unable to compress this image.");
	}

	return bestBlob;
};

const processImage = async (file: Blob, operation: IWorkerOperation, options: IWorkerOptions) => {
	const bitmap = await createImageBitmap(file);
	const mimeType = getMimeType(options);

	try {
		if (operation === "compress-target") {
			return getTargetCompressedBlob(bitmap, options);
		}

		if (operation === "resize") {
			const width = Number(options.width) || bitmap.width;
			const height = Number(options.height) || bitmap.height;
			const { canvas, context } = createCanvas(width, height, mimeType);

			context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
			return exportCanvas(canvas, options);
		}

		if (operation === "rotate-flip") {
			const rotation = Number(options.rotation) || 0;
			const normalizedRotation = ((rotation % 360) + 360) % 360;
			const swapsDimensions = normalizedRotation === 90 || normalizedRotation === 270;
			const width = swapsDimensions ? bitmap.height : bitmap.width;
			const height = swapsDimensions ? bitmap.width : bitmap.height;
			const { canvas, context } = createCanvas(width, height, mimeType);

			context.translate(canvas.width / 2, canvas.height / 2);
			context.rotate((normalizedRotation * Math.PI) / 180);
			context.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
			context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

			return exportCanvas(canvas, options);
		}

		if (operation === "crop") {
			const x = Number(options.x) || 0;
			const y = Number(options.y) || 0;
			const width = Number(options.width) || bitmap.width;
			const height = Number(options.height) || bitmap.height;
			const { canvas, context } = createCanvas(width, height, mimeType);

			context.drawImage(bitmap, x, y, width, height, 0, 0, canvas.width, canvas.height);
			return exportCanvas(canvas, options);
		}

		if (operation === "filters") {
			const { canvas, context } = createCanvas(bitmap.width, bitmap.height, mimeType);
			context.filter = [
				`brightness(${Number(options.brightness) || 100}%)`,
				`contrast(${Number(options.contrast) || 100}%)`,
				`saturate(${Number(options.saturation) || 100}%)`,
				`blur(${Number(options.blur) || 0}px)`,
				`grayscale(${Number(options.grayscale) || 0}%)`,
				`sepia(${Number(options.sepia) || 0}%)`,
			].join(" ");

			context.drawImage(bitmap, 0, 0);
			context.filter = "none";

			return exportCanvas(canvas, options);
		}

		if (operation === "watermark") {
			const { canvas, context } = createCanvas(bitmap.width, bitmap.height, mimeType);
			const text = String(options.text || "Watermark");
			const fontSize = Math.max(Number(options.fontSize) || 48, 8);
			const padding = Math.max(Number(options.padding) || 32, 0);
			const opacity = Math.min(Math.max(Number(options.opacity) || 0.45, 0), 1);
			const color = hexToRgb(String(options.color || "#ffffff"));
			const position = String(options.position || "bottom-right");

			context.drawImage(bitmap, 0, 0);
			context.font = `700 ${fontSize}px sans-serif`;
			context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
			context.textBaseline = "top";
			const textWidth = context.measureText(text).width;
			const textHeight = fontSize * 1.2;
			const x = position.endsWith("right")
				? canvas.width - textWidth - padding
				: position.endsWith("center")
					? (canvas.width - textWidth) / 2
					: padding;
			const y = position.startsWith("bottom")
				? canvas.height - textHeight - padding
				: position.startsWith("center")
					? (canvas.height - textHeight) / 2
					: padding;

			context.fillText(text, x, y);

			return exportCanvas(canvas, options);
		}

		const { canvas, context } = createCanvas(bitmap.width, bitmap.height, mimeType);
		context.drawImage(bitmap, 0, 0);

		return exportCanvas(canvas, options);
	} finally {
		bitmap.close();
	}
};

export type IImageProcessingWorkerApi = {
	processImage: typeof processImage;
};

expose({ processImage });
