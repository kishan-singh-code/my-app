import { Card, Col, Input, Row } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { renderMarkdown } from "./helper";

const { TextArea } = Input;

const MarkdownPreview = () => {
	const [input, setInput] = useState(
		"# Markdown Preview\n\nWrite **bold** text, *emphasis*, `code`, and links like [Vite](https://vite.dev).\n\n- Frontend only\n- Safe escaped HTML",
	);
	const html = renderMarkdown(input);

	return (
		<ToolContainer>
			<Row gutter={[18, 18]}>
				<Col xs={24} lg={12}>
					<Card title="Markdown">
						<TextArea value={input} onChange={(event) => setInput(event.target.value)} rows={18} />
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card title="Preview">
						<div style={{ minHeight: 392 }} dangerouslySetInnerHTML={{ __html: html }} />
					</Card>
				</Col>
			</Row>
		</ToolContainer>
	);
};

export default MarkdownPreview;
