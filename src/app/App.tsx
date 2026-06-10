import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { AppProviders } from "./providers";
import { AppRoutes } from "./routes";

const routerBasename = import.meta.env.BASE_URL === "./" ? undefined : import.meta.env.BASE_URL;

const AppContent = () => (
	<AppProviders>
		<AppRoutes />
	</AppProviders>
);

const App = () => {
	if (window.location.protocol === "file:") {
		return (
			<MemoryRouter>
				<AppContent />
			</MemoryRouter>
		);
	}

	return (
		<BrowserRouter basename={routerBasename}>
			<AppContent />
		</BrowserRouter>
	);
};

export default App;
