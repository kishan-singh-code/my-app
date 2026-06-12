import { wrap, type Remote } from "comlink";
import {
	canvasToBlob,
	drawImageToCanvas,
	getImageMetadataFromBlob,
	loadImageElement,
	type IImageMetadata,
	type IImageMimeType,
} from "./imageCanvas";

export type IImageWorkerOperation = "resize" | "rotate-flip" | "convert" | "filters" | "watermark" | "crop" | "compress-target";

export interface IProcessedImageResult {
	blob: Blob;
	metadata: IImageMetadata;
	fileName: string;
}

interface IImageProcessingWorkerApi {
	processImage: (file: Blob, operation: IImageWorkerOperation, options: Record<string, number | string | boolean>) => Promise<Blob>;
}

const getBaseName = (fileName: string) => fileName.replace(/\.[^.]+$/, "") || "image";

export const imageFormatOptions: Array<{ label: string; value: IImageMimeType }> = [
	{ label: "PNG", value: "image/png" },
	{ label: "JPEG", value: "image/jpeg" },
	{ label: "WEBP", value: "image/webp" },
	{ label: "AVIF", value: "image/avif" },
];

export const getExtensionFromMimeType = (mimeType: string) => {
	if (mimeType.includes("jpeg")) {
		return "jpg";
	}

	return mimeType.split("/")[1]?.replace("svg+xml", "svg") || "png";
};

export const buildProcessedFileName = (sourceName: string, suffix: string, mimeType: string) =>
	`${getBaseName(sourceName)}-${suffix}.${getExtensionFromMimeType(mimeType)}`;

export const createProcessedResult = async (
	blob: Blob,
	fileName: string,
	mimeType = blob.type || "image/*",
): Promise<IProcessedImageResult> => ({
	blob,
	metadata: await getImageMetadataFromBlob(blob, fileName, mimeType),
	fileName,
});

export const processImageInWorker = (file: File, operation: IImageWorkerOperation, options: Record<string, number | string | boolean>) =>
	new Promise<Blob>((resolve, reject) => {
		const worker = new Worker(new URL("./workers/imageProcessing.worker.ts", import.meta.url), { type: "module" });
		const api = wrap<IImageProcessingWorkerApi>(worker) as Remote<IImageProcessingWorkerApi>;

		api
			.processImage(file, operation, options)
			.then(resolve)
			.catch((caughtError: unknown) => reject(caughtError instanceof Error ? caughtError : new Error("Unable to process this image.")))
			.finally(() => worker.terminate());
	});

export const resizeImageWithPica = async (file: File, width: number, height: number, mimeType: IImageMimeType, quality: number) => {
	const [{ default: createPica }, objectUrl] = await Promise.all([import("pica"), Promise.resolve(URL.createObjectURL(file))]);

	try {
		const image = await loadImageElement(objectUrl);
		const sourceCanvas = drawImageToCanvas(image, image.naturalWidth, image.naturalHeight);
		const targetCanvas = document.createElement("canvas");

		targetCanvas.width = Math.max(Math.round(width), 1);
		targetCanvas.height = Math.max(Math.round(height), 1);

		await createPica().resize(sourceCanvas, targetCanvas);

		return canvasToBlob(targetCanvas, mimeType, quality);
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
};

export const compressImage = async (file: File, maxSizeMb: number, quality: number, mimeType: IImageMimeType) => {
	const targetBytes = Math.max(Math.round(maxSizeMb * 1024 * 1024), 1);

	return processImageInWorker(file, "compress-target", { mimeType, quality, targetBytes });
};
