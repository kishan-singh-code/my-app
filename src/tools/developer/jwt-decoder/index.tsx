import { Alert } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { decodeJwt } from "./helper";

const sampleToken =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRvb2xIdWIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const JwtDecoder = () => {
	const [input, setInput] = useState(sampleToken);
	const result = decodeJwt(input);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				inputLabel="JWT"
				outputLabel={result.ok ? "Decoded JWT" : "Output"}
				placeholder="Paste a JWT"
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
			/>
		</ToolContainer>
	);
};

export default JwtDecoder;
