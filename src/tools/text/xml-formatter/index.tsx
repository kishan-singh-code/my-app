import { Alert } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { formatXml } from "./helper";

const XmlFormatter = () => {
	const [input, setInput] = useState('<root><tool name="XML"><status>ready</status></tool></root>');
	const result = formatXml(input);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				outputLabel={result.ok ? "Valid XML" : "Output"}
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default XmlFormatter;
