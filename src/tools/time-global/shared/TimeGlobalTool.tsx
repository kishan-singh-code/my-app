import { Button, Card, Checkbox, Col, DatePicker, Input, InputNumber, Row, Select, Space, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ToolContainer } from "../../../components/shared/ToolContainer";

export type ITimeGlobalToolId =
	| "timezone-converter"
	| "world-clock"
	| "meeting-planner"
	| "date-difference-calculator"
	| "business-days-calculator"
	| "leap-year-checker";

type IMetricTone = "default" | "success" | "warning" | "danger";

interface ITimeZoneRow {
	key: string;
	zone: string;
	date: string;
	time: string;
	offset: string;
}

interface IMeetingRow {
	key: string;
	zone: string;
	date: string;
	start: string;
	end: string;
	offset: string;
	workHours: "Good" | "Outside";
}

interface IBusinessDayRow {
	key: string;
	label: string;
	value: string | number;
}

const dateFormat = "YYYY-MM-DD";
const dateTimeFormat = "YYYY-MM-DDTHH:mm";
const msPerMinute = 60 * 1000;
const msPerDay = 24 * 60 * 60 * 1000;
const currentYear = new Date().getFullYear();

const timeZoneOptions = [
	{ label: "UTC", value: "UTC" },
	{ label: "India - Kolkata", value: "Asia/Kolkata" },
	{ label: "United Arab Emirates - Dubai", value: "Asia/Dubai" },
	{ label: "Singapore", value: "Asia/Singapore" },
	{ label: "Japan - Tokyo", value: "Asia/Tokyo" },
	{ label: "China - Shanghai", value: "Asia/Shanghai" },
	{ label: "Australia - Sydney", value: "Australia/Sydney" },
	{ label: "United Kingdom - London", value: "Europe/London" },
	{ label: "Germany - Berlin", value: "Europe/Berlin" },
	{ label: "France - Paris", value: "Europe/Paris" },
	{ label: "United States - New York", value: "America/New_York" },
	{ label: "United States - Chicago", value: "America/Chicago" },
	{ label: "United States - Denver", value: "America/Denver" },
	{ label: "United States - Los Angeles", value: "America/Los_Angeles" },
	{ label: "Canada - Toronto", value: "America/Toronto" },
	{ label: "Brazil - Sao Paulo", value: "America/Sao_Paulo" },
	{ label: "South Africa - Johannesburg", value: "Africa/Johannesburg" },
];

const defaultClockTimeZones = ["UTC", "Asia/Kolkata", "Europe/London", "America/New_York", "Asia/Tokyo"];
const defaultMeetingTimeZones = ["Asia/Kolkata", "Europe/London", "America/New_York"];

const getMetricColor = (tone: IMetricTone = "default") => {
	if (tone === "success") {
		return "#15803d";
	}

	if (tone === "warning") {
		return "#b45309";
	}

	if (tone === "danger") {
		return "#b91c1c";
	}

	return undefined;
};

const formatPlainDate = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const formatLocalDateTimeInput = (date: Date) => {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${formatPlainDate(date)}T${hours}:${minutes}`;
};

const addDays = (date: Date, days: number) => {
	const nextDate = new Date(date);
	nextDate.setDate(nextDate.getDate() + days);
	return nextDate;
};

const parsePlainDate = (value: string) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

	if (!match) {
		return new Date(currentYear, 0, 1, 12);
	}

	return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
};

const parseDateTimeParts = (value: string) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

	if (!match) {
		return null;
	}

	return {
		year: Number(match[1]),
		month: Number(match[2]),
		day: Number(match[3]),
		hour: Number(match[4]),
		minute: Number(match[5]),
	};
};

const getTimeZoneLabel = (timeZone: string) => timeZoneOptions.find((option) => option.value === timeZone)?.label ?? timeZone;

const getTimeZoneParts = (date: Date, timeZone: string) => {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour12: false,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	})
		.formatToParts(date)
		.reduce<Record<string, string>>((values, part) => {
			if (part.type !== "literal") {
				values[part.type] = part.value;
			}

			return values;
		}, {});

	return {
		year: Number(parts.year),
		month: Number(parts.month),
		day: Number(parts.day),
		hour: parts.hour === "24" ? 0 : Number(parts.hour),
		minute: Number(parts.minute),
		second: Number(parts.second),
	};
};

const getTimeZoneOffsetMs = (timeZone: string, date: Date) => {
	const parts = getTimeZoneParts(date, timeZone);
	const zonedTimeAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);

	return zonedTimeAsUtc - date.getTime();
};

const getOffsetLabel = (timeZone: string, date: Date) => {
	const totalMinutes = Math.round(getTimeZoneOffsetMs(timeZone, date) / msPerMinute);
	const sign = totalMinutes >= 0 ? "+" : "-";
	const absoluteMinutes = Math.abs(totalMinutes);
	const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
	const minutes = String(absoluteMinutes % 60).padStart(2, "0");

	return `UTC${sign}${hours}:${minutes}`;
};

const dateTimeInZoneToDate = (value: string, timeZone: string) => {
	const parts = parseDateTimeParts(value);

	if (!parts) {
		return new Date();
	}

	const utcGuess = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute));
	const firstOffset = getTimeZoneOffsetMs(timeZone, utcGuess);
	const firstPass = new Date(utcGuess.getTime() - firstOffset);
	const secondOffset = getTimeZoneOffsetMs(timeZone, firstPass);

	return new Date(utcGuess.getTime() - secondOffset);
};

const formatDateInZone = (date: Date, timeZone: string) =>
	new Intl.DateTimeFormat("en-US", {
		timeZone,
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "2-digit",
	}).format(date);

const formatTimeInZone = (date: Date, timeZone: string, includeSeconds = false) =>
	new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
		second: includeSeconds ? "2-digit" : undefined,
		hour12: false,
	}).format(date);

const formatDateTimeInZone = (date: Date, timeZone: string) => `${formatDateInZone(date, timeZone)}, ${formatTimeInZone(date, timeZone)}`;

const formatSignedDuration = (minutes: number) => {
	const sign = minutes >= 0 ? "+" : "-";
	const absoluteMinutes = Math.abs(minutes);
	const hours = Math.floor(absoluteMinutes / 60);
	const remainder = absoluteMinutes % 60;

	return `${sign}${hours}h ${remainder}m`;
};

const getDaysBetween = (startDate: Date, endDate: Date) => Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);

const getOrderedDates = (firstDate: Date, secondDate: Date) =>
	firstDate.getTime() <= secondDate.getTime() ? [firstDate, secondDate] : [secondDate, firstDate];

const getCalendarDifference = (firstDate: Date, secondDate: Date) => {
	const [startDate, endDate] = getOrderedDates(firstDate, secondDate);
	let years = endDate.getFullYear() - startDate.getFullYear();
	let months = endDate.getMonth() - startDate.getMonth();
	let days = endDate.getDate() - startDate.getDate();

	if (days < 0) {
		months -= 1;
		days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
	}

	if (months < 0) {
		years -= 1;
		months += 12;
	}

	return { years, months, days };
};

const parseHolidaySet = (value: string) =>
	new Set(
		value
			.split(/[\s,;]+/)
			.map((holiday) => holiday.trim())
			.filter((holiday) => /^\d{4}-\d{2}-\d{2}$/.test(holiday)),
	);

const countBusinessDays = (startDate: Date, endDate: Date, includeEndDate: boolean, holidays: Set<string>) => {
	const [firstDate, lastDate] = getOrderedDates(startDate, endDate);
	const effectiveLastDate = includeEndDate ? lastDate : addDays(lastDate, -1);
	let cursorDate = new Date(firstDate);
	let businessDays = 0;
	let weekendDays = 0;
	let holidayDays = 0;

	while (cursorDate.getTime() <= effectiveLastDate.getTime()) {
		const day = cursorDate.getDay();
		const dateKey = formatPlainDate(cursorDate);

		if (day === 0 || day === 6) {
			weekendDays += 1;
		} else if (holidays.has(dateKey)) {
			holidayDays += 1;
		} else {
			businessDays += 1;
		}

		cursorDate = addDays(cursorDate, 1);
	}

	return {
		businessDays,
		weekendDays,
		holidayDays,
		countedDays: Math.max(businessDays + weekendDays + holidayDays, 0),
	};
};

const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const findPreviousLeapYear = (year: number) => {
	let cursorYear = year - 1;

	while (!isLeapYear(cursorYear)) {
		cursorYear -= 1;
	}

	return cursorYear;
};

const findNextLeapYear = (year: number) => {
	let cursorYear = year + 1;

	while (!isLeapYear(cursorYear)) {
		cursorYear += 1;
	}

	return cursorYear;
};

const SingleTimeZoneSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
	<Select showSearch value={value} options={timeZoneOptions} onChange={onChange} optionFilterProp="label" style={{ width: "100%" }} />
);

const MultipleTimeZoneSelect = ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => (
	<Select
		mode="multiple"
		showSearch
		value={value}
		options={timeZoneOptions}
		onChange={onChange}
		optionFilterProp="label"
		style={{ width: "100%" }}
	/>
);

const DateInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
	const parsedValue = dayjs(value);

	return (
		<DatePicker
			value={parsedValue.isValid() ? parsedValue : null}
			onChange={(nextValue) => onChange(nextValue ? nextValue.format(dateFormat) : "")}
			format={dateFormat}
			style={{ width: "100%" }}
		/>
	);
};

const DateTimeInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
	const parsedValue = dayjs(value);

	return (
		<DatePicker
			showTime={{ format: "HH:mm" }}
			value={parsedValue.isValid() ? parsedValue : null}
			onChange={(nextValue) => onChange(nextValue ? nextValue.format(dateTimeFormat) : "")}
			format="YYYY-MM-DD HH:mm"
			style={{ width: "100%" }}
		/>
	);
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<Space orientation="vertical" size={4} style={{ width: "100%" }}>
		<Typography.Text strong>{label}</Typography.Text>
		{children}
	</Space>
);

const MetricCard = ({ title, value, tone = "default" }: { title: string; value: string | number; tone?: IMetricTone }) => (
	<Card>
		<Statistic title={title} value={value} styles={{ content: { color: getMetricColor(tone), fontSize: 22 } }} />
	</Card>
);

const timezoneColumns: ColumnsType<ITimeZoneRow> = [
	{ title: "Timezone", dataIndex: "zone", key: "zone" },
	{ title: "Date", dataIndex: "date", key: "date" },
	{ title: "Time", dataIndex: "time", key: "time" },
	{ title: "Offset", dataIndex: "offset", key: "offset" },
];

const meetingColumns: ColumnsType<IMeetingRow> = [
	{ title: "Timezone", dataIndex: "zone", key: "zone" },
	{ title: "Date", dataIndex: "date", key: "date" },
	{ title: "Starts", dataIndex: "start", key: "start" },
	{ title: "Ends", dataIndex: "end", key: "end" },
	{ title: "Offset", dataIndex: "offset", key: "offset" },
	{
		title: "Work Hours",
		dataIndex: "workHours",
		key: "workHours",
		render: (value: IMeetingRow["workHours"]) => <Tag color={value === "Good" ? "green" : "orange"}>{value}</Tag>,
	},
];

const businessDayColumns: ColumnsType<IBusinessDayRow> = [
	{ title: "Breakdown", dataIndex: "label", key: "label" },
	{ title: "Days", dataIndex: "value", key: "value" },
];

const TimezoneConverter = () => {
	const [dateTime, setDateTime] = useState(formatLocalDateTimeInput(new Date()));
	const [fromTimeZone, setFromTimeZone] = useState("Asia/Kolkata");
	const [toTimeZone, setToTimeZone] = useState("UTC");
	const convertedDate = dateTimeInZoneToDate(dateTime, fromTimeZone);
	const offsetDifference = Math.round(
		(getTimeZoneOffsetMs(toTimeZone, convertedDate) - getTimeZoneOffsetMs(fromTimeZone, convertedDate)) / msPerMinute,
	);
	const rows: ITimeZoneRow[] = [
		{
			key: "source",
			zone: getTimeZoneLabel(fromTimeZone),
			date: formatDateInZone(convertedDate, fromTimeZone),
			time: formatTimeInZone(convertedDate, fromTimeZone),
			offset: getOffsetLabel(fromTimeZone, convertedDate),
		},
		{
			key: "target",
			zone: getTimeZoneLabel(toTimeZone),
			date: formatDateInZone(convertedDate, toTimeZone),
			time: formatTimeInZone(convertedDate, toTimeZone),
			offset: getOffsetLabel(toTimeZone, convertedDate),
		},
	];

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9} xl={8}>
						<Card
							title="Inputs"
							extra={
								<Button size="small" onClick={() => setDateTime(formatLocalDateTimeInput(new Date()))}>
									Now
								</Button>
							}
						>
							<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
								<Field label="Date and Time">
									<DateTimeInput value={dateTime} onChange={setDateTime} />
								</Field>
								<Field label="From Timezone">
									<SingleTimeZoneSelect value={fromTimeZone} onChange={setFromTimeZone} />
								</Field>
								<Field label="To Timezone">
									<SingleTimeZoneSelect value={toTimeZone} onChange={setToTimeZone} />
								</Field>
							</Space>
						</Card>
					</Col>
					<Col xs={24} lg={15} xl={16}>
						<Space orientation="vertical" size="large" style={{ width: "100%" }}>
							<Row gutter={[16, 16]}>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Converted Time" value={formatTimeInZone(convertedDate, toTimeZone)} tone="success" />
								</Col>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Target Date" value={formatDateInZone(convertedDate, toTimeZone)} />
								</Col>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Offset Difference" value={formatSignedDuration(offsetDifference)} />
								</Col>
							</Row>
							<Card title="Conversion Details">
								<Table columns={timezoneColumns} dataSource={rows} pagination={false} scroll={{ x: true }} />
							</Card>
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};

const WorldClock = () => {
	const [selectedTimeZones, setSelectedTimeZones] = useState(defaultClockTimeZones);
	const [currentDate, setCurrentDate] = useState(new Date());

	useEffect(() => {
		const intervalId = window.setInterval(() => setCurrentDate(new Date()), 1000);

		return () => window.clearInterval(intervalId);
	}, []);

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Card title="World Clock">
					<Field label="Timezones">
						<MultipleTimeZoneSelect value={selectedTimeZones} onChange={setSelectedTimeZones} />
					</Field>
				</Card>
				<Row gutter={[16, 16]}>
					{selectedTimeZones.map((timeZone) => (
						<Col xs={24} sm={12} xl={8} key={timeZone}>
							<Card title={getTimeZoneLabel(timeZone)}>
								<Space orientation="vertical" size="small" style={{ width: "100%" }}>
									<Statistic value={formatTimeInZone(currentDate, timeZone, true)} styles={{ content: { fontSize: 28 } }} />
									<Typography.Text type="secondary">{formatDateInZone(currentDate, timeZone)}</Typography.Text>
									<Tag>{getOffsetLabel(timeZone, currentDate)}</Tag>
								</Space>
							</Card>
						</Col>
					))}
				</Row>
			</Space>
		</ToolContainer>
	);
};

const MeetingPlanner = () => {
	const [meetingDate, setMeetingDate] = useState(formatPlainDate(addDays(new Date(), 1)));
	const [startTime, setStartTime] = useState("10:00");
	const [durationMinutes, setDurationMinutes] = useState(60);
	const [organizerTimeZone, setOrganizerTimeZone] = useState("Asia/Kolkata");
	const [participantTimeZones, setParticipantTimeZones] = useState(defaultMeetingTimeZones);
	const startDate = dateTimeInZoneToDate(`${meetingDate}T${startTime}`, organizerTimeZone);
	const endDate = new Date(startDate.getTime() + durationMinutes * msPerMinute);
	const rows: IMeetingRow[] = participantTimeZones.map((timeZone) => {
		const startParts = getTimeZoneParts(startDate, timeZone);
		const endParts = getTimeZoneParts(endDate, timeZone);
		const startsAt = startParts.hour * 60 + startParts.minute;
		const endsAt = endParts.hour * 60 + endParts.minute;
		const sameLocalDate = startParts.year === endParts.year && startParts.month === endParts.month && startParts.day === endParts.day;
		const workHours = sameLocalDate && startsAt >= 8 * 60 && endsAt <= 18 * 60 ? "Good" : "Outside";

		return {
			key: timeZone,
			zone: getTimeZoneLabel(timeZone),
			date: formatDateInZone(startDate, timeZone),
			start: formatTimeInZone(startDate, timeZone),
			end: formatTimeInZone(endDate, timeZone),
			offset: getOffsetLabel(timeZone, startDate),
			workHours,
		};
	});
	const goodWindows = rows.filter((row) => row.workHours === "Good").length;

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9} xl={8}>
						<Card title="Meeting Details">
							<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
								<Field label="Date">
									<DateInput value={meetingDate} onChange={setMeetingDate} />
								</Field>
								<Field label="Start Time">
									<Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
								</Field>
								<Field label="Duration">
									<Space.Compact style={{ width: "100%" }}>
										<InputNumber
											value={durationMinutes}
											onChange={(nextValue) => setDurationMinutes(Math.max(Number(nextValue) || 0, 15))}
											min={15}
											step={15}
											style={{ width: "100%" }}
										/>
										<Button disabled>min</Button>
									</Space.Compact>
								</Field>
								<Field label="Organizer Timezone">
									<SingleTimeZoneSelect value={organizerTimeZone} onChange={setOrganizerTimeZone} />
								</Field>
								<Field label="Participant Timezones">
									<MultipleTimeZoneSelect value={participantTimeZones} onChange={setParticipantTimeZones} />
								</Field>
							</Space>
						</Card>
					</Col>
					<Col xs={24} lg={15} xl={16}>
						<Space orientation="vertical" size="large" style={{ width: "100%" }}>
							<Row gutter={[16, 16]}>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Organizer Start" value={formatDateTimeInZone(startDate, organizerTimeZone)} tone="success" />
								</Col>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Duration" value={`${durationMinutes} min`} />
								</Col>
								<Col xs={24} md={12} xl={8}>
									<MetricCard
										title="Good Local Windows"
										value={`${goodWindows}/${rows.length}`}
										tone={goodWindows === rows.length ? "success" : "warning"}
									/>
								</Col>
							</Row>
							<Card title="Timezone Schedule">
								<Table columns={meetingColumns} dataSource={rows} pagination={false} scroll={{ x: true }} />
							</Card>
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};

const DateDifferenceCalculator = () => {
	const [startDateValue, setStartDateValue] = useState(formatPlainDate(new Date()));
	const [endDateValue, setEndDateValue] = useState(formatPlainDate(addDays(new Date(), 30)));
	const startDate = parsePlainDate(startDateValue);
	const endDate = parsePlainDate(endDateValue);
	const calendarDifference = getCalendarDifference(startDate, endDate);
	const totalDays = Math.abs(getDaysBetween(startDate, endDate));
	const weeks = Math.floor(totalDays / 7);
	const remainingDays = totalDays % 7;

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Card title="Date Range">
					<Row gutter={[16, 16]}>
						<Col xs={24} md={12}>
							<Field label="Start Date">
								<DateInput value={startDateValue} onChange={setStartDateValue} />
							</Field>
						</Col>
						<Col xs={24} md={12}>
							<Field label="End Date">
								<DateInput value={endDateValue} onChange={setEndDateValue} />
							</Field>
						</Col>
					</Row>
				</Card>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={12} xl={6}>
						<MetricCard
							title="Calendar Difference"
							value={`${calendarDifference.years}y ${calendarDifference.months}m ${calendarDifference.days}d`}
							tone="success"
						/>
					</Col>
					<Col xs={24} md={12} xl={6}>
						<MetricCard title="Total Days" value={totalDays} />
					</Col>
					<Col xs={24} md={12} xl={6}>
						<MetricCard title="Weeks and Days" value={`${weeks}w ${remainingDays}d`} />
					</Col>
					<Col xs={24} md={12} xl={6}>
						<MetricCard title="Inclusive Days" value={totalDays + 1} />
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};

const BusinessDaysCalculator = () => {
	const [startDateValue, setStartDateValue] = useState(formatPlainDate(new Date()));
	const [endDateValue, setEndDateValue] = useState(formatPlainDate(addDays(new Date(), 14)));
	const [includeEndDate, setIncludeEndDate] = useState(true);
	const [holidayText, setHolidayText] = useState("");
	const holidays = parseHolidaySet(holidayText);
	const startDate = parsePlainDate(startDateValue);
	const endDate = parsePlainDate(endDateValue);
	const result = countBusinessDays(startDate, endDate, includeEndDate, holidays);
	const rows: IBusinessDayRow[] = [
		{ key: "business", label: "Business days", value: result.businessDays },
		{ key: "weekends", label: "Weekend days", value: result.weekendDays },
		{ key: "holidays", label: "Weekday holidays skipped", value: result.holidayDays },
		{ key: "counted", label: "Calendar days counted", value: result.countedDays },
	];

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9} xl={8}>
						<Card title="Inputs">
							<Space orientation="vertical" size="middle" style={{ width: "100%" }}>
								<Field label="Start Date">
									<DateInput value={startDateValue} onChange={setStartDateValue} />
								</Field>
								<Field label="End Date">
									<DateInput value={endDateValue} onChange={setEndDateValue} />
								</Field>
								<Checkbox checked={includeEndDate} onChange={(event) => setIncludeEndDate(event.target.checked)}>
									Include end date
								</Checkbox>
								<Field label="Holidays">
									<Input.TextArea
										value={holidayText}
										onChange={(event) => setHolidayText(event.target.value)}
										rows={4}
										placeholder="2026-01-01, 2026-12-25"
									/>
								</Field>
							</Space>
						</Card>
					</Col>
					<Col xs={24} lg={15} xl={16}>
						<Space orientation="vertical" size="large" style={{ width: "100%" }}>
							<Row gutter={[16, 16]}>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Business Days" value={result.businessDays} tone="success" />
								</Col>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Weekend Days" value={result.weekendDays} />
								</Col>
								<Col xs={24} md={12} xl={8}>
									<MetricCard title="Holidays Skipped" value={result.holidayDays} tone={result.holidayDays ? "warning" : "default"} />
								</Col>
							</Row>
							<Card title="Breakdown">
								<Table columns={businessDayColumns} dataSource={rows} pagination={false} scroll={{ x: true }} />
							</Card>
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};

const LeapYearChecker = () => {
	const [year, setYear] = useState(currentYear);
	const normalizedYear = Math.max(1, Math.trunc(year || currentYear));
	const leapYear = isLeapYear(normalizedYear);

	return (
		<ToolContainer>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={9} xl={8}>
						<Card title="Year">
							<InputNumber
								value={year}
								onChange={(nextValue) => setYear(Math.max(1, Math.trunc(Number(nextValue) || currentYear)))}
								min={1}
								max={9999}
								step={1}
								style={{ width: "100%" }}
							/>
						</Card>
					</Col>
					<Col xs={24} lg={15} xl={16}>
						<Space orientation="vertical" size="large" style={{ width: "100%" }}>
							<Row gutter={[16, 16]}>
								<Col xs={24} md={12} xl={6}>
									<MetricCard title="Leap Year" value={leapYear ? "Yes" : "No"} tone={leapYear ? "success" : "warning"} />
								</Col>
								<Col xs={24} md={12} xl={6}>
									<MetricCard title="Days in Year" value={leapYear ? 366 : 365} />
								</Col>
								<Col xs={24} md={12} xl={6}>
									<MetricCard title="Previous Leap" value={findPreviousLeapYear(normalizedYear)} />
								</Col>
								<Col xs={24} md={12} xl={6}>
									<MetricCard title="Next Leap" value={findNextLeapYear(normalizedYear)} />
								</Col>
							</Row>
							<Card title="Rule Check">
								<Space wrap>
									<Tag color={normalizedYear % 4 === 0 ? "green" : "default"}>Divisible by 4</Tag>
									<Tag color={normalizedYear % 100 === 0 ? "orange" : "default"}>Century year</Tag>
									<Tag color={normalizedYear % 400 === 0 ? "green" : "default"}>Divisible by 400</Tag>
								</Space>
							</Card>
						</Space>
					</Col>
				</Row>
			</Space>
		</ToolContainer>
	);
};

export const TimeGlobalTool = ({ toolId }: { toolId: ITimeGlobalToolId }) => {
	if (toolId === "timezone-converter") {
		return <TimezoneConverter />;
	}

	if (toolId === "world-clock") {
		return <WorldClock />;
	}

	if (toolId === "meeting-planner") {
		return <MeetingPlanner />;
	}

	if (toolId === "date-difference-calculator") {
		return <DateDifferenceCalculator />;
	}

	if (toolId === "business-days-calculator") {
		return <BusinessDaysCalculator />;
	}

	return <LeapYearChecker />;
};
