import { Alert } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { formatHeaders } from "./helper";

const HttpHeaderFormatter = () => {
	const [input, setInput] = useState("content-type: application/json\ncache-control: no-cache\nx-request-id: abc-123");
	const result = formatHeaders(input);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				inputLabel="Raw headers"
				outputLabel={result.ok ? "Header JSON" : "Output"}
				placeholder="Paste HTTP headers"
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
			/>
		</ToolContainer>
	);
};

export default HttpHeaderFormatter;
