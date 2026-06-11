import { CopyOutlined, DeleteOutlined, ImportOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Checkbox, Col, Empty, Input, InputNumber, Row, Select, Space, Statistic, Tabs, Tag } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import {
	apiAuthTypes,
	apiBodyTypes,
	apiMethods,
	createApiResponseReport,
	createEmptyAuthDraft,
	createKeyValueRow,
	formatBytes,
	formatDuration,
	getStatusColor,
	parseRequestInput,
	sendApiRequest,
	type IApiAuthDraft,
	type IApiAuthType,
	type IApiBodyType,
	type IApiMethod,
	type IApiRequestDraft,
	type IApiRequestExecutionResult,
	type IKeyValueRow,
} from "./helper";

const { TextArea } = Input;

const bodyTypeLabels: Record<IApiBodyType, string> = {
	json: "JSON",
	form: "Form (url-encoded)",
	xml: "XML",
};

const bodyPlaceholders: Record<IApiBodyType, string> = {
	json: '{"name":"ToolHub"}',
	form: "name=ToolHub&category=developer",
	xml: "<request><name>ToolHub</name></request>",
};

const authTypeLabels: Record<IApiAuthType, string> = {
	none: "No Auth",
	bearer: "Bearer Token",
	basic: "Basic Auth",
	custom: "Custom Authorization",
};

const initialRequestDraft: IApiRequestDraft = {
	requestInput: "https://jsonplaceholder.typicode.com/posts/1",
	method: "GET",
	queryParams: [createKeyValueRow()],
	headers: [createKeyValueRow("Accept", "application/json")],
	bodyType: "json",
	bodyText: "",
	auth: createEmptyAuthDraft(),
	timeoutMs: 15000,
};

interface IKeyValueEditorProps {
	rows: IKeyValueRow[];
	onChange: (rows: IKeyValueRow[]) => void;
	addLabel: string;
	emptyText: string;
	keyPlaceholder: string;
	valuePlaceholder: string;
}

const KeyValueEditor = ({ rows, onChange, addLabel, emptyText, keyPlaceholder, valuePlaceholder }: IKeyValueEditorProps) => {
	const updateRow = (id: string, changes: Partial<IKeyValueRow>) => {
		onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
	};

	const removeRow = (id: string) => {
		onChange(rows.filter((row) => row.id !== id));
	};

	return (
		<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
			{rows.length ? (
				<Space orientation="vertical" size="small" style={{ width: "100%" }}>
					{rows.map((row) => (
						<Row gutter={[8, 8]} align="middle" key={row.id}>
							<Col flex="32px">
								<Checkbox checked={row.enabled} onChange={(event) => updateRow(row.id, { enabled: event.target.checked })} />
							</Col>
							<Col xs={24} md={8}>
								<Input value={row.key} placeholder={keyPlaceholder} onChange={(event) => updateRow(row.id, { key: event.target.value })} />
							</Col>
							<Col xs={24} md={12}>
								<Input
									value={row.value}
									placeholder={valuePlaceholder}
									onChange={(event) => updateRow(row.id, { value: event.target.value })}
								/>
							</Col>
							<Col flex="42px">
								<Button icon={<DeleteOutlined />} aria-label={`Remove ${row.key || "row"}`} onClick={() => removeRow(row.id)} />
							</Col>
						</Row>
					))}
				</Space>
			) : (
				<Empty description={emptyText} />
			)}
			<Button icon={<PlusOutlined />} onClick={() => onChange([...rows, createKeyValueRow()])}>
				{addLabel}
			</Button>
		</Space>
	);
};

const formatHeaderOutput = (headers: Record<string, string>) => JSON.stringify(headers, null, 2);

const ApiResponseTimeCalculator = () => {
	const [draft, setDraft] = useState<IApiRequestDraft>(initialRequestDraft);
	const [result, setResult] = useState<IApiRequestExecutionResult | null>(null);
	const [isSending, setIsSending] = useState(false);
	const copyToClipboard = useCopyToClipboard();
	const report = createApiResponseReport(result);

	const updateDraft = <Key extends keyof IApiRequestDraft>(key: Key, value: IApiRequestDraft[Key]) => {
		setDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
	};

	const updateAuth = <Key extends keyof IApiAuthDraft>(key: Key, value: IApiAuthDraft[Key]) => {
		setDraft((currentDraft) => ({ ...currentDraft, auth: { ...currentDraft.auth, [key]: value } }));
	};

	const handleImportRequest = () => {
		const parsedRequest = parseRequestInput(draft);

		if (!parsedRequest.ok) {
			setResult({ ok: false, error: parsedRequest.error, warnings: parsedRequest.warnings });
			return;
		}

		setDraft((currentDraft) => ({
			...currentDraft,
			requestInput: parsedRequest.request.baseUrl,
			method: parsedRequest.request.method,
			queryParams: parsedRequest.request.queryParams.length ? parsedRequest.request.queryParams : [createKeyValueRow()],
			headers: parsedRequest.request.headerRows.length ? parsedRequest.request.headerRows : [createKeyValueRow()],
			bodyType: parsedRequest.request.bodyType,
			bodyText: parsedRequest.request.body,
			auth: parsedRequest.request.auth,
		}));
		setResult(null);
	};

	const handleSend = async () => {
		setIsSending(true);
		const nextResult = await sendApiRequest(draft);
		setResult(nextResult);
		setIsSending(false);
	};

	const resetRequest = () => {
		setDraft({
			...initialRequestDraft,
			queryParams: [createKeyValueRow()],
			headers: [createKeyValueRow("Accept", "application/json")],
			auth: createEmptyAuthDraft(),
		});
		setResult(null);
	};

	const renderAuthFields = () => {
		if (draft.auth.type === "bearer") {
			return (
				<Input.Password
					value={draft.auth.bearerToken}
					placeholder="Bearer token"
					onChange={(event) => updateAuth("bearerToken", event.target.value)}
				/>
			);
		}

		if (draft.auth.type === "basic") {
			return (
				<Row gutter={[12, 12]}>
					<Col xs={24} md={12}>
						<Input
							value={draft.auth.basicUsername}
							placeholder="Username"
							onChange={(event) => updateAuth("basicUsername", event.target.value)}
						/>
					</Col>
					<Col xs={24} md={12}>
						<Input.Password
							value={draft.auth.basicPassword}
							placeholder="Password"
							onChange={(event) => updateAuth("basicPassword", event.target.value)}
						/>
					</Col>
				</Row>
			);
		}

		if (draft.auth.type === "custom") {
			return (
				<Input
					value={draft.auth.customValue}
					placeholder="Authorization value"
					onChange={(event) => updateAuth("customValue", event.target.value)}
				/>
			);
		}

		return <Empty description="No authorization header will be added." />;
	};

	const renderResponse = () => {
		if (!result) {
			return <Empty description="Send a request to calculate response time." />;
		}

		if (!result.ok) {
			return (
				<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
					<Alert type="error" showIcon title={result.error} description={result.details} />
					{result.warnings.length ? (
						<Alert type="warning" showIcon title="Request adjusted for browser limits" description={result.warnings.join(" ")} />
					) : null}
					{result.durationMs === undefined ? null : (
						<Row gutter={[16, 16]}>
							<Col xs={12} md={6}>
								<Statistic title="Time" value={formatDuration(result.durationMs)} />
							</Col>
						</Row>
					)}
					{report ? (
						<Card
							title="Report JSON"
							extra={
								<Button size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(report)}>
									Copy
								</Button>
							}
						>
							<TextArea value={report} rows={10} readOnly />
						</Card>
					) : null}
				</Space>
			);
		}

		const statusLabel = [result.response.status, result.response.statusText].filter(Boolean).join(" ");

		return (
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				{result.warnings.length ? (
					<Alert type="warning" showIcon title="Request adjusted for browser limits" description={result.warnings.join(" ")} />
				) : null}
				<Row gutter={[16, 16]}>
					<Col xs={12} md={6}>
						<Statistic title="Status" valueRender={() => <Tag color={getStatusColor(result.response.status)}>{statusLabel}</Tag>} />
					</Col>
					<Col xs={12} md={6}>
						<Statistic title="Time" value={formatDuration(result.response.durationMs)} />
					</Col>
					<Col xs={12} md={6}>
						<Statistic title="Size" value={formatBytes(result.response.sizeBytes)} />
					</Col>
					<Col xs={12} md={6}>
						<Statistic title="Content Type" value={result.response.contentType} styles={{ content: { fontSize: 16 } }} />
					</Col>
				</Row>
				<Tabs
					items={[
						{
							key: "body",
							label: "Body",
							children: <TextArea value={result.response.bodyText} rows={14} readOnly placeholder="No response body" />,
						},
						{
							key: "headers",
							label: "Headers",
							children: <TextArea value={formatHeaderOutput(result.response.headers)} rows={14} readOnly />,
						},
						{
							key: "request",
							label: "Request",
							children: (
								<TextArea
									value={JSON.stringify(
										{
											method: result.request.method,
											url: result.request.url,
											queryParams: result.request.queryParams.map((row) => ({ key: row.key, value: row.value })),
											headers: result.request.headers,
											bodyType: result.request.bodyType,
											authType: result.request.auth.type,
											body: result.request.body || undefined,
											timeoutMs: result.request.timeoutMs,
										},
										null,
										2,
									)}
									rows={14}
									readOnly
								/>
							),
						},
						{
							key: "report",
							label: "Report JSON",
							children: <TextArea value={report} rows={14} readOnly />,
						},
					]}
				/>
			</Space>
		);
	};

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Card title="Request">
					<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
						<TextArea
							value={draft.requestInput}
							onChange={(event) => updateDraft("requestInput", event.target.value)}
							placeholder="https://google.com or CURL command"
							rows={4}
						/>
						<Space wrap>
							<Select
								value={draft.method}
								options={apiMethods.map((method) => ({ label: method, value: method }))}
								style={{ width: 128 }}
								onChange={(value) => updateDraft("method", value as IApiMethod)}
							/>
							<Space.Compact>
								<Button disabled>Timeout</Button>
								<InputNumber
									min={1000}
									max={120000}
									step={1000}
									value={draft.timeoutMs}
									onChange={(value) => updateDraft("timeoutMs", value ?? 15000)}
								/>
							</Space.Compact>
							<Button type="primary" icon={<SendOutlined />} loading={isSending} onClick={handleSend}>
								Send
							</Button>
							<Button icon={<ImportOutlined />} onClick={handleImportRequest}>
								Parse Input
							</Button>
							<Button icon={<DeleteOutlined />} onClick={resetRequest}>
								Reset
							</Button>
							<Button icon={<CopyOutlined />} onClick={() => copyToClipboard(report)} disabled={!report}>
								Copy Report
							</Button>
						</Space>
						<Tabs
							items={[
								{
									key: "query-params",
									label: "Query Params",
									children: (
										<KeyValueEditor
											rows={draft.queryParams}
											onChange={(rows) => updateDraft("queryParams", rows)}
											addLabel="Add Query Param"
											emptyText="No query params"
											keyPlaceholder="Key"
											valuePlaceholder="Value"
										/>
									),
								},
								{
									key: "auth",
									label: "Auth",
									children: (
										<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
											<Select
												value={draft.auth.type}
												options={apiAuthTypes.map((authType) => ({ label: authTypeLabels[authType], value: authType }))}
												style={{ minWidth: 220 }}
												onChange={(value) => updateAuth("type", value as IApiAuthType)}
											/>
											{renderAuthFields()}
										</Space>
									),
								},
								{
									key: "headers",
									label: "Headers",
									children: (
										<KeyValueEditor
											rows={draft.headers}
											onChange={(rows) => updateDraft("headers", rows)}
											addLabel="Add Header"
											emptyText="No headers"
											keyPlaceholder="Header"
											valuePlaceholder="Value"
										/>
									),
								},
								{
									key: "body",
									label: "Body",
									children: (
										<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
											<Select
												value={draft.bodyType}
												options={apiBodyTypes.map((bodyType) => ({ label: bodyTypeLabels[bodyType], value: bodyType }))}
												style={{ minWidth: 220 }}
												onChange={(value) => updateDraft("bodyType", value as IApiBodyType)}
											/>
											<TextArea
												value={draft.bodyText}
												onChange={(event) => updateDraft("bodyText", event.target.value)}
												placeholder={bodyPlaceholders[draft.bodyType]}
												rows={9}
											/>
										</Space>
									),
								},
							]}
						/>
					</Space>
				</Card>

				<Card title="Response">{renderResponse()}</Card>
			</Space>
		</ToolContainer>
	);
};

export default ApiResponseTimeCalculator;
