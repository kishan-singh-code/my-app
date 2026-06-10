import { Button, Result } from "antd";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
	return (
		<Result
			status="404"
			title="Page not found"
			extra={
				<Button type="primary">
					<Link to="/">Open tools</Link>
				</Button>
			}
		/>
	);
};
