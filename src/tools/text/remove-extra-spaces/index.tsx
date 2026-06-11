import { Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { cleanText, type ICleanMode } from "./helper";

const RemoveExtraSpaces = () => {
	const [input, setInput] = useState("This    text\t has extra spaces.\n\n\nAnd too many blank lines.");
	const [mode, setMode] = useState<ICleanMode>("both");
	const output = cleanText(input, mode);

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
							{ label: "Spaces", value: "spaces" },
							{ label: "Blank Lines", value: "blank-lines" },
							{ label: "Both", value: "both" },
						]}
						onChange={(value) => setMode(value as ICleanMode)}
					/>
				}
				onSwap={() => setInput(output)}
			/>
		</ToolContainer>
	);
};

export default RemoveExtraSpaces;
