import { Card, Col, Input, Row, Statistic } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { analyzeText } from "./helper";

const { TextArea } = Input;

const WordCharacterCounter = () => {
	const [input, setInput] = useState("Paste text here to count words, characters, lines, and reading time.");
	const stats = analyzeText(input);

	return (
		<ToolContainer>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={12} md={8} xl={4}>
					<Card>
						<Statistic title="Words" value={stats.words} />
					</Card>
				</Col>
				<Col xs={12} md={8} xl={4}>
					<Card>
						<Statistic title="Characters" value={stats.characters} />
					</Card>
				</Col>
				<Col xs={12} md={8} xl={4}>
					<Card>
						<Statistic title="No Spaces" value={stats.charactersNoSpaces} />
					</Card>
				</Col>
				<Col xs={12} md={8} xl={4}>
					<Card>
						<Statistic title="Lines" value={stats.lines} />
					</Card>
				</Col>
				<Col xs={12} md={8} xl={4}>
					<Card>
						<Statistic title="Paragraphs" value={stats.paragraphs} />
					</Card>
				</Col>
				<Col xs={12} md={8} xl={4}>
					<Card>
						<Statistic title="Reading Min" value={stats.readingMinutes} />
					</Card>
				</Col>
			</Row>
			<TextArea value={input} onChange={(event) => setInput(event.target.value)} rows={16} placeholder="Paste or type text" />
		</ToolContainer>
	);
};

export default WordCharacterCounter;
