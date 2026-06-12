import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, InputNumber, Progress, Row, Segmented, Select, Slider, Space, Typography } from "antd";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { downloadTextFile } from "../../../utils/download";
import { loadImageElement, type IImageMetadata } from "../shared/imageCanvas";
import { ImagePreview } from "../shared/ImagePreview";
import { ImageUploader } from "../shared/ImageUploader";
import { createVTracerConverter } from "../shared/vtracerRuntime";
import {
	colorModeOptions,
	defaultVTracerConfig,
	hierarchicalModeOptions,
	pathModeOptions,
	toVTracerParams,
	type IVTracerColorMode,
	type IVTracerConfig,
	type IVTracerHierarchicalMode,
	type IVTracerPathMode,
} from "../shared/vtracerConfig";

const wasmUrl = `${import.meta.env.BASE_URL}wasm/vtracer.module.wasm`;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<Space orientation="vertical" size={4} style={{ width: "100%" }}>
		<Typography.Text strong>{label}</Typography.Text>
		{children}
	</Space>
);

const SliderField = ({
	label,
	value,
	min,
	max,
	step = 1,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	onChange: (value: number) => void;
}) => (
	<Field label={label}>
		<Row gutter={[12, 0]} align="middle">
			<Col flex="auto">
				<Slider min={min} max={max} step={step} value={value} onChange={onChange} />
			</Col>
			<Col>
				<InputNumber min={min} max={max} step={step} value={value} onChange={(nextValue) => onChange(Number(nextValue) || min)} />
			</Col>
		</Row>
	</Field>
);

const serializeSvg = (svgElement: SVGSVGElement) => {
	const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
	clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	return new XMLSerializer().serializeToString(clonedSvg);
};

const getSvgDataUrl = (svgText: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

export const SvgConverter = () => {
	const canvasId = useId().replace(/:/g, "");
	const svgId = useId().replace(/:/g, "");
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const activeConverterRef = useRef<Awaited<ReturnType<typeof createVTracerConverter>> | null>(null);
	const conversionRunIdRef = useRef(0);
	const [file, setFile] = useState<File | null>(null);
	const [metadata, setMetadata] = useState<IImageMetadata | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [svgText, setSvgText] = useState("");
	const [progress, setProgress] = useState(0);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState("");
	const [config, setConfig] = useState<IVTracerConfig>(defaultVTracerConfig);

	const updateConfig = <TKey extends keyof IVTracerConfig>(key: TKey, value: IVTracerConfig[TKey]) => {
		setConfig((currentConfig) => ({ ...currentConfig, [key]: value }));
	};

	useEffect(
		() => () => {
			conversionRunIdRef.current += 1;
			activeConverterRef.current?.free();

			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		},
		[previewUrl],
	);

	const handleImageSelect = async (nextFile: File) => {
		const objectUrl = URL.createObjectURL(nextFile);

		try {
			const image = await loadImageElement(objectUrl);
			const nextMetadata = {
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
			setSvgText("");
			setError("");
		} catch (caughtError) {
			URL.revokeObjectURL(objectUrl);
			setError(caughtError instanceof Error ? caughtError.message : "Unable to load this image.");
		}
	};

	const convertToSvg = useCallback(async () => {
		if (!file || !metadata || !canvasRef.current || !svgRef.current) {
			setError("Upload an image before converting.");
			return;
		}

		const runId = conversionRunIdRef.current + 1;
		conversionRunIdRef.current = runId;
		activeConverterRef.current?.free();
		activeConverterRef.current = null;
		setProcessing(true);
		setProgress(0);
		setError("");

		let converter: Awaited<ReturnType<typeof createVTracerConverter>> | null = null;

		try {
			const image = await loadImageElement(previewUrl);

			if (conversionRunIdRef.current !== runId) {
				return;
			}

			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");
			const svg = svgRef.current;

			if (!context) {
				throw new Error("Canvas is not available in this browser.");
			}

			while (svg.firstChild) {
				svg.removeChild(svg.firstChild);
			}

			canvas.width = metadata.width;
			canvas.height = metadata.height;
			svg.setAttribute("viewBox", `0 0 ${metadata.width} ${metadata.height}`);
			context.clearRect(0, 0, metadata.width, metadata.height);
			context.drawImage(image, 0, 0, metadata.width, metadata.height);

			converter = await createVTracerConverter(wasmUrl, config.colorMode, JSON.stringify(toVTracerParams(config, canvas.id, svg.id)));
			activeConverterRef.current = converter;

			let done = false;
			while (!done && conversionRunIdRef.current === runId) {
				const start = performance.now();
				while (conversionRunIdRef.current === runId && !(done = converter.tick()) && performance.now() - start < 25) {}

				if (conversionRunIdRef.current !== runId) {
					return;
				}

				setProgress(Math.min(converter.progress(), 100));
				await new Promise((resolve) => window.setTimeout(resolve, 1));
			}

			if (conversionRunIdRef.current !== runId) {
				return;
			}

			setProgress(100);
			setSvgText(serializeSvg(svg));
		} catch (caughtError) {
			if (conversionRunIdRef.current === runId) {
				setError(caughtError instanceof Error ? caughtError.message : "Unable to convert this image to SVG.");
			}
		} finally {
			if (activeConverterRef.current === converter) {
				activeConverterRef.current = null;
			}

			converter?.free();

			if (conversionRunIdRef.current === runId) {
				setProcessing(false);
			}
		}
	}, [config, file, metadata, previewUrl]);

	useEffect(() => {
		if (!file || !metadata || !previewUrl) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			void convertToSvg();
		}, 450);

		return () => {
			window.clearTimeout(timeoutId);
			conversionRunIdRef.current += 1;
			activeConverterRef.current?.free();
			activeConverterRef.current = null;
		};
	}, [config, convertToSvg, file, metadata, previewUrl]);

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
						<ImagePreview src={previewUrl} metadata={metadata} />
					</Col>
				</Row>

				<Card title="VTracer Configuration">
					<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
						<Row gutter={[16, 16]}>
							<Col xs={24} md={8}>
								<Field label="Color Mode">
									<Segmented
										value={config.colorMode}
										options={colorModeOptions}
										onChange={(value) => updateConfig("colorMode", value as IVTracerColorMode)}
									/>
								</Field>
							</Col>
							<Col xs={24} md={8}>
								<Field label="Hierarchical Mode">
									<Segmented
										value={config.hierarchicalMode}
										options={hierarchicalModeOptions}
										onChange={(value) => updateConfig("hierarchicalMode", value as IVTracerHierarchicalMode)}
									/>
								</Field>
							</Col>
							<Col xs={24} md={8}>
								<Field label="Path Mode">
									<Select
										value={config.pathMode}
										options={pathModeOptions}
										onChange={(value) => updateConfig("pathMode", value as IVTracerPathMode)}
									/>
								</Field>
							</Col>
						</Row>

						<Row gutter={[16, 0]}>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Filter Speckle"
									value={config.filterSpeckle}
									min={0}
									max={16}
									onChange={(value) => updateConfig("filterSpeckle", value)}
								/>
							</Col>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Color Precision"
									value={config.colorPrecision}
									min={1}
									max={8}
									onChange={(value) => updateConfig("colorPrecision", value)}
								/>
							</Col>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Layer Difference"
									value={config.layerDifference}
									min={0}
									max={255}
									onChange={(value) => updateConfig("layerDifference", value)}
								/>
							</Col>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Corner Threshold"
									value={config.cornerThreshold}
									min={0}
									max={180}
									onChange={(value) => updateConfig("cornerThreshold", value)}
								/>
							</Col>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Length Threshold"
									value={config.lengthThreshold}
									min={0.5}
									max={20}
									step={0.5}
									onChange={(value) => updateConfig("lengthThreshold", value)}
								/>
							</Col>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Splice Threshold"
									value={config.spliceThreshold}
									min={0}
									max={180}
									onChange={(value) => updateConfig("spliceThreshold", value)}
								/>
							</Col>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Path Precision"
									value={config.pathPrecision}
									min={0}
									max={10}
									onChange={(value) => updateConfig("pathPrecision", value)}
								/>
							</Col>
							<Col xs={24} md={12} xl={8}>
								<SliderField
									label="Max Iterations"
									value={config.maxIterations}
									min={1}
									max={50}
									onChange={(value) => updateConfig("maxIterations", value)}
								/>
							</Col>
						</Row>

						<Space wrap>
							<Button type="primary" loading={processing} disabled={!file} onClick={convertToSvg}>
								Convert to SVG
							</Button>
							<Button
								disabled={!svgText}
								icon={<DownloadOutlined />}
								onClick={() =>
									downloadTextFile(svgText, `${metadata?.name.replace(/\.[^.]+$/, "") || "vtracer"}.svg`, "image/svg+xml;charset=utf-8")
								}
							>
								Download SVG
							</Button>
						</Space>

						{processing ? <Progress percent={Math.round(progress)} /> : null}
						{error ? <Alert type="error" showIcon title={error} /> : null}
					</Space>
				</Card>

				{svgText ? (
					<Card title="SVG Output">
						<div style={{ overflow: "auto", width: "100%" }}>
							<img alt="SVG output preview" src={getSvgDataUrl(svgText)} style={{ maxHeight: 520, maxWidth: "100%" }} />
						</div>
					</Card>
				) : null}

				<canvas id={`vtracer-canvas-${canvasId}`} ref={canvasRef} style={{ display: "none" }} />
				<svg id={`vtracer-svg-${svgId}`} ref={svgRef} style={{ display: "none" }} />
			</Space>
		</ToolContainer>
	);
};
