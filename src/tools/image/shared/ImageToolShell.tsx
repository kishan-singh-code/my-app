import { Button, Card, Col, Row, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { downloadBlob } from "./imageExport";
import { getImageMetadata, imageMetadataRows, type IImageMetadata } from "./imageCanvas";
import { ImagePreview } from "./ImagePreview";
import { ImageUploader } from "./ImageUploader";

interface IImageToolState {
	file: File | null;
	metadata: IImageMetadata | null;
	previewUrl: string;
	loading: boolean;
	error: string;
	resetImage: () => void;
}

interface IImageToolShellProps {
	children?: (state: IImageToolState) => ReactNode;
	previewImageStyle?: CSSProperties;
	showDetails?: boolean;
}

const metadataColumns: ColumnsType<{ key: string; metric: string; value: string | number }> = [
	{ title: "Metric", dataIndex: "metric", key: "metric" },
	{ title: "Value", dataIndex: "value", key: "value" },
];

export const ImageToolShell = ({ children, previewImageStyle, showDetails = false }: IImageToolShellProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [metadata, setMetadata] = useState<IImageMetadata | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const resetImage = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		setFile(null);
		setMetadata(null);
		setPreviewUrl("");
		setError("");
	};

	const handleImageSelect = async (nextFile: File) => {
		setLoading(true);
		setError("");

		try {
			const nextMetadata = await getImageMetadata(nextFile);
			const nextPreviewUrl = URL.createObjectURL(nextFile);

			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}

			setFile(nextFile);
			setMetadata(nextMetadata);
			setPreviewUrl(nextPreviewUrl);
		} catch (caughtError) {
			setError(caughtError instanceof Error ? caughtError.message : "Unable to load this image.");
		} finally {
			setLoading(false);
		}
	};

	const state: IImageToolState = { file, metadata, previewUrl, loading, error, resetImage };

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
							imageStyle={previewImageStyle}
							extra={
								file ? (
									<Space wrap>
										<Button onClick={() => downloadBlob(file, file.name)}>Download</Button>
										<Button onClick={resetImage}>Clear</Button>
									</Space>
								) : null
							}
						/>
					</Col>
				</Row>
				{showDetails && metadata ? (
					<Card title="Image Details">
						<Table
							columns={metadataColumns}
							dataSource={imageMetadataRows(metadata)}
							pagination={false}
							scroll={{ x: true }}
							loading={loading}
						/>
					</Card>
				) : null}
				{children?.(state)}
			</Space>
		</ToolContainer>
	);
};
