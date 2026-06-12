import { Card, Empty, Image as AntImage, Space, Statistic } from "antd";
import type { CSSProperties, ReactNode } from "react";
import type { IImageMetadata } from "./imageCanvas";
import { formatBytes } from "./imageCanvas";

interface IImagePreviewProps {
	src: string;
	metadata?: IImageMetadata | null;
	title?: string;
	extra?: ReactNode;
	imageStyle?: CSSProperties;
}

export const ImagePreview = ({ src, metadata, title = "Preview", extra, imageStyle }: IImagePreviewProps) => (
	<Card title={title} extra={extra}>
		{src ? (
			<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
				<div style={{ alignItems: "center", display: "flex", justifyContent: "center", minHeight: 260 }}>
					<AntImage
						src={src}
						alt={metadata?.name ?? "Image preview"}
						style={{ maxHeight: 420, objectFit: "contain", width: "100%", ...imageStyle }}
					/>
				</div>
				{metadata ? (
					<Space wrap size="large">
						<Statistic title="Dimensions" value={`${metadata.width} x ${metadata.height}px`} />
						<Statistic title="File Size" value={formatBytes(metadata.size)} />
						<Statistic title="Type" value={metadata.mimeType} />
					</Space>
				) : null}
			</Space>
		) : (
			<Empty description="Upload or paste an image to preview it" />
		)}
	</Card>
);
