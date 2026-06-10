import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { CategoryPage } from "../pages/Category";
import { HomePage } from "../pages/Home";
import { NotFoundPage } from "../pages/NotFound";
import { ToolPage } from "../pages/ToolPage";

export const AppRoutes = () => {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route index element={<HomePage />} />
				<Route path="tools" element={<Navigate to="/" replace />} />
				<Route path="tools/:category" element={<CategoryPage />} />
				<Route path="tools/:category/:toolSlug" element={<ToolPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
};
