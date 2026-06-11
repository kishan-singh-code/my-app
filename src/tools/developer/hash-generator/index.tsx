import { Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../../text/shared/TextWorkbench";
import { generateHash, type IHashAlgorithm } from "./helper";

const HashGenerator = () => {
	const [input, setInput] = useState("ToolHub developer tools");
	const [algorithm, setAlgorithm] = useState<IHashAlgorithm>("sha256");
	const output = generateHash(input, algorithm);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={output}
				onInputChange={setInput}
				inputLabel="Text"
				outputLabel={`${algorithm.toUpperCase()} hash`}
				controls={
					<Segmented
						value={algorithm}
						options={[
							{ label: "SHA256", value: "sha256" },
							{ label: "MD5", value: "md5" },
						]}
						onChange={(value) => setAlgorithm(value as IHashAlgorithm)}
					/>
				}
			/>
		</ToolContainer>
	);
};

export default HashGenerator;
