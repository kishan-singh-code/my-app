import { Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { convertCase, type ICaseMode } from "./helper";

const options: { label: string; value: ICaseMode }[] = [
	{ label: "Upper", value: "upper" },
	{ label: "Lower", value: "lower" },
	{ label: "Title", value: "title" },
	{ label: "Sentence", value: "sentence" },
	{ label: "camel", value: "camel" },
	{ label: "kebab", value: "kebab" },
	{ label: "snake", value: "snake" },
];

const CaseConverter = () => {
	const [input, setInput] = useState("The quick brown fox jumps over the lazy dog.");
	const [mode, setMode] = useState<ICaseMode>("upper");
	const output = convertCase(input, mode);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={output}
				onInputChange={setInput}
				controls={<Segmented value={mode} options={options} onChange={(value) => setMode(value)}/>}
				onSwap={() => setInput(output)}
			/>
		</ToolContainer>
	);
};

export default CaseConverter;
