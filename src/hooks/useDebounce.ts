import { useEffect, useState } from "react";

export const useDebounce = <Value>(value: Value, delay = 250) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);

		return () => window.clearTimeout(timeoutId);
	}, [value, delay]);

	return debouncedValue;
};
