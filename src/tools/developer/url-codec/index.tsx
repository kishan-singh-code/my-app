import { Alert, Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { convertUrl, type IUrlMode } from "./helper";

const UrlCodec = () => {
	const [input, setInput] = useState("https://example.com/search?q=text tools&sort=a-z");
	const [mode, setMode] = useState<IUrlMode>("encode");
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
						onChange={(value) => setMode(value as IUrlMode)}
					/>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default UrlCodec;
