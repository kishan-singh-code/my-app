export interface ICronPreset {
	label: string;
	value: string;
	description: string;
}

export const cronPresets: ICronPreset[] = [
	{ label: "Every minute", value: "* * * * *", description: "Runs once every minute" },
	{ label: "Every 5 minutes", value: "*/5 * * * *", description: "Runs every five minutes" },
	{ label: "Hourly", value: "0 * * * *", description: "Runs at the start of every hour" },
	{ label: "Daily at midnight", value: "0 0 * * *", description: "Runs every day at 00:00" },
	{ label: "Weekdays at 9 AM", value: "0 9 * * 1-5", description: "Runs Monday through Friday at 09:00" },
	{ label: "Weekly", value: "0 0 * * 0", description: "Runs every Sunday at midnight" },
	{ label: "Monthly", value: "0 0 1 * *", description: "Runs on the first day of each month" },
	{ label: "Yearly", value: "0 0 1 1 *", description: "Runs once per year on January 1" },
];

export const getCronDescription = (expression: string) =>
	cronPresets.find((preset) => preset.value === expression)?.description ?? "Custom cron expression";
