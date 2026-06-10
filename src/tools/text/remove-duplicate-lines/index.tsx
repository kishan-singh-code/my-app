import { Checkbox } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { removeDuplicateLines } from "./helper";

const RemoveDuplicateLines = () => {
	const [input, setInput] = useState("alpha\nbeta\nalpha\ngamma\nBeta");
	const [ignoreCase, setIgnoreCase] = useState(false);
	const output = removeDuplicateLines(input, ignoreCase);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={output}
				onInputChange={setInput}
				controls={
					<Checkbox checked={ignoreCase} onChange={(event) => setIgnoreCase(event.target.checked)}>
						Ignore case
					</Checkbox>
				}
				onSwap={() => setInput(output)}
			/>
		</ToolContainer>
	);
};

export default RemoveDuplicateLines;
