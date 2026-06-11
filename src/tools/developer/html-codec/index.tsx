import { Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { convertHtml, type IHtmlMode } from "./helper";

const HtmlCodec = () => {
	const [input, setInput] = useState('<span class="label">ToolHub & Text</span>');
	const [mode, setMode] = useState<IHtmlMode>("encode");
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
						onChange={(value) => setMode(value as IHtmlMode)}
					/>
				}
				onSwap={() => setInput(output)}
			/>
		</ToolContainer>
	);
};

export default HtmlCodec;
