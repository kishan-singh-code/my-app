import { dataUrlToBlob } from "./imageCanvas";

export const getExtensionFromMimeType = (mimeType: string) => {
	if (mimeType.includes("jpeg")) {
		return "jpg";
	}

	return mimeType.split("/")[1]?.replace("svg+xml", "svg") || "png";
};

export const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const downloadDataUrl = (dataUrl: string, fileName: string) => {
	downloadBlob(dataUrlToBlob(dataUrl), fileName);
};
