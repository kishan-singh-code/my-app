import { Menu } from "antd";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "../../contexts/ThemeContext";
import { toolCategories, tools } from "../../tools";

interface SidebarProps {
	onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { mode } = useThemeMode();

	const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
		navigate(String(key));
		onNavigate?.();
	};

	const menuItems: MenuProps["items"] = toolCategories.map((category) => {
		const categoryTools = tools.filter((tool) => tool.category === category.id);

		return {
			key: category.path,
			label: category.title,
			children: categoryTools.length
				? categoryTools.map((tool) => ({
						key: tool.path,
						label: tool.title,
					}))
				: undefined,
		};
	});

	return (
		<Menu
			mode="inline"
			theme={mode}
			style={{ height: "100%", overflowX: "hidden", overflowY: "auto" }}
			selectedKeys={[location.pathname]}
			defaultOpenKeys={toolCategories.map((category) => category.path)}
			items={menuItems}
			onClick={handleMenuClick}
		/>
	);
};
