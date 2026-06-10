import type { ReactNode } from "react";
import { AppProvider } from "./AppProvider";
import { ThemeProvider } from "./ThemeProvider";

export const AppProviders = ({ children }: { children: ReactNode }) => {
	return (
		<ThemeProvider>
			<AppProvider>{children}</AppProvider>
		</ThemeProvider>
	);
};
