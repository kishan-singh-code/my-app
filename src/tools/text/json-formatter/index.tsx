import { Alert, InputNumber, Segmented, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { formatJson, minifyJson } from "./helper";

type JsonMode = "format" | "minify";

const JsonFormatter = () => {
	const [input, setInput] = useState('{"name":"ToolHub","tools":["json","text"]}');
	const [mode, setMode] = useState<JsonMode>("format");
	const [spaces, setSpaces] = useState(2);
	const result = mode === "format" ? formatJson(input, spaces) : minifyJson(input);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				outputLabel={result.ok ? "Valid JSON" : "Output"}
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
				controls={
					<Space wrap>
						<Segmented
							value={mode}
							options={[
								{ label: "Format", value: "format" },
								{ label: "Minify", value: "minify" },
							]}
							onChange={(value) => setMode(value as JsonMode)}
						/>
						<InputNumber
							min={2}
							max={8}
							value={spaces}
							disabled={mode === "minify"}
							onChange={(value) => setSpaces(value ?? 2)}
							addonBefore="Spaces"
						/>
					</Space>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default JsonFormatter;
