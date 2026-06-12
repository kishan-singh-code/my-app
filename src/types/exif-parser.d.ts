declare module "exif-parser" {
	export interface IExifParserResult {
		app1Offset?: number;
		getImageSize?: () => { width: number; height: number } | undefined;
		getThumbnailLength?: () => number;
		getThumbnailOffset?: () => number;
		getThumbnailSize?: () => { width: number; height: number } | undefined;
		hasThumbnail?: (mimeType?: string) => boolean;
		imageSize?: { width: number; height: number };
		startMarker?: unknown;
		tags?: Record<string, unknown>;
		thumbnailLength?: number;
		thumbnailOffset?: number;
		thumbnailType?: number;
	}

	export interface IExifParser {
		enableBinaryFields: (enable: boolean) => IExifParser;
		enableImageSize: (enable: boolean) => IExifParser;
		enablePointers: (enable: boolean) => IExifParser;
		enableReturnTags: (enable: boolean) => IExifParser;
		enableSimpleValues: (enable: boolean) => IExifParser;
		enableTagNames: (enable: boolean) => IExifParser;
		parse: () => IExifParserResult;
	}

	export const create: (buffer: ArrayBuffer | Uint8Array) => IExifParser;
}
