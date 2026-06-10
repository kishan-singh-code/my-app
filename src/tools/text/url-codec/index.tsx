import { Alert, Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { convertUrl, type UrlMode } from "./helper";

const UrlCodec = () => {
	const [input, setInput] = useState("https://example.com/search?q=text tools&sort=a-z");
	const [mode, setMode] = useState<UrlMode>("encode");
	const result = convertUrl(input, mode);

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
						onChange={(value) => setMode(value as UrlMode)}
					/>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default UrlCodec;
