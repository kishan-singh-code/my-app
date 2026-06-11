import { Menu } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toolCategories, tools } from "../tools";

interface ISidebarProps {
	onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: ISidebarProps) => {
	const location = useLocation();
	const navigate = useNavigate();
	const [, toolsSegment, routeCategory] = location.pathname.split("/");
	const activeCategoryPath = toolsSegment === "tools" && routeCategory ? `/tools/${routeCategory}` : undefined;
	const [openKeys, setOpenKeys] = useState<string[]>(activeCategoryPath ? [activeCategoryPath] : []);

	useEffect(() => {
		setOpenKeys(activeCategoryPath ? [activeCategoryPath] : []);
	}, [activeCategoryPath]);

	const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
		navigate(String(key));
		onNavigate?.();
	};

	const handleOpenChange: MenuProps["onOpenChange"] = (keys) => {
		const openedKey = keys.find((key) => !openKeys.includes(key));

		setOpenKeys([...keys]);

		if (openedKey) {
			navigate(openedKey);
			onNavigate?.();
		}
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
			style={{ height: "100%", overflowX: "hidden", overflowY: "auto" }}
			selectedKeys={[location.pathname]}
			openKeys={openKeys}
			onOpenChange={handleOpenChange}
			items={menuItems}
			onClick={handleMenuClick}
		/>
	);
};
