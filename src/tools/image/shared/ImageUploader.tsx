import { InboxOutlined } from "@ant-design/icons";
import { Alert, Upload } from "antd";
import type { UploadProps } from "antd";

interface IImageUploaderProps {
	onImageSelect: (file: File) => void;
	error?: string;
}

export const ImageUploader = ({ onImageSelect, error }: IImageUploaderProps) => {
	const beforeUpload: UploadProps["beforeUpload"] = (file) => {
		if (!file.type.startsWith("image/")) {
			return Upload.LIST_IGNORE;
		}

		onImageSelect(file);
		return false;
	};

	return (
		<>
			<Upload.Dragger accept="image/*" beforeUpload={beforeUpload} maxCount={1} showUploadList={false}>
				<p className="ant-upload-drag-icon">
					<InboxOutlined />
				</p>
				<p className="ant-upload-text">Upload image</p>
				<p className="ant-upload-hint">PNG, JPG, WEBP, GIF, SVG, AVIF, and other browser-supported image files stay on this device.</p>
			</Upload.Dragger>
			{error ? <Alert type="error" showIcon title={error} style={{ marginTop: 12 }} /> : null}
		</>
	);
};
