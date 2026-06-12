import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Checkbox, Col, Input, InputNumber, Row, Segmented, Select, Slider, Space, Typography } from "antd";
import { useEffect, useState, type CSSProperties } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { downloadBlob } from "./imageExport";
import { formatBytes, type IImageMetadata, type IImageMimeType } from "./imageCanvas";
import { ImagePreview } from "./ImagePreview";
import { ImageToolShell } from "./ImageToolShell";
import {
	buildProcessedFileName,
	compressImage,
	createProcessedResult,
	imageFormatOptions,
	processImageInWorker,
	resizeImageWithPica,
	type IProcessedImageResult,
} from "./imageProcessing";

export type IImageEditorToolId =
	| "resize-image"
	| "rotate-flip-image"
	| "convert-image"
	| "compress-image"
	| "crop-image"
	| "image-filters"
	| "watermark-image";

interface IImageEditorState {
	file: File | null;
	metadata: IImageMetadata | null;
	previewUrl: string;
}

interface IImageEditorControlsProps extends IImageEditorState {
	onPreviewStyleChange: (style?: CSSProperties) => void;
	onProcess: (processor: (file: File, metadata: IImageMetadata) => Promise<IProcessedImageResult>) => void;
	processing: boolean;
}

const qualityStep = 0.01;

const ImageFormatSelect = ({ value, onChange }: { value: IImageMimeType; onChange: (value: IImageMimeType) => void }) => {
	return <Select value={value} options={imageFormatOptions} onChange={onChange} style={{ width: "100%" }} />;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<Space orientation="vertical" size={4} style={{ width: "100%" }}>
		<Typography.Text strong>{label}</Typography.Text>
		{children}
	</Space>
);

const QualityField = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
	<Field label="Quality">
		<Row gutter={[12, 0]} align="middle">
			<Col flex="auto">
				<Slider min={0.1} max={1} step={qualityStep} value={value} onChange={onChange} />
			</Col>
			<Col>
				<InputNumber min={0.1} max={1} step={qualityStep} value={value} onChange={(nextValue) => onChange(Number(nextValue) || 0.92)} />
			</Col>
		</Row>
	</Field>
);

const ProcessButton = ({
	disabled,
	loading,
	onClick,
	label = "Process Image",
}: {
	disabled: boolean;
	loading: boolean;
	onClick: () => void;
	label?: string;
}) => (
	<Button type="primary" loading={loading} disabled={disabled} onClick={onClick}>
		{label}
	</Button>
);

const ResizeControls = ({ file, metadata, onPreviewStyleChange, onProcess, processing }: IImageEditorControlsProps) => {
	const [width, setWidth] = useState(1200);
	const [height, setHeight] = useState(800);
	const [keepRatio, setKeepRatio] = useState(true);
	const [format, setFormat] = useState<IImageMimeType>("image/webp");
	const [quality, setQuality] = useState(0.92);

	useEffect(() => {
		if (!metadata) {
			return;
		}

		setWidth(metadata.width);
		setHeight(metadata.height);
	}, [metadata]);

	useEffect(() => {
		if (!metadata) {
			onPreviewStyleChange(undefined);
			return;
		}

		const previewScale = Math.min(1, 620 / Math.max(width, 1), 420 / Math.max(height, 1));

		onPreviewStyleChange({
			height: Math.max(Math.round(height * previewScale), 1),
			maxWidth: "100%",
			objectFit: "fill",
			width: Math.max(Math.round(width * previewScale), 1),
		});

		return () => onPreviewStyleChange(undefined);
	}, [height, metadata, onPreviewStyleChange, width]);

	const updateWidth = (nextWidth: number) => {
		setWidth(nextWidth);

		if (metadata && keepRatio) {
			setHeight(Math.max(Math.round(nextWidth / (metadata.width / metadata.height)), 1));
		}
	};

	const updateHeight = (nextHeight: number) => {
		setHeight(nextHeight);

		if (metadata && keepRatio) {
			setWidth(Math.max(Math.round(nextHeight * (metadata.width / metadata.height)), 1));
		}
	};

	return (
		<Card title="Resize Settings">
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={12}>
						<Field label="Width">
							<InputNumber
								value={width}
								min={1}
								addonAfter="px"
								onChange={(value) => updateWidth(Number(value) || 1)}
								style={{ width: "100%" }}
							/>
						</Field>
					</Col>
					<Col xs={24} md={12}>
						<Field label="Height">
							<InputNumber
								value={height}
								min={1}
								addonAfter="px"
								onChange={(value) => updateHeight(Number(value) || 1)}
								style={{ width: "100%" }}
							/>
						</Field>
					</Col>
				</Row>
				<Checkbox checked={keepRatio} onChange={(event) => setKeepRatio(event.target.checked)}>
					Keep aspect ratio
				</Checkbox>
				<Field label="Output Format">
					<ImageFormatSelect value={format} onChange={setFormat} />
				</Field>
				<QualityField value={quality} onChange={setQuality} />
				<ProcessButton
					disabled={!file || !metadata}
					loading={processing}
					label="Resize Image"
					onClick={() =>
						onProcess(async (sourceFile) => {
							const blob = await resizeImageWithPica(sourceFile, width, height, format, quality);
							return createProcessedResult(blob, buildProcessedFileName(sourceFile.name, "resized", format), format);
						})
					}
				/>
			</Space>
		</Card>
	);
};

const RotateFlipControls = ({ file, metadata, onPreviewStyleChange, onProcess, processing }: IImageEditorControlsProps) => {
	const [rotation, setRotation] = useState(90);
	const [flipHorizontal, setFlipHorizontal] = useState(false);
	const [flipVertical, setFlipVertical] = useState(false);
	const [format, setFormat] = useState<IImageMimeType>("image/png");
	const [quality, setQuality] = useState(0.92);

	useEffect(() => {
		if (!metadata) {
			onPreviewStyleChange(undefined);
			return;
		}

		onPreviewStyleChange({
			transform: `rotate(${rotation}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`,
			transition: "transform 0.2s ease",
		});

		return () => onPreviewStyleChange(undefined);
	}, [flipHorizontal, flipVertical, metadata, onPreviewStyleChange, rotation]);

	return (
		<Card title="Rotate / Flip Settings">
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<Field label="Rotation">
					<Select
						value={rotation}
						onChange={setRotation}
						options={[
							{ label: "0 deg", value: 0 },
							{ label: "90 deg", value: 90 },
							{ label: "180 deg", value: 180 },
							{ label: "270 deg", value: 270 },
						]}
					/>
				</Field>
				<Space wrap>
					<Checkbox checked={flipHorizontal} onChange={(event) => setFlipHorizontal(event.target.checked)}>
						Flip horizontal
					</Checkbox>
					<Checkbox checked={flipVertical} onChange={(event) => setFlipVertical(event.target.checked)}>
						Flip vertical
					</Checkbox>
				</Space>
				<Field label="Output Format">
					<ImageFormatSelect value={format} onChange={setFormat} />
				</Field>
				<QualityField value={quality} onChange={setQuality} />
				<ProcessButton
					disabled={!file || !metadata}
					loading={processing}
					label="Rotate / Flip"
					onClick={() =>
						onProcess(async (sourceFile) => {
							const blob = await processImageInWorker(sourceFile, "rotate-flip", {
								rotation,
								flipHorizontal,
								flipVertical,
								mimeType: format,
								quality,
							});
							return createProcessedResult(blob, buildProcessedFileName(sourceFile.name, "rotated", format), format);
						})
					}
				/>
			</Space>
		</Card>
	);
};

const ConvertControls = ({ file, metadata, onProcess, processing }: IImageEditorControlsProps) => {
	const [format, setFormat] = useState<IImageMimeType>("image/webp");
	const [quality, setQuality] = useState(0.92);

	return (
		<Card title="Convert Settings">
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<Field label="Output Format">
					<ImageFormatSelect value={format} onChange={setFormat} />
				</Field>
				<QualityField value={quality} onChange={setQuality} />
				<ProcessButton
					disabled={!file || !metadata}
					loading={processing}
					label="Convert Image"
					onClick={() =>
						onProcess(async (sourceFile) => {
							const blob = await processImageInWorker(sourceFile, "convert", { mimeType: format, quality });
							return createProcessedResult(blob, buildProcessedFileName(sourceFile.name, "converted", format), format);
						})
					}
				/>
			</Space>
		</Card>
	);
};

const CompressControls = ({ file, metadata, onProcess, processing }: IImageEditorControlsProps) => {
	const [format, setFormat] = useState<IImageMimeType>("image/webp");
	const [sizeUnit, setSizeUnit] = useState<"KB" | "MB">("KB");
	const [targetSize, setTargetSize] = useState<number | null>(1024);
	const compressionQuality = 0.82;
	const maxSizeKb = metadata ? metadata.size / 1024 : 1024;
	const maxSizeMb = maxSizeKb / 1024;
	const maxSizeForUnit = sizeUnit === "KB" ? maxSizeKb : maxSizeMb;
	const safeTargetSize = targetSize ?? 0.01;
	const targetSizeForUnit = Math.min(Math.max(safeTargetSize, 0.01), Math.max(maxSizeForUnit, 0.01));
	const targetSizeMb = sizeUnit === "KB" ? targetSizeForUnit / 1024 : targetSizeForUnit;

	useEffect(() => {
		if (!metadata) {
			return;
		}

		const nextMaxSize = sizeUnit === "KB" ? metadata.size / 1024 : metadata.size / 1024 / 1024;

		setTargetSize((currentTargetSize) => {
			if (currentTargetSize === null) {
				return currentTargetSize;
			}

			return Number(Math.min(nextMaxSize, currentTargetSize).toFixed(2));
		});
	}, [metadata, sizeUnit]);

	const normalizeTargetSize = () => setTargetSize(Number(targetSizeForUnit.toFixed(2)));

	const updateSizeUnit = (nextUnit: "KB" | "MB") => {
		const targetSizeInKb = sizeUnit === "KB" ? targetSizeForUnit : targetSizeForUnit * 1024;
		const nextMaxSize = nextUnit === "KB" ? maxSizeKb : maxSizeMb;
		const nextTargetSize = nextUnit === "KB" ? targetSizeInKb : targetSizeInKb / 1024;

		setSizeUnit(nextUnit);
		setTargetSize(Number(Math.min(nextTargetSize, nextMaxSize).toFixed(2)));
	};

	return (
		<Card title="Compress Settings">
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<Field label="Maximum Size">
					<Space.Compact style={{ width: "100%" }}>
						<InputNumber
							min={0.01}
							max={Number(maxSizeForUnit.toFixed(2))}
							step={sizeUnit === "KB" ? 10 : 0.05}
							value={targetSize === null ? null : Number(targetSizeForUnit.toFixed(2))}
							onBlur={normalizeTargetSize}
							onChange={(value) => setTargetSize(value === null ? null : Math.min(Number(value), maxSizeForUnit))}
							style={{ width: "100%" }}
						/>
						<Segmented value={sizeUnit} options={["KB", "MB"]} onChange={(value) => updateSizeUnit(value as "KB" | "MB")} />
					</Space.Compact>
					<Typography.Text type="secondary">
						Upper limit: {maxSizeForUnit.toFixed(2)} {sizeUnit}
					</Typography.Text>
				</Field>
				<Field label="Output Format">
					<ImageFormatSelect value={format} onChange={setFormat} />
				</Field>
				<ProcessButton
					disabled={!file || !metadata}
					loading={processing}
					label="Compress Image"
					onClick={() =>
						onProcess(async (sourceFile) => {
							normalizeTargetSize();
							const blob = await compressImage(sourceFile, targetSizeMb, compressionQuality, format);
							return createProcessedResult(blob, buildProcessedFileName(sourceFile.name, "compressed", format), format);
						})
					}
				/>
			</Space>
		</Card>
	);
};

const aspectOptions = [
	{ label: "Original", value: "original" },
	{ label: "Square", value: "1" },
	{ label: "16:9", value: "1.7777777778" },
	{ label: "4:3", value: "1.3333333333" },
	{ label: "3:4", value: "0.75" },
];

const CropControls = ({ file, metadata, previewUrl, onProcess, processing }: IImageEditorControlsProps) => {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [aspectMode, setAspectMode] = useState("original");
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [format, setFormat] = useState<IImageMimeType>("image/png");
	const [quality, setQuality] = useState(0.92);
	const aspect = aspectMode === "original" && metadata ? metadata.width / metadata.height : Number(aspectMode) || 1;

	return (
		<Card title="Crop Settings">
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				{previewUrl ? (
					<div style={{ background: "#111827", height: 420, position: "relative", width: "100%" }}>
						<Cropper
							image={previewUrl}
							crop={crop}
							zoom={zoom}
							aspect={aspect}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
						/>
					</div>
				) : null}
				<Row gutter={[16, 16]}>
					<Col xs={24} md={12}>
						<Field label="Aspect Ratio">
							<Select value={aspectMode} options={aspectOptions} onChange={setAspectMode} />
						</Field>
					</Col>
					<Col xs={24} md={12}>
						<Field label="Zoom">
							<Slider min={1} max={4} step={0.01} value={zoom} onChange={setZoom} />
						</Field>
					</Col>
				</Row>
				<Field label="Output Format">
					<ImageFormatSelect value={format} onChange={setFormat} />
				</Field>
				<QualityField value={quality} onChange={setQuality} />
				<ProcessButton
					disabled={!file || !metadata || !croppedAreaPixels}
					loading={processing}
					label="Crop Image"
					onClick={() =>
						onProcess(async (sourceFile) => {
							const cropArea = croppedAreaPixels ?? { x: 0, y: 0, width: metadata?.width ?? 1, height: metadata?.height ?? 1 };
							const blob = await processImageInWorker(sourceFile, "crop", { ...cropArea, mimeType: format, quality });
							return createProcessedResult(blob, buildProcessedFileName(sourceFile.name, "cropped", format), format);
						})
					}
				/>
			</Space>
		</Card>
	);
};

const FilterControls = ({ file, metadata, onPreviewStyleChange, onProcess, processing }: IImageEditorControlsProps) => {
	const [brightness, setBrightness] = useState(100);
	const [contrast, setContrast] = useState(100);
	const [saturation, setSaturation] = useState(100);
	const [blur, setBlur] = useState(0);
	const [grayscale, setGrayscale] = useState(0);
	const [sepia, setSepia] = useState(0);
	const [format, setFormat] = useState<IImageMimeType>("image/png");
	const [quality, setQuality] = useState(0.92);

	useEffect(() => {
		onPreviewStyleChange({
			filter: [
				`brightness(${brightness}%)`,
				`contrast(${contrast}%)`,
				`saturate(${saturation}%)`,
				`blur(${blur}px)`,
				`grayscale(${grayscale}%)`,
				`sepia(${sepia}%)`,
			].join(" "),
		});

		return () => onPreviewStyleChange(undefined);
	}, [brightness, blur, contrast, grayscale, onPreviewStyleChange, saturation, sepia]);

	const slider = (label: string, value: number, onChange: (value: number) => void, min = 0, max = 200) => (
		<Field label={label}>
			<Slider min={min} max={max} value={value} onChange={onChange} />
		</Field>
	);

	return (
		<Card title="Filter Settings">
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<Row gutter={[16, 0]}>
					<Col xs={24} md={12}>
						{slider("Brightness", brightness, setBrightness)}
					</Col>
					<Col xs={24} md={12}>
						{slider("Contrast", contrast, setContrast)}
					</Col>
					<Col xs={24} md={12}>
						{slider("Saturation", saturation, setSaturation)}
					</Col>
					<Col xs={24} md={12}>
						{slider("Blur", blur, setBlur, 0, 20)}
					</Col>
					<Col xs={24} md={12}>
						{slider("Grayscale", grayscale, setGrayscale, 0, 100)}
					</Col>
					<Col xs={24} md={12}>
						{slider("Sepia", sepia, setSepia, 0, 100)}
					</Col>
				</Row>
				<Field label="Output Format">
					<ImageFormatSelect value={format} onChange={setFormat} />
				</Field>
				<QualityField value={quality} onChange={setQuality} />
				<ProcessButton
					disabled={!file || !metadata}
					loading={processing}
					label="Apply Filters"
					onClick={() =>
						onProcess(async (sourceFile) => {
							const blob = await processImageInWorker(sourceFile, "filters", {
								brightness,
								contrast,
								saturation,
								blur,
								grayscale,
								sepia,
								mimeType: format,
								quality,
							});
							return createProcessedResult(blob, buildProcessedFileName(sourceFile.name, "filtered", format), format);
						})
					}
				/>
			</Space>
		</Card>
	);
};

const WatermarkControls = ({ file, metadata, onProcess, processing }: IImageEditorControlsProps) => {
	const [text, setText] = useState("ToolHub");
	const [color, setColor] = useState("#ffffff");
	const [fontSize, setFontSize] = useState(48);
	const [opacity, setOpacity] = useState(0.5);
	const [position, setPosition] = useState("bottom-right");
	const [format, setFormat] = useState<IImageMimeType>("image/png");
	const [quality, setQuality] = useState(0.92);

	return (
		<Card title="Watermark Settings">
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<Field label="Text">
					<Input value={text} onChange={(event) => setText(event.target.value)} />
				</Field>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={12}>
						<Field label="Color">
							<Input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
						</Field>
					</Col>
					<Col xs={24} md={12}>
						<Field label="Position">
							<Select
								value={position}
								onChange={setPosition}
								options={[
									{ label: "Top left", value: "top-left" },
									{ label: "Top right", value: "top-right" },
									{ label: "Center", value: "center-center" },
									{ label: "Bottom left", value: "bottom-left" },
									{ label: "Bottom right", value: "bottom-right" },
								]}
							/>
						</Field>
					</Col>
				</Row>
				<Field label="Font Size">
					<InputNumber
						min={8}
						max={240}
						value={fontSize}
						addonAfter="px"
						onChange={(value) => setFontSize(Number(value) || 48)}
						style={{ width: "100%" }}
					/>
				</Field>
				<Field label="Opacity">
					<Slider min={0.05} max={1} step={0.05} value={opacity} onChange={setOpacity} />
				</Field>
				<Field label="Output Format">
					<ImageFormatSelect value={format} onChange={setFormat} />
				</Field>
				<QualityField value={quality} onChange={setQuality} />
				<ProcessButton
					disabled={!file || !metadata || !text.trim()}
					loading={processing}
					label="Add Watermark"
					onClick={() =>
						onProcess(async (sourceFile) => {
							const blob = await processImageInWorker(sourceFile, "watermark", {
								text,
								color,
								fontSize,
								opacity,
								position,
								mimeType: format,
								quality,
							});
							return createProcessedResult(blob, buildProcessedFileName(sourceFile.name, "watermarked", format), format);
						})
					}
				/>
			</Space>
		</Card>
	);
};

const getControls = (toolId: IImageEditorToolId, props: IImageEditorControlsProps) => {
	if (toolId === "resize-image") return <ResizeControls {...props} />;
	if (toolId === "rotate-flip-image") return <RotateFlipControls {...props} />;
	if (toolId === "convert-image") return <ConvertControls {...props} />;
	if (toolId === "compress-image") return <CompressControls {...props} />;
	if (toolId === "crop-image") return <CropControls {...props} />;
	if (toolId === "image-filters") return <FilterControls {...props} />;
	return <WatermarkControls {...props} />;
};

export const ImageEditorTool = ({ toolId }: { toolId: IImageEditorToolId }) => {
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState("");
	const [previewImageStyle, setPreviewImageStyle] = useState<CSSProperties | undefined>();
	const [result, setResult] = useState<IProcessedImageResult | null>(null);
	const [resultUrl, setResultUrl] = useState("");

	useEffect(() => {
		return () => {
			if (resultUrl) URL.revokeObjectURL(resultUrl);
		};
	}, [resultUrl]);

	const handleResult = (nextResult: IProcessedImageResult) => {
		if (resultUrl) URL.revokeObjectURL(resultUrl);

		setResult(nextResult);
		setResultUrl(URL.createObjectURL(nextResult.blob));
	};

	return (
		<ImageToolShell previewImageStyle={previewImageStyle}>
			{({ file, metadata, previewUrl }) => {
				const onProcess = async (processor: (sourceFile: File, sourceMetadata: IImageMetadata) => Promise<IProcessedImageResult>) => {
					if (!file || !metadata) {
						setError("Upload an image before processing.");
						return;
					}

					setProcessing(true);
					setError("");

					try {
						handleResult(await processor(file, metadata));
					} catch (caughtError) {
						setError(caughtError instanceof Error ? caughtError.message : "Unable to process this image.");
					} finally {
						setProcessing(false);
					}
				};

				return (
					<Space orientation="vertical" size="large" style={{ width: "100%" }}>
						{getControls(toolId, { file, metadata, previewUrl, onPreviewStyleChange: setPreviewImageStyle, onProcess, processing })}
						{error ? <Alert type="error" showIcon title={error} /> : null}
						{result ? (
							<ImagePreview
								title="Processed Output"
								src={resultUrl}
								metadata={result.metadata}
								extra={
									<Button icon={<DownloadOutlined />} onClick={() => downloadBlob(result.blob, result.fileName)}>
										Download {formatBytes(result.blob.size)}
									</Button>
								}
							/>
						) : null}
					</Space>
				);
			}}
		</ImageToolShell>
	);
};
