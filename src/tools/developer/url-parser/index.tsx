import { Alert } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { parseUrl } from "./helper";

const UrlParser = () => {
	const [input, setInput] = useState("https://example.com:443/search?q=text+tools&sort=a-z&q=developer#results");
	const result = parseUrl(input);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				inputLabel="URL"
				outputLabel={result.ok ? "Parsed URL" : "Output"}
				placeholder="Paste URL"
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
			/>
		</ToolContainer>
	);
};

export default UrlParser;
