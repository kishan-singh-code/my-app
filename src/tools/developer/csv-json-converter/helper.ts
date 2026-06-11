export interface IConversionResult {
	ok: boolean;
	output: string;
	error?: string;
}

const parseCsv = (value: string) => {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = "";
	let inQuotes = false;

	for (let index = 0; index < value.length; index += 1) {
		const character = value[index];
		const nextCharacter = value[index + 1];

		if (character === '"' && inQuotes && nextCharacter === '"') {
			cell += '"';
			index += 1;
		} else if (character === '"') {
			inQuotes = !inQuotes;
		} else if (character === "," && !inQuotes) {
			row.push(cell);
			cell = "";
		} else if ((character === "\n" || character === "\r") && !inQuotes) {
			if (character === "\r" && nextCharacter === "\n") {
				index += 1;
			}

			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
		} else {
			cell += character;
		}
	}

	row.push(cell);
	rows.push(row);
	return rows.filter((currentRow) => currentRow.some((currentCell) => currentCell.trim()));
};

const escapeCsvCell = (value: unknown) => {
	const text = value === null || value === undefined ? "" : String(value);
	return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const csvToJson = (value: string): IConversionResult => {
	try {
		const rows = parseCsv(value);

		if (!rows.length) {
			return { ok: true, output: "[]" };
		}

		const [headers, ...dataRows] = rows;
		const safeHeaders = headers.map((header, index) => header.trim() || `column_${index + 1}`);
		const records = dataRows.map((row) => Object.fromEntries(safeHeaders.map((header, index) => [header, row[index] ?? ""])));
		return { ok: true, output: JSON.stringify(records, null, 2) };
	} catch (error) {
		return { ok: false, output: "", error: error instanceof Error ? error.message : "Unable to parse CSV" };
	}
};

export const jsonToCsv = (value: string): IConversionResult => {
	try {
		const parsedValue = JSON.parse(value) as unknown;
		const records = Array.isArray(parsedValue) ? parsedValue : [parsedValue];

		if (!records.every((record) => record && typeof record === "object" && !Array.isArray(record))) {
			return { ok: false, output: "", error: "JSON must be an object or an array of objects" };
		}

		const objectRecords = records as Record<string, unknown>[];
		const headers = Array.from(new Set(objectRecords.flatMap((record) => Object.keys(record))));
		const csvRows = [
			headers.map(escapeCsvCell).join(","),
			...objectRecords.map((record) => headers.map((header) => escapeCsvCell(record[header])).join(",")),
		];
		return { ok: true, output: csvRows.join("\n") };
	} catch (error) {
		return { ok: false, output: "", error: error instanceof Error ? error.message : "Unable to parse JSON" };
	}
};
