import { App } from "antd";

const fallbackCopy = (value: string) => {
	const textArea = document.createElement("textarea");
	textArea.value = value;
	textArea.style.position = "fixed";
	textArea.style.opacity = "0";
	document.body.appendChild(textArea);
	textArea.select();
	document.execCommand("copy");
	document.body.removeChild(textArea);
};

export const useCopyToClipboard = () => {
	const { message } = App.useApp();

	return async (value: string) => {
		if (!value) {
			message.info("Nothing to copy");
			return;
		}

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
			} else {
				fallbackCopy(value);
			}

			message.success("Copied");
		} catch {
			fallbackCopy(value);
			message.success("Copied");
		}
	};
};
