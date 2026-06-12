import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Input, Row, Select, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { downloadDataUrl, getExtensionFromMimeType } from "../shared/imageExport";
import { getImageMetadataFromDataUrl, normalizeImageDataUrl, type IImageMetadata } from "../shared/imageCanvas";
import { ImagePreview } from "../shared/ImagePreview";

const { TextArea } = Input;

const mimeOptions = [
	{ label: "PNG", value: "image/png" },
	{ label: "JPEG", value: "image/jpeg" },
	{ label: "WEBP", value: "image/webp" },
	{ label: "GIF", value: "image/gif" },
	{ label: "SVG", value: "image/svg+xml" },
];

const Base64ToImage = () => {
	const [input, setInput] = useState("");
	const [mimeType, setMimeType] = useState("image/png");
	const [dataUrl, setDataUrl] = useState("");
	const [metadata, setMetadata] = useState<IImageMetadata | null>(null);
	const [error, setError] = useState("");

	const decodeImage = async () => {
		try {
			const nextDataUrl = normalizeImageDataUrl(input, mimeType);
			const nextMetadata = await getImageMetadataFromDataUrl(nextDataUrl, `decoded-image.${getExtensionFromMimeType(mimeType)}`);

			setDataUrl(nextDataUrl);
			setMetadata(nextMetadata);
			setError("");
		} catch (caughtError) {
			setError(caughtError instanceof Error ? caughtError.message : "Unable to decode this Base64 image.");
			setDataUrl("");
			setMetadata(null);
		}
	};

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={10}>
						<Card title="Base64 Input">
							<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
								<Select value={mimeType} options={mimeOptions} onChange={setMimeType} />
								<TextArea
									value={input}
									onChange={(event) => setInput(event.target.value)}
									rows={12}
									placeholder="Paste a data:image/... URL or raw Base64 image string"
								/>
								<Space wrap>
									<Button type="primary" onClick={decodeImage} disabled={!input.trim()}>
										Preview Image
									</Button>
									<Button
										icon={<DownloadOutlined />}
										disabled={!dataUrl}
										onClick={() => downloadDataUrl(dataUrl, metadata?.name ?? `decoded-image.${getExtensionFromMimeType(mimeType)}`)}
									>
										Download Image
									</Button>
								</Space>
								{error ? <Alert type="error" showIcon title={error} /> : null}
							</Space>
						</Card>
					</Col>
					<Col xs={24} lg={14}>
						<ImagePreview src={dataUrl} metadata={metadata} title="Decoded Preview" />
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};

export default Base64ToImage;
