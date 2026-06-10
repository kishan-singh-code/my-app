import { Alert, Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { convertBase64, type CodecMode } from "./helper";

const Base64Codec = () => {
	const [input, setInput] = useState("ToolHub text tools");
	const [mode, setMode] = useState<CodecMode>("encode");
	const result = convertBase64(input, mode);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
				controls={
					<Segmented
						value={mode}
						options={[
							{ label: "Encode", value: "encode" },
							{ label: "Decode", value: "decode" },
						]}
						onChange={(value) => setMode(value as CodecMode)}
					/>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default Base64Codec;
