import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/routes";
import { AppContextProvider } from "../src/contexts/AppContext";
import { ThemeProvider } from "../src/theme/ThemeProvider";

const routerBasename = import.meta.env.BASE_URL === "./" ? undefined : import.meta.env.BASE_URL;

const App = () => {
	return (
		<BrowserRouter basename={routerBasename}>
			<ThemeProvider>
				<AppContextProvider>
					<AppRoutes />
				</AppContextProvider>
			</ThemeProvider>
		</BrowserRouter>
	);
};

export default App;
