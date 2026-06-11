import { Alert, Card, Col, Input, Row, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { testRegex, type IRegexMatchResult } from "./helper";

const { TextArea } = Input;

const columns: ColumnsType<IRegexMatchResult> = [
	{ title: "Index", dataIndex: "index", width: 90 },
	{ title: "Match", dataIndex: "value" },
	{
		title: "Groups",
		dataIndex: "groups",
		render: (groups: string[]) =>
			groups.length ? groups.map((group, index) => <Tag key={`${index}-${group}`}>{group || "empty"}</Tag>) : "-",
	},
];

const RegexTester = () => {
	const [pattern, setPattern] = useState("\\b\\w{5}\\b");
	const [flags, setFlags] = useState("gi");
	const [text, setText] = useState("Find every short word inside this sample text.");
	const result = testRegex(pattern, flags, text);

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={16}>
						<Input addonBefore="Pattern" value={pattern} onChange={(event) => setPattern(event.target.value)} />
					</Col>
					<Col xs={24} md={8}>
						<Input addonBefore="Flags" value={flags} onChange={(event) => setFlags(event.target.value)} />
					</Col>
				</Row>
				<TextArea value={text} onChange={(event) => setText(event.target.value)} rows={10} />
				{result.ok ? (
					<Alert type="success" showIcon message={`${result.matches.length} match${result.matches.length === 1 ? "" : "es"}`} />
				) : (
					<Alert type="error" showIcon message={result.error} />
				)}
				<Card title="Matches">
					<Table
						rowKey={(record) => `${record.index}-${record.value}`}
						columns={columns}
						dataSource={result.matches}
						pagination={{ pageSize: 8 }}
					/>
					{!result.matches.length && result.ok ? <Typography.Text type="secondary">No matches</Typography.Text> : null}
				</Card>
			</Space>
		</ToolContainer>
	);
};

export default RegexTester;
