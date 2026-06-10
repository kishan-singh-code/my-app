import { App as AntApp } from "antd";
import type { ReactNode } from "react";
import { AppContextProvider } from "../../contexts/AppContext";

export const AppProvider = ({ children }: { children: ReactNode }) => {
	return (
		<AntApp>
			<AppContextProvider>{children}</AppContextProvider>
		</AntApp>
	);
};
