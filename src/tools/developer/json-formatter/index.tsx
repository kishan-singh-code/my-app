import { Alert, Button, InputNumber, Segmented, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { formatJson, minifyJson } from "./helper";

type IJsonMode = "format" | "minify";

const JsonFormatter = () => {
	const [input, setInput] = useState('{"name":"ToolHub","tools":["json","text"]}');
	const [mode, setMode] = useState<IJsonMode>("format");
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
							onChange={(value) => setMode(value as IJsonMode)}
						/>
						<Space.Compact>
							<Button disabled>Spaces</Button>
							<InputNumber min={2} max={8} value={spaces} disabled={mode === "minify"} onChange={(value) => setSpaces(value ?? 2)} />
						</Space.Compact>
					</Space>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default JsonFormatter;
