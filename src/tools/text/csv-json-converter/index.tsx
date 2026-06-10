import { Alert, Segmented } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { TextWorkbench } from "../shared/TextWorkbench";
import { csvToJson, jsonToCsv } from "./helper";

type ConversionMode = "csv-json" | "json-csv";

const sampleCsv = "name,category\nCase Converter,text\nJSON Formatter,text";

const CsvJsonConverter = () => {
	const [input, setInput] = useState(sampleCsv);
	const [mode, setMode] = useState<ConversionMode>("csv-json");
	const result = mode === "csv-json" ? csvToJson(input) : jsonToCsv(input);

	return (
		<ToolContainer>
			<TextWorkbench
				input={input}
				output={result.output}
				onInputChange={setInput}
				inputLabel={mode === "csv-json" ? "CSV" : "JSON"}
				outputLabel={mode === "csv-json" ? "JSON" : "CSV"}
				status={result.ok ? null : <Alert type="error" showIcon message={result.error} />}
				controls={
					<Segmented
						value={mode}
						options={[
							{ label: "CSV to JSON", value: "csv-json" },
							{ label: "JSON to CSV", value: "json-csv" },
						]}
						onChange={(value) => {
							const nextMode = value as ConversionMode;
							setMode(nextMode);
							setInput(nextMode === "csv-json" ? sampleCsv : '[{"name":"Case Converter","category":"text"}]');
						}}
					/>
				}
				onSwap={() => setInput(result.output)}
			/>
		</ToolContainer>
	);
};

export default CsvJsonConverter;
