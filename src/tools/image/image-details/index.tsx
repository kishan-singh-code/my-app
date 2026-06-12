import { AimOutlined, CopyOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Empty, Row, Space, Statistic, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";
import { getPalette, type Color } from "colorthief";
import { create as createExifParser } from "exif-parser";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { loadImageElement, imageMetadataRows, type IImageMetadata } from "../shared/imageCanvas";
import { ImagePreview } from "../shared/ImagePreview";
import { ImageUploader } from "../shared/ImageUploader";
import { downloadBlob } from "../shared/imageExport";

interface IDetailRow {
	key: string;
	metric: string;
	value: string | number;
}

interface IColorInfo {
	hex: string;
	rgb: string;
	hsl: string;
}

interface IPickedColor extends IColorInfo {
	x: number;
	y: number;
}

const detailColumns: ColumnsType<IDetailRow> = [
	{ title: "Metric", dataIndex: "metric", key: "metric" },
	{ title: "Value", dataIndex: "value", key: "value" },
];

const colorSpaceLabels: Record<number, string> = {
	1: "sRGB",
	65535: "Uncalibrated",
};

const compressionLabels: Record<number, string> = {
	1: "Uncompressed",
	6: "JPEG (old-style)",
};

const exposureModeLabels: Record<number, string> = {
	0: "Auto",
	1: "Manual",
	2: "Auto bracket",
};

const exposureProgramLabels: Record<number, string> = {
	0: "Not Defined",
	1: "Manual",
	2: "Normal program",
	3: "Aperture priority",
	4: "Shutter priority",
	5: "Creative program",
	6: "Action program",
	7: "Portrait mode",
	8: "Landscape mode",
};

const gpsAltitudeRefLabels: Record<number, string> = {
	0: "Above Sea Level",
	1: "Below Sea Level",
};

const lightSourceLabels: Record<number, string> = {
	0: "Unknown",
	1: "Daylight",
	2: "Fluorescent",
	3: "Tungsten (incandescent light)",
	4: "Flash",
	9: "Fine weather",
	10: "Cloudy weather",
	11: "Shade",
	12: "Daylight fluorescent",
	13: "Day white fluorescent",
	14: "Cool white fluorescent",
	15: "White fluorescent",
	17: "Standard light A",
	18: "Standard light B",
	19: "Standard light C",
	20: "D55",
	21: "D65",
	22: "D75",
	23: "D50",
	24: "ISO studio tungsten",
	255: "Other",
};

const meteringModeLabels: Record<number, string> = {
	0: "Unknown",
	1: "Average",
	2: "Center-weighted average",
	3: "Spot",
	4: "Multi-spot",
	5: "Pattern",
	6: "Partial",
	255: "Other",
};

const orientationLabels: Record<number, string> = {
	0: "Unknown (0)",
	1: "Horizontal (normal)",
	2: "Mirror horizontal",
	3: "Rotate 180",
	4: "Mirror vertical",
	5: "Mirror horizontal and rotate 270 CW",
	6: "Rotate 90 CW",
	7: "Mirror horizontal and rotate 90 CW",
	8: "Rotate 270 CW",
};

const resolutionUnitLabels: Record<number, string> = {
	1: "none",
	2: "inches",
	3: "cm",
};

const sceneCaptureTypeLabels: Record<number, string> = {
	0: "Standard",
	1: "Landscape",
	2: "Portrait",
	3: "Night scene",
};

const whiteBalanceLabels: Record<number, string> = {
	0: "Auto",
	1: "Manual",
};

const toHex = (value: number) => value.toString(16).padStart(2, "0");
const rgbToHex = ([red, green, blue]: [number, number, number]) => `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();

const rgbToHsl = ([red, green, blue]: [number, number, number]) => {
	const r = red / 255;
	const g = green / 255;
	const b = blue / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const lightness = (max + min) / 2;
	let hue = 0;
	let saturation = 0;

	if (max !== min) {
		const delta = max - min;
		saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
		hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
		hue /= 6;
	}

	return `hsl(${Math.round(hue * 360)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
};

const getColorInfo = (rgb: [number, number, number]): IColorInfo => ({
	hex: rgbToHex(rgb),
	rgb: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
	hsl: rgbToHsl(rgb),
});

const formatNumber = (value: number, digits = 2) =>
	new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);

const formatExifDate = (value: unknown) => {
	if (typeof value === "number" && Number.isFinite(value)) {
		const date = new Date(value * 1000);
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, "0");
		const day = String(date.getUTCDate()).padStart(2, "0");
		const hours = String(date.getUTCHours()).padStart(2, "0");
		const minutes = String(date.getUTCMinutes()).padStart(2, "0");
		const seconds = String(date.getUTCSeconds()).padStart(2, "0");

		return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
	}

	return formatExifValue(value);
};

const formatExposureTime = (value: unknown) => {
	const seconds = Number(value);

	if (!Number.isFinite(seconds) || seconds <= 0) {
		return "-";
	}

	if (seconds < 1) {
		return `1/${Math.round(1 / seconds)}s`;
	}

	return `${formatNumber(seconds)}s`;
};

const formatFNumber = (value: unknown) => {
	const number = Number(value);

	return Number.isFinite(number) ? `ƒ/${formatNumber(number, 1)}` : "-";
};

const formatFocalLength = (value: unknown) => {
	const number = Number(value);

	return Number.isFinite(number) ? `${formatNumber(number, 1)} mm` : "-";
};

const formatGpsTime = (value: unknown) => {
	if (Array.isArray(value)) {
		const [hours = 0, minutes = 0, seconds = 0] = value.map(Number);

		return `${String(Math.trunc(hours)).padStart(2, "0")}:${String(Math.trunc(minutes)).padStart(2, "0")}:${String(Math.trunc(seconds)).padStart(2, "0")}`;
	}

	if (typeof value === "string") {
		return value || "00:00:00";
	}

	return value === undefined ? "00:00:00" : formatExifValue(value);
};

const formatFlash = (value: unknown) => {
	const flash = Number(value);

	if (!Number.isFinite(flash)) {
		return "-";
	}

	const fired = Boolean(flash & 1);
	const mode = (flash >> 3) & 3;
	const redEye = Boolean(flash & 64);
	const labels = [fired ? "Fired" : "Off, Did not fire"];

	if (mode === 1) labels.push("compulsory flash");
	if (mode === 2) labels.push("compulsory flash suppression");
	if (mode === 3) labels.push("auto mode");
	if (redEye) labels.push("red-eye reduction");

	return labels.join(", ");
};

const formatExifTagValue = (key: string, value: unknown): string | number => {
	if (key === "ColorSpace" && typeof value === "number") return colorSpaceLabels[value] ?? String(value);
	if (key === "Compression" && typeof value === "number") return compressionLabels[value] ?? String(value);
	if (key === "ComponentsConfiguration" && Array.isArray(value)) {
		const componentLabels: Record<number, string> = { 0: "-", 1: "Y", 2: "Cb", 3: "Cr", 4: "R", 5: "G", 6: "B" };
		return value.map((component) => componentLabels[Number(component)] ?? String(component)).join(", ");
	}
	if ((key === "CreateDate" || key === "DateTimeOriginal" || key === "ModifyDate") && typeof value === "number")
		return formatExifDate(value);
	if (key === "ExposureMode" && typeof value === "number") return exposureModeLabels[value] ?? String(value);
	if (key === "ExposureProgram" && typeof value === "number") return exposureProgramLabels[value] ?? String(value);
	if (key === "ExposureTime" && typeof value === "number") return formatExposureTime(value);
	if (key === "FNumber" && typeof value === "number") return formatNumber(value, 1);
	if ((key === "FocalLength" || key === "FocalLengthIn35mmFormat") && typeof value === "number") return `${formatNumber(value, 1)} mm`;
	if (key === "Flash" && typeof value === "number") return formatFlash(value);
	if (key === "GPSAltitude" && typeof value === "number") return `${formatNumber(value)} m`;
	if (key === "GPSAltitudeRef" && typeof value === "number") return gpsAltitudeRefLabels[value] ?? String(value);
	if (key === "GPSTimeStamp") return formatGpsTime(value);
	if (key === "GPSVersionID" && Array.isArray(value)) return value.join(".");
	if (key === "InteropIndex" && value === "R98") return "R98 - DCF basic file (sRGB)";
	if (key === "LightSource" && typeof value === "number") return lightSourceLabels[value] ?? String(value);
	if (key === "MeteringMode" && typeof value === "number") return meteringModeLabels[value] ?? String(value);
	if (key === "Orientation" && typeof value === "number") return orientationLabels[value] ?? String(value);
	if (key === "ResolutionUnit" && typeof value === "number") return resolutionUnitLabels[value] ?? String(value);
	if (key === "SceneCaptureType" && typeof value === "number") return sceneCaptureTypeLabels[value] ?? String(value);
	if (key === "ShutterSpeedValue" && typeof value === "number") return formatExposureTime(1 / 2 ** -value);
	if (key === "WhiteBalance" && typeof value === "number") return whiteBalanceLabels[value] ?? String(value);

	return formatExifValue(value);
};

const formatExifValue = (value: unknown): string | number => {
	if (value === null || value === undefined) {
		return "-";
	}

	if (typeof value === "string" || typeof value === "number") {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(formatExifValue).join(", ");
	}

	if (typeof value === "object") {
		const record = value as Record<string, unknown>;

		if (typeof record.numerator === "number" && typeof record.denominator === "number") {
			return record.denominator ? Number((record.numerator / record.denominator).toFixed(6)) : record.numerator;
		}

		return JSON.stringify(value);
	}

	return String(value);
};

const toExifRows = (tags: Record<string, unknown>) =>
	Object.entries(tags)
		.sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
		.map(([key, value]) => ({ key, metric: key, value: formatExifTagValue(key, value) }));

const getDecimalCoordinate = (coordinate: unknown, reference: unknown) => {
	if (typeof coordinate === "number" && Number.isFinite(coordinate)) {
		return coordinate;
	}

	if (!Array.isArray(coordinate) || coordinate.length < 3) {
		return null;
	}

	const values = coordinate.map((entry) => Number(formatExifValue(entry)));
	const decimal = values[0] + values[1] / 60 + values[2] / 3600;
	const ref = String(reference ?? "").toUpperCase();

	return ref === "S" || ref === "W" ? -decimal : decimal;
};

const getExtraMetadataRows = (metadata: IImageMetadata, exifTags: Record<string, unknown>): IDetailRow[] => {
	const megapixels = (metadata.width * metadata.height) / 1_000_000;
	const latitude = getDecimalCoordinate(exifTags.GPSLatitude, exifTags.GPSLatitudeRef);
	const longitude = getDecimalCoordinate(exifTags.GPSLongitude, exifTags.GPSLongitudeRef);
	const camera = [exifTags.Make, exifTags.Model].filter(Boolean).map(formatExifValue).join(" ");
	const gpsAltitude =
		exifTags.GPSAltitude === undefined
			? "—"
			: `${formatExifTagValue("GPSAltitude", exifTags.GPSAltitude)} ${formatExifTagValue("GPSAltitudeRef", exifTags.GPSAltitudeRef)}`;

	return [
		...imageMetadataRows(metadata),
		{ key: "megapixels", metric: "Megapixels", value: `${megapixels.toFixed(2)} MP` },
		{ key: "camera", metric: "Camera", value: camera || "-" },
		{ key: "focalLength", metric: "Focal length", value: formatFocalLength(exifTags.FocalLength) },
		{ key: "aperture", metric: "Aperture", value: formatFNumber(exifTags.FNumber) },
		{ key: "shutterSpeed", metric: "Shutter speed", value: formatExposureTime(exifTags.ExposureTime) },
		{ key: "iso", metric: "ISO", value: formatExifValue(exifTags.ISO) },
		{ key: "meteringMode", metric: "Metering mode", value: formatExifTagValue("MeteringMode", exifTags.MeteringMode) },
		{ key: "exposureProgram", metric: "Exposure program", value: formatExifTagValue("ExposureProgram", exifTags.ExposureProgram) },
		{ key: "exposureCompensation", metric: "Exposure compensation", value: formatExifValue(exifTags.ExposureCompensation) },
		{ key: "flash", metric: "Flash", value: formatExifTagValue("Flash", exifTags.Flash) },
		{ key: "takenAt", metric: "Taken at", value: formatExifDate(exifTags.DateTimeOriginal ?? exifTags.CreateDate ?? exifTags.ModifyDate) },
		{ key: "software", metric: "Software", value: formatExifValue(exifTags.Software) },
		{
			key: "copyright",
			metric: "Copyright",
			value: exifTags.Copyright ? formatExifValue(exifTags.Copyright) : "no copyright note in EXIF",
		},
		{ key: "gps", metric: "GPS", value: latitude !== null && longitude !== null ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : "-" },
		{ key: "gpsAltitude", metric: "GPS Altitude", value: gpsAltitude },
		{
			key: "gpsDateTime",
			metric: "GPS Date & time",
			value: `${formatExifValue(exifTags.GPSDateStamp)} ${formatExifTagValue("GPSTimeStamp", exifTags.GPSTimeStamp)}`.trim(),
		},
	];
};

const readExifTags = async (file: File) => {
	try {
		const parser = createExifParser(await file.arrayBuffer());
		const result = parser.enablePointers(true).enableBinaryFields(false).enableSimpleValues(true).parse();
		const tags = result.tags ?? {};
		const imageSize = result.getImageSize?.() ?? result.imageSize;

		if (imageSize) {
			tags.ExifImageWidth ??= imageSize.width;
			tags.ExifImageHeight ??= imageSize.height;
		}

		if (result.hasThumbnail?.()) {
			tags.ThumbnailLength ??= result.getThumbnailLength?.() ?? result.thumbnailLength;
			tags.ThumbnailOffset ??= result.getThumbnailOffset?.() ?? result.thumbnailOffset;
			tags.ThumbnailImage ??= `Binary data ${tags.ThumbnailLength ?? ""} bytes`;
		}

		return tags;
	} catch {
		return {};
	}
};

const PaletteSwatches = ({ palette }: { palette: IColorInfo[] }) => {
	const copyToClipboard = useCopyToClipboard();

	if (!palette.length) {
		return <Empty description="Upload an image to extract dominant colors" />;
	}

	return (
		<Row gutter={[12, 12]}>
			{palette.map((color) => (
				<Col xs={24} sm={12} md={8} xl={6} key={color.hex}>
					<Card styles={{ body: { padding: 12 } }}>
						<Space orientation="vertical" size="small" style={{ width: "100%" }}>
							<div style={{ background: color.hex, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 6, height: 64 }} />
							<Typography.Text code>{color.hex}</Typography.Text>
							<Typography.Text type="secondary">{color.rgb}</Typography.Text>
							<Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(color.hex)}>
								Copy HEX
							</Button>
						</Space>
					</Card>
				</Col>
			))}
		</Row>
	);
};

const ImageDetails = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [metadata, setMetadata] = useState<IImageMetadata | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [error, setError] = useState("");
	const [palette, setPalette] = useState<IColorInfo[]>([]);
	const [exifTags, setExifTags] = useState<Record<string, unknown>>({});
	const [pickedColor, setPickedColor] = useState<IPickedColor | null>(null);
	const copyToClipboard = useCopyToClipboard();

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	useEffect(() => {
		if (!previewUrl || !metadata || !canvasRef.current) {
			return;
		}

		let cancelled = false;

		const loadDetails = async () => {
			try {
				const image = await loadImageElement(previewUrl);

				if (cancelled) {
					return;
				}

				const canvas = canvasRef.current;
				const context = canvas?.getContext("2d", { willReadFrequently: true });

				if (!canvas || !context) {
					throw new Error("Canvas is not available in this browser.");
				}

				canvas.width = metadata.width;
				canvas.height = metadata.height;
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(image, 0, 0, canvas.width, canvas.height);

				const nextPalette = await getPalette(image, { colorCount: 8, quality: 10 });
				setPalette(
					(nextPalette ?? []).map((color: Color) => {
						const rgb = color.array();

						return getColorInfo([rgb[0], rgb[1], rgb[2]]);
					}),
				);
			} catch (caughtError) {
				setError(caughtError instanceof Error ? caughtError.message : "Unable to analyze this image.");
			}
		};

		loadDetails();

		return () => {
			cancelled = true;
		};
	}, [metadata, previewUrl]);

	const handleImageSelect = async (nextFile: File) => {
		const objectUrl = URL.createObjectURL(nextFile);

		try {
			const image = await loadImageElement(objectUrl);
			const nextMetadata: IImageMetadata = {
				name: nextFile.name,
				mimeType: nextFile.type || "image/*",
				size: nextFile.size,
				width: image.naturalWidth,
				height: image.naturalHeight,
				aspectRatio: `${image.naturalWidth}:${image.naturalHeight}`,
				lastModified: nextFile.lastModified,
			};

			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}

			setFile(nextFile);
			setMetadata(nextMetadata);
			setPreviewUrl(objectUrl);
			setPickedColor(null);
			setPalette([]);
			setExifTags(await readExifTags(nextFile));
			setError("");
		} catch (caughtError) {
			URL.revokeObjectURL(objectUrl);
			setError(caughtError instanceof Error ? caughtError.message : "Unable to load this image.");
		}
	};

	const handlePickColor = (event: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d", { willReadFrequently: true });

		if (!canvas || !context) {
			return;
		}

		const rect = canvas.getBoundingClientRect();
		const x = Math.min(Math.max(Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width), 0), canvas.width - 1);
		const y = Math.min(Math.max(Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height), 0), canvas.height - 1);
		const [red, green, blue] = Array.from(context.getImageData(x, y, 1, 1).data);

		setPickedColor({ ...getColorInfo([red, green, blue]), x, y });
	};

	const detailRows = metadata ? getExtraMetadataRows(metadata, exifTags) : [];
	const exifRows = toExifRows(exifTags);

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9} xl={8}>
						<Card title="Image Input">
							<ImageUploader onImageSelect={handleImageSelect} error={error} />
						</Card>
					</Col>
					<Col xs={24} lg={15} xl={16}>
						<ImagePreview
							src={previewUrl}
							metadata={metadata}
							extra={
								file ? (
									<Space wrap>
										<Button onClick={() => downloadBlob(file, file.name)}>Download</Button>
										<Button
											onClick={() => {
												if (previewUrl) URL.revokeObjectURL(previewUrl);
												setFile(null);
												setMetadata(null);
												setPreviewUrl("");
												setPalette([]);
												setExifTags({});
												setPickedColor(null);
											}}
										>
											Clear
										</Button>
									</Space>
								) : null
							}
						/>
					</Col>
				</Row>

				{metadata ? (
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} xl={6}>
							<Card>
								<Statistic title="Width" value={`${metadata.width}px`} />
							</Card>
						</Col>
						<Col xs={24} sm={12} xl={6}>
							<Card>
								<Statistic title="Height" value={`${metadata.height}px`} />
							</Card>
						</Col>
						<Col xs={24} sm={12} xl={6}>
							<Card>
								<Statistic title="Aspect Ratio" value={metadata.aspectRatio} />
							</Card>
						</Col>
						<Col xs={24} sm={12} xl={6}>
							<Card>
								<Statistic title="Colors" value={palette.length} />
							</Card>
						</Col>
					</Row>
				) : null}

				{metadata ? (
					<Card title="Image Information">
						<Table columns={detailColumns} dataSource={detailRows} pagination={false} scroll={{ x: true }} />
					</Card>
				) : null}

				<Card title="Color Palette">
					<PaletteSwatches palette={palette} />
				</Card>

				<Card title="Pick Color From Image">
					{previewUrl ? (
						<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
							<canvas
								ref={canvasRef}
								onClick={handlePickColor}
								style={{ borderRadius: 8, cursor: "crosshair", maxHeight: 520, maxWidth: "100%" }}
							/>
							{pickedColor ? (
								<Row gutter={[16, 16]} align="middle">
									<Col>
										<div
											style={{ background: pickedColor.hex, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, height: 72, width: 72 }}
										/>
									</Col>
									<Col flex="auto">
										<Space wrap>
											<Typography.Text code>{pickedColor.hex}</Typography.Text>
											<Typography.Text>{pickedColor.rgb}</Typography.Text>
											<Typography.Text type="secondary">{pickedColor.hsl}</Typography.Text>
											<Typography.Text type="secondary">
												x: {pickedColor.x}, y: {pickedColor.y}
											</Typography.Text>
											<Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(pickedColor.hex)}>
												Copy HEX
											</Button>
										</Space>
									</Col>
								</Row>
							) : (
								<Typography.Text type="secondary">
									<AimOutlined /> Click the image to pick a pixel color.
								</Typography.Text>
							)}
						</Space>
					) : (
						<Empty description="Upload an image to pick colors" />
					)}
				</Card>

				<Card title="EXIF Metadata">
					{exifRows.length ? (
						<Table columns={detailColumns} dataSource={exifRows} pagination={{ pageSize: 10 }} scroll={{ x: true }} />
					) : (
						<Empty description="No EXIF metadata found" />
					)}
				</Card>

				{error ? <Alert type="error" showIcon title={error} /> : null}
			</Space>
		</ToolContainer>
	);
};

export default ImageDetails;
