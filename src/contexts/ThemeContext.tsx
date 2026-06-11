import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type IThemeMode = "light" | "dark";

interface IThemeContextValue {
	mode: IThemeMode;
	setMode: (mode: IThemeMode) => void;
	toggleMode: () => void;
}

const storageKey = "toolhub-theme-mode";
const ThemeContext = createContext<IThemeContextValue | null>(null);

const getInitialTheme = (): IThemeMode => {
	if (typeof window === "undefined") {
		return "light";
	}

	const storedTheme = window.localStorage.getItem(storageKey);

	if (storedTheme === "light" || storedTheme === "dark") {
		return storedTheme;
	}

	return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setModeState] = useState<IThemeMode>(getInitialTheme);

	const persistMode = (nextMode: IThemeMode) => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(storageKey, nextMode);
		}
	};

	const setMode = useCallback((nextMode: IThemeMode) => {
		persistMode(nextMode);
		setModeState(nextMode);
	}, []);

	const toggleMode = useCallback(() => {
		setModeState((currentMode) => {
			const nextMode = currentMode === "light" ? "dark" : "light";
			persistMode(nextMode);
			return nextMode;
		});
	}, []);

	return <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useThemeMode must be used inside ThemeContextProvider");
	}

	return context;
};
