import { createContext, useContext, type ReactNode } from "react";

interface IAppContextValue {}

const AppContext = createContext<IAppContextValue | null>(null);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
	return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error("useAppContext must be used inside AppContextProvider");
	}

	return context;
};
