import { Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { convertHtml, type HtmlMode } from "./helper";

const HtmlCodec = () => {
	const [input, setInput] = useState('<span class="label">ToolHub & Text</span>');
	const [mode, setMode] = useState<HtmlMode>("encode");
	const output = convertHtml(input, mode);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={output}
				onInputChange={setInput}
				controls={
					<Segmented
						value={mode}
						options={[
							{ label: "Encode", value: "encode" },
							{ label: "Decode", value: "decode" },
						]}
						onChange={(value) => setMode(value as HtmlMode)}
					/>
				}
				onSwap={() => setInput(output)}
			/>
		</ToolContainer>
	);
};

export default HtmlCodec;
