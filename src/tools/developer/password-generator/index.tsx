import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Checkbox, Input, InputNumber, Slider, Space } from "antd";
import { useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { generatePasswords, type IPasswordOptions } from "./helper";

const { TextArea } = Input;

const PasswordGenerator = () => {
	const [options, setOptions] = useState<IPasswordOptions>({ length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true });
	const [count, setCount] = useState(5);
	const [result, setResult] = useState(() => generatePasswords(options, 5));
	const copyToClipboard = useCopyToClipboard();

	const updateOption = <Key extends keyof IPasswordOptions>(key: Key, value: IPasswordOptions[Key]) => {
		setOptions((currentOptions) => ({ ...currentOptions, [key]: value }));
	};

	const handleGenerate = () => setResult(generatePasswords(options, count));

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
					<Space wrap>
						<Space.Compact>
							<Button disabled>Length</Button>
							<InputNumber min={8} max={128} value={options.length} onChange={(value) => updateOption("length", value ?? 16)} />
						</Space.Compact>
						<Space.Compact>
							<Button disabled>Count</Button>
							<InputNumber min={1} max={50} value={count} onChange={(value) => setCount(value ?? 1)} />
						</Space.Compact>
						<Button type="primary" icon={<ReloadOutlined />} onClick={handleGenerate}>
							Generate
						</Button>
						<Button icon={<CopyOutlined />} onClick={() => copyToClipboard(result.output)} disabled={!result.output}>
							Copy
						</Button>
					</Space>
					<Slider min={8} max={128} value={options.length} onChange={(value) => updateOption("length", value)} />
					<Space wrap>
						<Checkbox checked={options.uppercase} onChange={(event) => updateOption("uppercase", event.target.checked)}>
							Uppercase
						</Checkbox>
						<Checkbox checked={options.lowercase} onChange={(event) => updateOption("lowercase", event.target.checked)}>
							Lowercase
						</Checkbox>
						<Checkbox checked={options.numbers} onChange={(event) => updateOption("numbers", event.target.checked)}>
							Numbers
						</Checkbox>
						<Checkbox checked={options.symbols} onChange={(event) => updateOption("symbols", event.target.checked)}>
							Symbols
						</Checkbox>
					</Space>
				</Space>
				{result.ok ? null : <Alert type="error" showIcon message={result.error} />}
				<Card title="Passwords">
					<TextArea value={result.output} rows={12} readOnly />
				</Card>
			</Space>
		</ToolContainer>
	);
};

export default PasswordGenerator;
