import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface AppContextValue {
	recentToolPaths: string[];
	trackToolOpen: (path: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	const [recentToolPaths, setRecentToolPaths] = useState<string[]>([]);

	const trackToolOpen = useCallback((path: string) => {
		setRecentToolPaths((currentPaths) => [path, ...currentPaths.filter((currentPath) => currentPath !== path)].slice(0, 8));
	}, []);

	return <AppContext.Provider value={{ recentToolPaths, trackToolOpen }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error("useAppContext must be used inside AppContextProvider");
	}

	return context;
};
