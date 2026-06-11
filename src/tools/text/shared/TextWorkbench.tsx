import { CopyOutlined, DeleteOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Input, Row, Space, Typography } from "antd";
import type { ReactNode } from "react";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";

const { TextArea } = Input;

interface ITextWorkbenchProps {
	input: string;
	output: string;
	onInputChange: (value: string) => void;
	inputLabel?: string;
	outputLabel?: string;
	placeholder?: string;
	outputPlaceholder?: string;
	controls?: ReactNode;
	status?: ReactNode;
	actions?: ReactNode;
	allowOutputEdit?: boolean;
	onOutputChange?: (value: string) => void;
	onSwap?: () => void;
}

export const TextWorkbench = ({
	input,
	output,
	onInputChange,
	inputLabel = "Input",
	outputLabel = "Output",
	placeholder = "Paste or type text",
	outputPlaceholder = "Result appears here",
	controls,
	status,
	actions,
	allowOutputEdit = false,
	onOutputChange,
	onSwap,
}: ITextWorkbenchProps) => {
	const copyToClipboard = useCopyToClipboard();

	return (
		<Space orientation="vertical" size="large" style={{ width: "100%" }}>
			{controls ? (
				<div style={{ width: "100%", maxWidth: "100%", overflowX: "auto", paddingBottom: 2 }}>
					<Flex wrap="wrap" gap="small">
						{controls}
					</Flex>
				</div>
			) : null}
			{status}
			<Row gutter={[18, 18]}>
				<Col xs={24} lg={12}>
					<Card title={inputLabel}>
						<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
							<TextArea value={input} onChange={(event) => onInputChange(event.target.value)} placeholder={placeholder} rows={14} />
							<Space wrap>
								<Button icon={<DeleteOutlined />} onClick={() => onInputChange("")} disabled={!input}>
									Clear
								</Button>
								{onSwap ? (
									<Button icon={<SwapOutlined />} onClick={onSwap} disabled={!output}>
										Use Output
									</Button>
								) : null}
								{actions}
							</Space>
						</Space>
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card
						title={
							<Space>
								<Typography.Text>{outputLabel}</Typography.Text>
								<Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(output)} disabled={!output}>
									Copy
								</Button>
							</Space>
						}
					>
						<TextArea
							value={output}
							onChange={(event) => onOutputChange?.(event.target.value)}
							placeholder={outputPlaceholder}
							rows={14}
							readOnly={!allowOutputEdit}
						/>
					</Card>
				</Col>
			</Row>
		</Space>
	);
};
