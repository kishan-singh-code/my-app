import { Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { reverseText, type ReverseMode } from "./helper";

const ReverseText = () => {
	const [input, setInput] = useState("one two three\nfour five six");
	const [mode, setMode] = useState<ReverseMode>("characters");
	const output = reverseText(input, mode);

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
							{ label: "Characters", value: "characters" },
							{ label: "Words", value: "words" },
							{ label: "Lines", value: "lines" },
						]}
						onChange={(value) => setMode(value as ReverseMode)}
					/>
				}
				onSwap={() => setInput(output)}
			/>
		</ToolContainer>
	);
};

export default ReverseText;
