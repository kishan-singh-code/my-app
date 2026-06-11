import { Alert, Button, Select, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { formatCode, type ICodeLanguage, type IFormatCodeResult } from "./helper";

const languageOptions: { label: string; value: ICodeLanguage }[] = [
	{ label: "JavaScript", value: "javascript" },
	{ label: "TypeScript", value: "typescript" },
	{ label: "JSON", value: "json" },
	{ label: "HTML", value: "html" },
	{ label: "CSS", value: "css" },
];

const CodeFormatter = () => {
	const [input, setInput] = useState("const greet=(name:string)=>{return `Hello ${name}`}");
	const [language, setLanguage] = useState<ICodeLanguage>("typescript");
	const [result, setResult] = useState<IFormatCodeResult>({ ok: true, output: "" });
	const [isFormatting, setIsFormatting] = useState(false);

	const handleFormat = async () => {
		setIsFormatting(true);
		const nextResult = await formatCode(input, language);
		setResult(nextResult);
		setIsFormatting(false);
	};

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				inputLabel="Code"
				outputLabel={result.ok ? "Formatted code" : "Output"}
				placeholder="Paste code to format"
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
				controls={
					<Space wrap>
						<Select value={language} options={languageOptions} style={{ minWidth: 160 }} onChange={setLanguage} />
						<Button type="primary" onClick={handleFormat} loading={isFormatting}>
							Format
						</Button>
					</Space>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default CodeFormatter;
