import { Checkbox, Segmented, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { sortLines, type SortDirection } from "./helper";

const SortText = () => {
	const [input, setInput] = useState("Delta\nalpha\ncharlie\nBravo");
	const [direction, setDirection] = useState<SortDirection>("asc");
	const [ignoreCase, setIgnoreCase] = useState(true);
	const output = sortLines(input, direction, ignoreCase);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={output}
				onInputChange={setInput}
				controls={
					<Space wrap>
						<Segmented
							value={direction}
							options={[
								{ label: "A-Z", value: "asc" },
								{ label: "Z-A", value: "desc" },
							]}
							onChange={(value) => setDirection(value as SortDirection)}
						/>
						<Checkbox checked={ignoreCase} onChange={(event) => setIgnoreCase(event.target.checked)}>
							Ignore case
						</Checkbox>
					</Space>
				}
				onSwap={() => setInput(output)}
			/>
		</ToolContainer>
	);
};

export default SortText;
