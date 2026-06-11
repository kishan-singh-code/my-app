import { ConfigProvider, theme as antTheme } from "antd";
import type { ReactNode } from "react";
import { ThemeContextProvider, useThemeMode } from "../contexts/ThemeContext";

const AntThemeBridge = ({ children }: { children: ReactNode }) => {
	const { mode } = useThemeMode();

	return (
		<ConfigProvider
			theme={{
				algorithm: mode === "dark" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
			}}
		>
			{children}
		</ConfigProvider>
	);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	return (
		<ThemeContextProvider>
			<AntThemeBridge>{children}</AntThemeBridge>
		</ThemeContextProvider>
	);
};
