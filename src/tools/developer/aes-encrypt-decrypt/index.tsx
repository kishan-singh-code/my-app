import { Alert, Input, Segmented, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { convertAes, type IAesMode } from "./helper";

const AesEncryptDecrypt = () => {
	const [input, setInput] = useState("Sensitive text");
	const [secret, setSecret] = useState("secret-key");
	const [mode, setMode] = useState<IAesMode>("encrypt");
	const result = convertAes(input, secret, mode);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				inputLabel={mode === "encrypt" ? "Plain text" : "Encrypted text"}
				outputLabel={mode === "encrypt" ? "Encrypted text" : "Plain text"}
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
				controls={
					<Space wrap>
						<Segmented
							value={mode}
							options={[
								{ label: "Encrypt", value: "encrypt" },
								{ label: "Decrypt", value: "decrypt" },
							]}
							onChange={(value) => setMode(value as IAesMode)}
						/>
						<Input.Password
							value={secret}
							placeholder="Secret key"
							style={{ width: 240 }}
							onChange={(event) => setSecret(event.target.value)}
						/>
					</Space>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default AesEncryptDecrypt;
