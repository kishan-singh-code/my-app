import axios from "axios";
import type { AxiosRequestConfig } from "axios";

export type IApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type IApiBodyType = "json" | "form" | "xml";
export type IApiAuthType = "none" | "bearer" | "basic" | "custom";

export interface IKeyValueRow {
	id: string;
	key: string;
	value: string;
	enabled: boolean;
}

export interface IApiAuthDraft {
	type: IApiAuthType;
	bearerToken: string;
	basicUsername: string;
	basicPassword: string;
	customValue: string;
}

export interface IApiRequestDraft {
	requestInput: string;
	method: IApiMethod;
	queryParams: IKeyValueRow[];
	headers: IKeyValueRow[];
	bodyType: IApiBodyType;
	bodyText: string;
	auth: IApiAuthDraft;
	timeoutMs: number;
}

export interface IParsedApiRequest {
	method: IApiMethod;
	baseUrl: string;
	url: string;
	queryParams: IKeyValueRow[];
	headers: Record<string, string>;
	headerRows: IKeyValueRow[];
	body: string;
	bodyType: IApiBodyType;
	auth: IApiAuthDraft;
	timeoutMs: number;
	importedFromCurl: boolean;
	warnings: string[];
}

export interface IApiResponseDetails {
	status: number;
	statusText: string;
	durationMs: number;
	sizeBytes: number;
	contentType: string;
	headers: Record<string, string>;
	bodyText: string;
	rawBodyText: string;
	receivedAt: string;
}

export type IApiRequestExecutionResult =
	| {
			ok: true;
			request: IParsedApiRequest;
			response: IApiResponseDetails;
			warnings: string[];
	  }
	| {
			ok: false;
			request?: IParsedApiRequest;
			error: string;
			details?: string;
			durationMs?: number;
			warnings: string[];
	  };

type ParseRequestResult = { ok: true; request: IParsedApiRequest } | { ok: false; error: string; warnings: string[] };

export const apiMethods: IApiMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
export const apiBodyTypes: IApiBodyType[] = ["json", "form", "xml"];
export const apiAuthTypes: IApiAuthType[] = ["none", "bearer", "basic", "custom"];

const bodyContentTypes: Record<IApiBodyType, string> = {
	json: "application/json",
	form: "application/x-www-form-urlencoded",
	xml: "application/xml",
};

const curlDataFlags = new Set(["-d", "--data", "--data-ascii", "--data-binary", "--data-raw", "--data-urlencode"]);
const ignoredCurlFlags = new Set(["-i", "--include", "-k", "--insecure", "-L", "--location", "-s", "--silent", "--compressed"]);
const ignoredCurlFlagsWithValue = new Set(["--connect-timeout", "--max-time", "--proxy", "-o", "--output"]);
const forbiddenHeaderNames = new Set([
	"accept-charset",
	"accept-encoding",
	"access-control-request-headers",
	"access-control-request-method",
	"connection",
	"content-length",
	"cookie",
	"cookie2",
	"date",
	"dnt",
	"expect",
	"host",
	"keep-alive",
	"origin",
	"referer",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
	"user-agent",
	"via",
]);

const canSendBody = (method: IApiMethod) => method !== "GET" && method !== "HEAD";

export const createKeyValueRow = (key = "", value = "", enabled = true): IKeyValueRow => ({
	id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
	key,
	value,
	enabled,
});

export const createEmptyAuthDraft = (): IApiAuthDraft => ({
	type: "none",
	bearerToken: "",
	basicUsername: "",
	basicPassword: "",
	customValue: "",
});

export const formatDuration = (durationMs: number) => {
	if (!Number.isFinite(durationMs)) {
		return "0 ms";
	}

	if (durationMs < 1000) {
		return `${Math.round(durationMs)} ms`;
	}

	return `${(durationMs / 1000).toFixed(2)} s`;
};

export const formatBytes = (bytes: number) => {
	if (!Number.isFinite(bytes) || bytes <= 0) {
		return "0 B";
	}

	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getStatusColor = (status: number) => {
	if (status >= 200 && status < 300) {
		return "green";
	}

	if (status >= 300 && status < 400) {
		return "blue";
	}

	if (status >= 400 && status < 500) {
		return "orange";
	}

	if (status >= 500) {
		return "red";
	}

	return "default";
};

const isSupportedMethod = (method: string): method is IApiMethod => apiMethods.includes(method as IApiMethod);

const normalizeMethod = (value: string): IApiMethod => {
	const method = value.trim().toUpperCase();

	if (!isSupportedMethod(method)) {
		throw new Error(`Unsupported HTTP method: ${value}`);
	}

	return method;
};

const normalizeUrl = (value: string) => {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		throw new Error("Enter a request URL or cURL command.");
	}

	const urlWithProtocol = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
	const url = new URL(urlWithProtocol);

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error("Only HTTP and HTTPS URLs are supported.");
	}

	return url.toString();
};

const splitUrlAndQueryParams = (value: string) => {
	const url = new URL(normalizeUrl(value));
	const queryParams = Array.from(url.searchParams.entries()).map(([key, paramValue]) => createKeyValueRow(key, paramValue));
	url.search = "";

	return { baseUrl: url.toString(), queryParams };
};

const getEnabledRows = (rows: IKeyValueRow[]) => rows.filter((row) => row.enabled && row.key.trim());

const keyValueRowsToRecord = (rows: IKeyValueRow[]) => {
	const record: Record<string, string> = {};

	getEnabledRows(rows).forEach((row) => {
		record[row.key.trim()] = row.value;
	});

	return record;
};

const recordToRows = (record: Record<string, string>) => Object.entries(record).map(([key, value]) => createKeyValueRow(key, value));

const buildUrlWithQueryParams = (baseUrl: string, rows: IKeyValueRow[]) => {
	const url = new URL(normalizeUrl(baseUrl));

	getEnabledRows(rows).forEach((row) => {
		url.searchParams.append(row.key.trim(), row.value);
	});

	return url.toString();
};

const tokenizeCurlCommand = (value: string) => {
	const tokens: string[] = [];
	const command = value.replace(/\\\r?\n/g, " ");
	let currentToken = "";
	let quote: "'" | '"' | null = null;
	let isEscaped = false;

	for (const character of command) {
		if (isEscaped) {
			currentToken += character;
			isEscaped = false;
			continue;
		}

		if (character === "\\" && quote !== "'") {
			isEscaped = true;
			continue;
		}

		if (quote) {
			if (character === quote) {
				quote = null;
			} else {
				currentToken += character;
			}

			continue;
		}

		if (character === "'" || character === '"') {
			quote = character;
			continue;
		}

		if (/\s/.test(character)) {
			if (currentToken) {
				tokens.push(currentToken);
				currentToken = "";
			}

			continue;
		}

		currentToken += character;
	}

	if (isEscaped) {
		currentToken += "\\";
	}

	if (currentToken) {
		tokens.push(currentToken);
	}

	return tokens;
};

const parseHeaderValue = (value: string) => {
	const separatorIndex = value.indexOf(":");

	if (separatorIndex === -1) {
		throw new Error(`Invalid header: ${value}`);
	}

	const name = value.slice(0, separatorIndex).trim();
	const headerValue = value.slice(separatorIndex + 1).trim();

	if (!name) {
		throw new Error(`Invalid header: ${value}`);
	}

	return { name, value: headerValue };
};

const sanitizeHeaders = (headers: Record<string, string>) => {
	const warnings: string[] = [];
	const sanitizedHeaders: Record<string, string> = {};

	Object.entries(headers).forEach(([name, value]) => {
		const normalizedName = name.trim();
		const lowerName = normalizedName.toLowerCase();

		if (!normalizedName) {
			return;
		}

		if (forbiddenHeaderNames.has(lowerName) || lowerName.startsWith("proxy-") || lowerName.startsWith("sec-")) {
			warnings.push(`${normalizedName} cannot be set by browser requests and was skipped.`);
			return;
		}

		sanitizedHeaders[normalizedName] = value;
	});

	return { headers: sanitizedHeaders, warnings };
};

const getHeaderValue = (headers: Record<string, string>, name: string) => {
	const lowerName = name.toLowerCase();
	return Object.entries(headers).find(([headerName]) => headerName.toLowerCase() === lowerName)?.[1] ?? "";
};

const removeHeader = (headers: Record<string, string>, name: string) => {
	const lowerName = name.toLowerCase();
	return Object.fromEntries(Object.entries(headers).filter(([headerName]) => headerName.toLowerCase() !== lowerName));
};

const hasHeader = (headers: Record<string, string>, name: string) => Boolean(getHeaderValue(headers, name));

const isCurlInput = (value: string) => /^curl(?:\s|$)/i.test(value.trim());

const readInlineFlagValue = (token: string, flag: string) => {
	if (token === flag) {
		return null;
	}

	if (token.startsWith(`${flag}=`)) {
		return token.slice(flag.length + 1);
	}

	if (flag.length === 2 && token.startsWith(flag)) {
		return token.slice(flag.length);
	}

	return null;
};

const splitBasicCredentials = (value: string) => {
	const separatorIndex = value.indexOf(":");

	if (separatorIndex === -1) {
		return { username: value, password: "" };
	}

	return {
		username: value.slice(0, separatorIndex),
		password: value.slice(separatorIndex + 1),
	};
};

const decodeBasicHeader = (value: string) => {
	try {
		return splitBasicCredentials(atob(value));
	} catch {
		return { username: "", password: "" };
	}
};

const extractAuthFromHeaders = (headers: Record<string, string>) => {
	const authorization = getHeaderValue(headers, "authorization").trim();

	if (!authorization) {
		return { auth: createEmptyAuthDraft(), headers };
	}

	const headersWithoutAuthorization = removeHeader(headers, "authorization");

	if (/^bearer\s+/i.test(authorization)) {
		return {
			auth: { ...createEmptyAuthDraft(), type: "bearer" as const, bearerToken: authorization.replace(/^bearer\s+/i, "") },
			headers: headersWithoutAuthorization,
		};
	}

	if (/^basic\s+/i.test(authorization)) {
		const credentials = decodeBasicHeader(authorization.replace(/^basic\s+/i, ""));

		return {
			auth: {
				...createEmptyAuthDraft(),
				type: "basic" as const,
				basicUsername: credentials.username,
				basicPassword: credentials.password,
			},
			headers: headersWithoutAuthorization,
		};
	}

	return {
		auth: { ...createEmptyAuthDraft(), type: "custom" as const, customValue: authorization },
		headers: headersWithoutAuthorization,
	};
};

const applyAuthHeaders = (headers: Record<string, string>, auth: IApiAuthDraft) => {
	const warnings: string[] = [];
	const headersWithoutAuthorization = auth.type === "none" ? headers : removeHeader(headers, "authorization");

	if (auth.type !== "none" && hasHeader(headers, "authorization")) {
		warnings.push("Authorization header was replaced by the selected auth option.");
	}

	if (auth.type === "bearer") {
		if (!auth.bearerToken.trim()) {
			throw new Error("Bearer token is required.");
		}

		return { headers: { ...headersWithoutAuthorization, Authorization: `Bearer ${auth.bearerToken.trim()}` }, warnings };
	}

	if (auth.type === "basic") {
		if (!auth.basicUsername.trim()) {
			throw new Error("Basic auth username is required.");
		}

		return {
			headers: { ...headersWithoutAuthorization, Authorization: `Basic ${btoa(`${auth.basicUsername}:${auth.basicPassword}`)}` },
			warnings,
		};
	}

	if (auth.type === "custom") {
		if (!auth.customValue.trim()) {
			throw new Error("Custom Authorization value is required.");
		}

		return { headers: { ...headersWithoutAuthorization, Authorization: auth.customValue.trim() }, warnings };
	}

	return { headers: headersWithoutAuthorization, warnings };
};

const inferBodyType = (headers: Record<string, string>, body: string): IApiBodyType => {
	const contentType = getHeaderValue(headers, "content-type").toLowerCase();
	const trimmedBody = body.trim();

	if (contentType.includes("xml") || trimmedBody.startsWith("<")) {
		return "xml";
	}

	if (contentType.includes("x-www-form-urlencoded") || (/^[^={\[]+=/.test(trimmedBody) && trimmedBody.includes("="))) {
		return "form";
	}

	return "json";
};

const maybeAddContentType = (headers: Record<string, string>, body: string, bodyType: IApiBodyType) => {
	if (!body.trim() || hasHeader(headers, "content-type")) {
		return headers;
	}

	return { ...headers, "Content-Type": bodyContentTypes[bodyType] };
};

const prepareBody = (body: string, bodyType: IApiBodyType) => {
	if (bodyType !== "form") {
		return body;
	}

	const trimmedBody = body.trim();

	if (!trimmedBody || !trimmedBody.startsWith("{")) {
		return body;
	}

	try {
		const parsedBody = JSON.parse(trimmedBody) as Record<string, unknown>;
		const formBody = new URLSearchParams();

		Object.entries(parsedBody).forEach(([key, value]) => {
			formBody.append(key, typeof value === "string" ? value : JSON.stringify(value));
		});

		return formBody.toString();
	} catch {
		return body;
	}
};

const appendBodyPartsToQueryParams = (queryParams: IKeyValueRow[], bodyParts: string[]) => {
	const nextQueryParams = [...queryParams];

	bodyParts.forEach((bodyPart) => {
		new URLSearchParams(bodyPart).forEach((value, key) => {
			nextQueryParams.push(createKeyValueRow(key, value));
		});
	});

	return nextQueryParams;
};

const parseCurlRequest = (value: string, timeoutMs: number): ParseRequestResult => {
	const tokens = tokenizeCurlCommand(value);
	const warnings: string[] = [];

	if (tokens[0]?.toLowerCase() !== "curl") {
		return { ok: false, error: "cURL command must start with curl.", warnings };
	}

	let method: IApiMethod = "GET";
	let url = "";
	let auth = createEmptyAuthDraft();
	const headers: Record<string, string> = {};
	const bodyParts: string[] = [];
	let forceGetWithData = false;

	const readNextValue = (index: number, flag: string) => {
		const token = tokens[index];
		const inlineValue = readInlineFlagValue(token, flag);

		if (inlineValue !== null) {
			return { value: inlineValue, nextIndex: index };
		}

		const valueToken = tokens[index + 1];

		if (!valueToken) {
			throw new Error(`${flag} requires a value.`);
		}

		return { value: valueToken, nextIndex: index + 1 };
	};

	try {
		for (let index = 1; index < tokens.length; index += 1) {
			const token = tokens[index];

			if (token === "-X" || token.startsWith("-X") || token === "--request" || token.startsWith("--request=")) {
				const nextValue = readNextValue(index, token.startsWith("--request") ? "--request" : "-X");
				method = normalizeMethod(nextValue.value);
				index = nextValue.nextIndex;
				continue;
			}

			if (token === "-H" || token.startsWith("-H") || token === "--header" || token.startsWith("--header=")) {
				const nextValue = readNextValue(index, token.startsWith("--header") ? "--header" : "-H");
				const header = parseHeaderValue(nextValue.value);
				headers[header.name] = header.value;
				index = nextValue.nextIndex;
				continue;
			}

			if (
				[...curlDataFlags].some((flag) => token === flag || token.startsWith(`${flag}=`) || (flag.length === 2 && token.startsWith(flag)))
			) {
				const flag = [...curlDataFlags].find(
					(dataFlag) => token === dataFlag || token.startsWith(`${dataFlag}=`) || (dataFlag.length === 2 && token.startsWith(dataFlag)),
				);

				if (flag) {
					const nextValue = readNextValue(index, flag);
					bodyParts.push(nextValue.value);
					index = nextValue.nextIndex;
				}

				continue;
			}

			if (token === "--url" || token.startsWith("--url=")) {
				const nextValue = readNextValue(index, "--url");
				url = nextValue.value;
				index = nextValue.nextIndex;
				continue;
			}

			if (token === "-I" || token === "--head") {
				method = "HEAD";
				continue;
			}

			if (token === "-G" || token === "--get") {
				method = "GET";
				forceGetWithData = true;
				continue;
			}

			if (token === "-u" || token.startsWith("-u") || token === "--user" || token.startsWith("--user=")) {
				const nextValue = readNextValue(index, token.startsWith("--user") ? "--user" : "-u");
				const credentials = splitBasicCredentials(nextValue.value);
				auth = {
					...createEmptyAuthDraft(),
					type: "basic",
					basicUsername: credentials.username,
					basicPassword: credentials.password,
				};
				index = nextValue.nextIndex;
				continue;
			}

			if (ignoredCurlFlags.has(token)) {
				continue;
			}

			if (ignoredCurlFlagsWithValue.has(token)) {
				index += 1;
				continue;
			}

			if (token.startsWith("-")) {
				warnings.push(`Ignored unsupported cURL option: ${token}.`);
				continue;
			}

			if (!url) {
				url = token;
			}
		}

		if (!url) {
			return { ok: false, error: "cURL command does not include a URL.", warnings };
		}

		const urlParts = splitUrlAndQueryParams(url);
		const body = forceGetWithData ? "" : bodyParts.join("&");
		const requestMethod = body && method === "GET" ? "POST" : method;
		const queryParams = forceGetWithData ? appendBodyPartsToQueryParams(urlParts.queryParams, bodyParts) : urlParts.queryParams;
		const extractedAuth = auth.type === "none" ? extractAuthFromHeaders(headers) : { auth, headers };
		const bodyType = inferBodyType(extractedAuth.headers, body);
		const sanitizedHeaders = sanitizeHeaders(extractedAuth.headers);
		const authHeaders = applyAuthHeaders(sanitizedHeaders.headers, extractedAuth.auth);
		const finalHeaders = maybeAddContentType(authHeaders.headers, body, bodyType);

		return {
			ok: true,
			request: {
				method: requestMethod,
				baseUrl: urlParts.baseUrl,
				url: buildUrlWithQueryParams(urlParts.baseUrl, queryParams),
				queryParams,
				headers: finalHeaders,
				headerRows: recordToRows(sanitizedHeaders.headers),
				body,
				bodyType,
				auth: extractedAuth.auth,
				timeoutMs,
				importedFromCurl: true,
				warnings: [...warnings, ...sanitizedHeaders.warnings, ...authHeaders.warnings],
			},
		};
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : "Unable to parse cURL command.", warnings };
	}
};

export const parseRequestInput = (draft: IApiRequestDraft): ParseRequestResult => {
	try {
		if (isCurlInput(draft.requestInput)) {
			return parseCurlRequest(draft.requestInput, draft.timeoutMs);
		}

		const urlParts = splitUrlAndQueryParams(draft.requestInput);
		const queryParams = [...urlParts.queryParams, ...draft.queryParams];
		const sanitizedHeaders = sanitizeHeaders(keyValueRowsToRecord(draft.headers));
		const authHeaders = applyAuthHeaders(sanitizedHeaders.headers, draft.auth);
		const body = canSendBody(draft.method) ? draft.bodyText : "";
		const bodyWarnings =
			draft.bodyText.trim() && !canSendBody(draft.method) ? [`${draft.method} requests cannot send a body in this browser client.`] : [];
		const headers = maybeAddContentType(authHeaders.headers, body, draft.bodyType);

		return {
			ok: true,
			request: {
				method: draft.method,
				baseUrl: urlParts.baseUrl,
				url: buildUrlWithQueryParams(urlParts.baseUrl, queryParams),
				queryParams: getEnabledRows(queryParams),
				headers,
				headerRows: recordToRows(sanitizedHeaders.headers),
				body,
				bodyType: draft.bodyType,
				auth: draft.auth,
				timeoutMs: draft.timeoutMs,
				importedFromCurl: false,
				warnings: [...sanitizedHeaders.warnings, ...authHeaders.warnings, ...bodyWarnings],
			},
		};
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : "Unable to build request.", warnings: [] };
	}
};

const normalizeResponseHeaders = (headers: unknown) => {
	const normalizedHeaders: Record<string, string> = {};

	Object.entries(headers as Record<string, unknown>).forEach(([name, value]) => {
		if (Array.isArray(value)) {
			normalizedHeaders[name] = value.join(", ");
		} else if (value !== undefined && value !== null) {
			normalizedHeaders[name] = String(value);
		}
	});

	return normalizedHeaders;
};

export const formatResponseBody = (bodyText: string) => {
	if (!bodyText.trim()) {
		return "";
	}

	try {
		return JSON.stringify(JSON.parse(bodyText), null, 2);
	} catch {
		return bodyText;
	}
};

const getBodySize = (bodyText: string) => new Blob([bodyText]).size;

export const sendApiRequest = async (draft: IApiRequestDraft): Promise<IApiRequestExecutionResult> => {
	const parsedRequest = parseRequestInput(draft);

	if (!parsedRequest.ok) {
		return { ok: false, error: parsedRequest.error, warnings: parsedRequest.warnings };
	}

	const request = parsedRequest.request;
	const preparedBody = prepareBody(request.body, request.bodyType);
	const startedAt = performance.now();
	const requestConfig: AxiosRequestConfig<string> = {
		method: request.method,
		url: request.url,
		headers: request.headers,
		data: canSendBody(request.method) && preparedBody.trim() ? preparedBody : undefined,
		timeout: request.timeoutMs,
		responseType: "text",
		transformResponse: [(value) => value],
		validateStatus: () => true,
	};

	try {
		const response = await axios.request<string>(requestConfig);
		const durationMs = performance.now() - startedAt;
		const responseHeaders = normalizeResponseHeaders(response.headers);
		const rawBodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data ?? "");

		return {
			ok: true,
			request,
			response: {
				status: response.status,
				statusText: response.statusText,
				durationMs,
				sizeBytes: getBodySize(rawBodyText),
				contentType: getHeaderValue(responseHeaders, "content-type") || "Unknown",
				headers: responseHeaders,
				bodyText: formatResponseBody(rawBodyText),
				rawBodyText,
				receivedAt: new Date().toISOString(),
			},
			warnings: request.warnings,
		};
	} catch (error) {
		const durationMs = performance.now() - startedAt;

		if (axios.isAxiosError(error)) {
			const isTimeout = error.code === "ECONNABORTED";
			const isNetworkError = error.message === "Network Error";

			return {
				ok: false,
				request,
				error: isTimeout ? "Request timed out." : isNetworkError ? "Request failed in the browser." : error.message,
				details: isNetworkError ? "The target may be offline or blocked by CORS." : error.response?.statusText,
				durationMs,
				warnings: request.warnings,
			};
		}

		return {
			ok: false,
			request,
			error: error instanceof Error ? error.message : "Request failed.",
			durationMs,
			warnings: request.warnings,
		};
	}
};

const parseBodyForReport = (bodyText: string) => {
	if (!bodyText.trim()) {
		return "";
	}

	try {
		return JSON.parse(bodyText) as unknown;
	} catch {
		return bodyText;
	}
};

const rowsForReport = (rows: IKeyValueRow[]) =>
	getEnabledRows(rows).map((row) => ({
		key: row.key.trim(),
		value: row.value,
	}));

export const createApiResponseReport = (result: IApiRequestExecutionResult | null) => {
	if (!result) {
		return "";
	}

	if (!result.ok) {
		return JSON.stringify(
			{
				ok: false,
				request: result.request
					? {
							method: result.request.method,
							url: result.request.url,
							queryParams: rowsForReport(result.request.queryParams),
							headers: result.request.headers,
							bodyType: result.request.bodyType,
							authType: result.request.auth.type,
						}
					: undefined,
				error: result.error,
				details: result.details,
				duration: result.durationMs === undefined ? undefined : formatDuration(result.durationMs),
				warnings: result.warnings,
			},
			null,
			2,
		);
	}

	return JSON.stringify(
		{
			ok: true,
			request: {
				method: result.request.method,
				url: result.request.url,
				queryParams: rowsForReport(result.request.queryParams),
				headers: result.request.headers,
				bodyType: result.request.bodyType,
				authType: result.request.auth.type,
				body: result.request.body || undefined,
			},
			response: {
				status: result.response.status,
				statusText: result.response.statusText,
				duration: formatDuration(result.response.durationMs),
				size: formatBytes(result.response.sizeBytes),
				contentType: result.response.contentType,
				receivedAt: result.response.receivedAt,
				headers: result.response.headers,
				body: parseBodyForReport(result.response.rawBodyText),
			},
			warnings: result.warnings,
		},
		null,
		2,
	);
};
