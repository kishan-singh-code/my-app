import { CopyOutlined, DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Input, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { downloadTextFile } from "../../../utils/download";
import { fileToDataUrl, formatBytes } from "../shared/imageCanvas";
import { ImageToolShell } from "../shared/ImageToolShell";

const { TextArea } = Input;

const Base64Output = ({ file }: { file: File | null }) => {
	const [base64Value, setBase64Value] = useState("");
	const [error, setError] = useState("");
	const copyToClipboard = useCopyToClipboard();

	useEffect(() => {
		let cancelled = false;

		const convertFile = async () => {
			if (!file) {
				setBase64Value("");
				setError("");
				return;
			}

			try {
				const nextValue = await fileToDataUrl(file);

				if (!cancelled) {
					setBase64Value(nextValue);
					setError("");
				}
			} catch (caughtError) {
				if (!cancelled) {
					setError(caughtError instanceof Error ? caughtError.message : "Unable to convert this image.");
				}
			}
		};

		convertFile();

		return () => {
			cancelled = true;
		};
	}, [file]);

	if (!file) {
		return null;
	}

	return (
		<Card
			title="Base64 Output"
			extra={
				<Space wrap>
					<Button icon={<CopyOutlined />} disabled={!base64Value} onClick={() => copyToClipboard(base64Value)}>
						Copy
					</Button>
					<Button icon={<DownloadOutlined />} disabled={!base64Value} onClick={() => downloadTextFile(base64Value, `${file.name}.txt`)}>
						Download Text
					</Button>
				</Space>
			}
		>
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				{error ? <Alert type="error" showIcon title={error} /> : null}
				<Typography.Text type="secondary">
					Original size: {formatBytes(file.size)}. Base64 text length: {base64Value.length.toLocaleString("en-IN")} characters.
				</Typography.Text>
				<TextArea value={base64Value} rows={10} readOnly />
			</Space>
		</Card>
	);
};

const ImageToBase64 = () => <ImageToolShell>{({ file }) => <Base64Output file={file} />}</ImageToolShell>;

export default ImageToBase64;
