import { BulbOutlined, MenuOutlined, MoonOutlined, SearchOutlined, ToolOutlined } from "@ant-design/icons";
import { AutoComplete, Breadcrumb, Button, Drawer, Grid, Input, Layout, Space, Switch, Typography, theme } from "antd";
import { useDeferredValue, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "../contexts/ThemeContext";
import { getCategoryById, getToolByRoute, searchTools } from "../tools";
import { Sidebar } from "./Sidebar";

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

export const MainLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const screens = useBreakpoint();
	const { token } = theme.useToken();
	const { mode, toggleMode } = useThemeMode();
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const deferredSearchValue = useDeferredValue(searchValue);
	const isDesktop = Boolean(screens.lg);

	useEffect(() => {
		setMenuOpen(false);
	}, [location.pathname]);

	const searchOptions = searchTools(deferredSearchValue)
		.slice(0, 10)
		.map((tool) => ({
			value: tool.path,
			label: (
				<div>
					<Typography.Text strong>{tool.title}</Typography.Text>
					<br />
					<Typography.Text type="secondary">{tool.categoryLabel}</Typography.Text>
				</div>
			),
		}));

	const openFirstSearchResult = (value: string) => {
		const firstMatch = searchTools(value)[0];

		if (firstMatch) {
			navigate(firstMatch.path);
			setSearchValue("");
		}
	};

	const [, toolsSegment, routeCategory, routeToolSlug] = location.pathname.split("/");
	const category = toolsSegment === "tools" ? getCategoryById(routeCategory) : undefined;
	const tool = toolsSegment === "tools" ? getToolByRoute(routeCategory, routeToolSlug) : undefined;
	const breadcrumbItems = [
		{ title: <Link to="/">Home</Link> },
		...(category ? [{ title: tool ? <Link to={category.path}>{category.title}</Link> : category.title }] : []),
		...(tool ? [{ title: tool.title }] : []),
	];

	return (
		<Layout style={{ height: "100dvh", minHeight: 0, overflow: "hidden" }}>
			<Header
				style={{
					alignItems: "center",
					background: token.colorBgContainer,
					display: "flex",
					flexWrap: "wrap",
					gap: 12,
					height: "auto",
					lineHeight: 1,
					minHeight: 64,
					paddingBlock: 12,
					paddingInline: screens.md ? 24 : 12,
					flexShrink: 0,
					zIndex: 10,
				}}
			>
				{!isDesktop ? <Button icon={<MenuOutlined />} onClick={() => setMenuOpen(true)} /> : null}
				<Link to="/">
					<Space size="small">
						<ToolOutlined />
						<Typography.Text strong>ToolHub</Typography.Text>
					</Space>
				</Link>
				<div style={{ flex: 1, minWidth: screens.md ? 320 : "100%" }}>
					<AutoComplete
						value={searchValue}
						options={searchOptions}
						onSearch={setSearchValue}
						onSelect={(path) => {
							navigate(path);
							setSearchValue("");
						}}
						style={{ width: "100%" }}
					>
						<Input.Search
							allowClear
							prefix={<SearchOutlined />}
							placeholder="Search text tools"
							onSearch={openFirstSearchResult}
							size={screens.md ? "large" : "middle"}
						/>
					</AutoComplete>
				</div>
				<Switch
					checked={mode === "dark"}
					checkedChildren={<MoonOutlined />}
					unCheckedChildren={<BulbOutlined />}
					onChange={() => toggleMode()}
				/>
			</Header>
			<Layout style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
				{isDesktop ? (
					<Sider width={290} theme={mode} style={{ overflow: "hidden" }}>
						<Sidebar />
					</Sider>
				) : null}
				<Drawer
					title="Tools"
					placement="left"
					open={!isDesktop && menuOpen}
					onClose={() => setMenuOpen(false)}
					size="default"
					styles={{ body: { padding: 0 } }}
				>
					<Sidebar onNavigate={() => setMenuOpen(false)} />
				</Drawer>
				<Content style={{ minHeight: 0, overflowY: "auto", padding: screens.md ? 24 : 12 }}>
					<Breadcrumb items={breadcrumbItems} style={{ marginBottom: screens.md ? 24 : 12 }} />
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
};
