import { Card, Col, Input, List, Row, Space, Tag, Typography } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { buildLineDiff, type DiffPart } from "./helper";

const { TextArea } = Input;

const markerByType = {
	same: " ",
	added: "+",
	removed: "-",
};

const tagColorByType: Record<DiffPart["type"], string> = {
	same: "default",
	added: "success",
	removed: "error",
};

const TextDiffChecker = () => {
	const [leftText, setLeftText] = useState("alpha\nbeta\ngamma");
	const [rightText, setRightText] = useState("alpha\nbeta updated\ngamma\ndelta");
	const diffParts = buildLineDiff(leftText, rightText);
	const addedCount = diffParts.filter((part) => part.type === "added").length;
	const removedCount = diffParts.filter((part) => part.type === "removed").length;

	return (
		<ToolContainer>
			<Row gutter={[18, 18]}>
				<Col xs={24} lg={12}>
					<Card title="Original">
						<TextArea value={leftText} onChange={(event) => setLeftText(event.target.value)} rows={12} />
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card title="Changed">
						<TextArea value={rightText} onChange={(event) => setRightText(event.target.value)} rows={12} />
					</Card>
				</Col>
			</Row>
			<Card
				title="Line diff"
				extra={
					<>
						<Tag color="green">+{addedCount}</Tag>
						<Tag color="red">-{removedCount}</Tag>
					</>
				}
				style={{ marginTop: 18 }}
			>
				<List
					size="small"
					dataSource={diffParts}
					renderItem={(part, index) => (
						<List.Item key={`${part.type}-${index}-${part.text}`}>
							<Space align="start">
								<Tag color={tagColorByType[part.type]}>{markerByType[part.type] || "="}</Tag>
								<Typography.Text type="secondary">{part.leftLine ?? part.rightLine}</Typography.Text>
								<Typography.Text code>{part.text || " "}</Typography.Text>
							</Space>
						</List.Item>
					)}
				/>
			</Card>
		</ToolContainer>
	);
};

export default TextDiffChecker;
