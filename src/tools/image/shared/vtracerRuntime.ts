type IWasmExports = WebAssembly.Exports & {
	memory: WebAssembly.Memory;
	__wbg_binaryimageconverter_free: (pointer: number) => void;
	__wbg_colorimageconverter_free: (pointer: number) => void;
	binaryimageconverter_init: (pointer: number) => void;
	binaryimageconverter_new_with_string: (pointer: number, length: number) => number;
	binaryimageconverter_progress: (pointer: number) => number;
	binaryimageconverter_tick: (pointer: number) => number;
	colorimageconverter_init: (pointer: number) => void;
	colorimageconverter_new_with_string: (pointer: number, length: number) => number;
	colorimageconverter_progress: (pointer: number) => number;
	colorimageconverter_tick: (pointer: number) => number;
	__wbindgen_malloc: (size: number) => number;
	__wbindgen_realloc: (pointer: number, oldSize: number, newSize: number) => number;
	__wbindgen_free: (pointer: number, size: number) => void;
	__wbindgen_exn_store: (index: number) => void;
	__wbindgen_start?: () => void;
};

const heap = new Array<unknown>(32).fill(undefined);
heap.push(undefined, null, true, false);
let heapNext = heap.length;
let wasm: IWasmExports | null = null;
let cachedUint8Memory: Uint8Array | null = null;
let cachedInt32Memory: Int32Array | null = null;
let vectorLength = 0;
const textDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
const textEncoder = new TextEncoder();

const getObject = (index: number) => heap[index];

const addHeapObject = (object: unknown) => {
	if (heapNext === heap.length) {
		heap.push(heap.length + 1);
	}

	const index = heapNext;
	heapNext = heap[index] as number;
	heap[index] = object;

	return index;
};

const dropObject = (index: number) => {
	if (index < 36) {
		return;
	}

	heap[index] = heapNext;
	heapNext = index;
};

const takeObject = (index: number) => {
	const object = getObject(index);
	dropObject(index);
	return object;
};

const isLikeNone = (value: unknown) => value === undefined || value === null;

const getUint8Memory = () => {
	if (!wasm) {
		throw new Error("VTracer WASM is not initialized.");
	}

	if (!cachedUint8Memory || cachedUint8Memory.buffer !== wasm.memory.buffer) {
		cachedUint8Memory = new Uint8Array(wasm.memory.buffer);
	}

	return cachedUint8Memory;
};

const getInt32Memory = () => {
	if (!wasm) {
		throw new Error("VTracer WASM is not initialized.");
	}

	if (!cachedInt32Memory || cachedInt32Memory.buffer !== wasm.memory.buffer) {
		cachedInt32Memory = new Int32Array(wasm.memory.buffer);
	}

	return cachedInt32Memory;
};

const getStringFromWasm = (pointer: number, length: number) => textDecoder.decode(getUint8Memory().subarray(pointer, pointer + length));

const passStringToWasm = (value: string, malloc: IWasmExports["__wbindgen_malloc"]) => {
	const bytes = textEncoder.encode(value);
	const pointer = malloc(bytes.length);
	getUint8Memory()
		.subarray(pointer, pointer + bytes.length)
		.set(bytes);
	vectorLength = bytes.length;

	return pointer;
};

const passArray8ToWasm = (value: Uint8ClampedArray | Uint8Array, malloc: IWasmExports["__wbindgen_malloc"]) => {
	const pointer = malloc(value.length);
	getUint8Memory().set(value, pointer);
	vectorLength = value.length;

	return pointer;
};

const passReturnStringToWasm = (returnPointer: number, value: string) => {
	if (!wasm) {
		throw new Error("VTracer WASM is not initialized.");
	}

	const pointer = passStringToWasm(value, wasm.__wbindgen_malloc);
	const memory = getInt32Memory();
	memory[returnPointer / 4] = pointer;
	memory[returnPointer / 4 + 1] = vectorLength;
};

const debugString = (value: unknown) => {
	if (typeof value === "string") return `\"${value}\"`;
	if (typeof value === "number" || typeof value === "boolean" || value == null) return String(value);
	if (value instanceof Error) return `${value.name}: ${value.message}\n${value.stack ?? ""}`;

	try {
		return JSON.stringify(value);
	} catch {
		return Object.prototype.toString.call(value);
	}
};

const handleError =
	<TArgs extends unknown[], TReturn>(callback: (...args: TArgs) => TReturn) =>
	(...args: TArgs) => {
		try {
			return callback(...args);
		} catch (caughtError) {
			wasm?.__wbindgen_exn_store(addHeapObject(caughtError));
			return 0 as TReturn;
		}
	};

const getImports = () => ({
	"./vtracer_webapp_bg.js": {
		__wbindgen_object_drop_ref: (index: number) => {
			takeObject(index);
		},
		__wbindgen_string_new: (pointer: number, length: number) => addHeapObject(getStringFromWasm(pointer, length)),
		__wbg_new_59cb74e423758ede: () => addHeapObject(new Error()),
		__wbg_stack_558ba5917b466edd: (returnPointer: number, errorIndex: number) =>
			passReturnStringToWasm(returnPointer, (getObject(errorIndex) as Error).stack ?? ""),
		__wbg_error_4bb6c2a97407129a: (pointer: number, length: number) => console.error(getStringFromWasm(pointer, length)),
		__wbg_instanceof_Window_adf3196bdc02b386: (index: number) => getObject(index) instanceof Window,
		__wbg_document_6cc8d0b87c0a99b9: (index: number) => addHeapObject((getObject(index) as Window).document),
		__wbg_createElementNS_ea14cb45a87a0719: handleError(
			(index: number, namespacePointer: number, namespaceLength: number, namePointer: number, nameLength: number) =>
				addHeapObject(
					(getObject(index) as Document).createElementNS(
						getStringFromWasm(namespacePointer, namespaceLength),
						getStringFromWasm(namePointer, nameLength),
					),
				),
		),
		__wbg_getElementById_0cb6ad9511b1efc0: (index: number, pointer: number, length: number) => {
			const element = (getObject(index) as Document).getElementById(getStringFromWasm(pointer, length));
			return isLikeNone(element) ? 0 : addHeapObject(element);
		},
		__wbg_setAttribute_727bdb9763037624: (
			index: number,
			namePointer: number,
			nameLength: number,
			valuePointer: number,
			valueLength: number,
		) => {
			(getObject(index) as Element).setAttribute(getStringFromWasm(namePointer, nameLength), getStringFromWasm(valuePointer, valueLength));
		},
		__wbg_prepend_fa995bb42f6e2983: (index: number, childIndex: number) => {
			(getObject(index) as Element).prepend(getObject(childIndex) as Node);
		},
		__wbg_debug_d101e002eb92f20b: (pointer: number, length: number) => console.debug(getStringFromWasm(pointer, length)),
		__wbg_error_cb872335132b1ef7: (pointer: number, length: number) => console.error(getStringFromWasm(pointer, length)),
		__wbg_info_a25afde0ff8cd04a: (pointer: number, length: number) => console.info(getStringFromWasm(pointer, length)),
		__wbg_log_3bafd82835c6de6d: (pointer: number, length: number) => console.log(getStringFromWasm(pointer, length)),
		__wbg_log_64f566ae90a6c43c: (index: number) => console.log(getObject(index)),
		__wbg_warn_f632d7d3f55682b6: (pointer: number, length: number) => console.warn(getStringFromWasm(pointer, length)),
		__wbg_instanceof_CanvasRenderingContext2d_5b86ec94bce38d5b: (index: number) => getObject(index) instanceof CanvasRenderingContext2D,
		__wbg_getImageData_888c08c04395524a: handleError((index: number, x: number, y: number, width: number, height: number) =>
			addHeapObject((getObject(index) as CanvasRenderingContext2D).getImageData(x, y, width, height)),
		),
		__wbg_instanceof_HtmlCanvasElement_4f5b5ec6cd53ccf3: (index: number) => getObject(index) instanceof HTMLCanvasElement,
		__wbg_width_a22f9855caa54b53: (index: number) => (getObject(index) as HTMLCanvasElement).width,
		__wbg_height_9a404a6b3c61c7ef: (index: number) => (getObject(index) as HTMLCanvasElement).height,
		__wbg_getContext_37ca0870acb096d9: (index: number, pointer: number, length: number) =>
			handleError(() => {
				const context = (getObject(index) as HTMLCanvasElement).getContext(getStringFromWasm(pointer, length));
				return isLikeNone(context) ? 0 : addHeapObject(context);
			})(),
		__wbg_data_c2cd7a48734589b2: (returnPointer: number, imageDataIndex: number) => {
			const data = (getObject(imageDataIndex) as ImageData).data;
			const pointer = passArray8ToWasm(data, wasm!.__wbindgen_malloc);
			const length = vectorLength;
			const memory = getInt32Memory();
			memory[returnPointer / 4 + 1] = length;
			memory[returnPointer / 4] = pointer;
		},
		__wbg_call_8e95613cc6524977: handleError((functionIndex: number, thisIndex: number) =>
			addHeapObject((getObject(functionIndex) as Function).call(getObject(thisIndex))),
		),
		__wbindgen_object_clone_ref: (index: number) => addHeapObject(getObject(index)),
		__wbg_newnoargs_f3b8a801d5d4b079: (pointer: number, length: number) => addHeapObject(new Function(getStringFromWasm(pointer, length))),
		__wbg_self_07b2f89e82ceb76d: handleError(() => addHeapObject(self.self)),
		__wbg_window_ba85d88572adc0dc: handleError(() => addHeapObject(window.window)),
		__wbg_globalThis_b9277fc37e201fe5: handleError(() => addHeapObject(globalThis.globalThis)),
		__wbg_global_e16303fe83e1d57f: handleError(() => addHeapObject(globalThis.globalThis)),
		__wbindgen_is_undefined: (index: number) => getObject(index) === undefined,
		__wbindgen_debug_string: (returnPointer: number, index: number) => passReturnStringToWasm(returnPointer, debugString(getObject(index))),
		__wbindgen_throw: (pointer: number, length: number) => {
			throw new Error(getStringFromWasm(pointer, length));
		},
	},
});

const initVTracerWasm = async (wasmUrl: string) => {
	if (wasm) {
		return wasm;
	}

	const response = await fetch(wasmUrl);
	const wasmBytes = await response.arrayBuffer();
	const instance = await WebAssembly.instantiate(wasmBytes, getImports());
	wasm = instance.instance.exports as IWasmExports;
	wasm.__wbindgen_start?.();

	return wasm;
};

class ColorImageConverter {
	private pointer: number;

	private constructor(pointer: number) {
		this.pointer = pointer;
	}

	static newWithString(config: string) {
		if (!wasm) throw new Error("VTracer WASM is not initialized.");
		const pointer = passStringToWasm(config, wasm.__wbindgen_malloc);
		return new ColorImageConverter(wasm.colorimageconverter_new_with_string(pointer, vectorLength));
	}

	init() {
		wasm?.colorimageconverter_init(this.pointer);
	}

	tick() {
		return Boolean(wasm?.colorimageconverter_tick(this.pointer));
	}

	progress() {
		return wasm?.colorimageconverter_progress(this.pointer) ?? 0;
	}

	free() {
		if (this.pointer) {
			wasm?.__wbg_colorimageconverter_free(this.pointer);
			this.pointer = 0;
		}
	}
}

class BinaryImageConverter {
	private pointer: number;

	private constructor(pointer: number) {
		this.pointer = pointer;
	}

	static newWithString(config: string) {
		if (!wasm) throw new Error("VTracer WASM is not initialized.");
		const pointer = passStringToWasm(config, wasm.__wbindgen_malloc);
		return new BinaryImageConverter(wasm.binaryimageconverter_new_with_string(pointer, vectorLength));
	}

	init() {
		wasm?.binaryimageconverter_init(this.pointer);
	}

	tick() {
		return Boolean(wasm?.binaryimageconverter_tick(this.pointer));
	}

	progress() {
		return wasm?.binaryimageconverter_progress(this.pointer) ?? 0;
	}

	free() {
		if (this.pointer) {
			wasm?.__wbg_binaryimageconverter_free(this.pointer);
			this.pointer = 0;
		}
	}
}

export type IVTracerConverter = ColorImageConverter | BinaryImageConverter;

export const createVTracerConverter = async (wasmUrl: string, colorMode: "color" | "binary", config: string) => {
	await initVTracerWasm(wasmUrl);
	const converter = colorMode === "color" ? ColorImageConverter.newWithString(config) : BinaryImageConverter.newWithString(config);
	converter.init();

	return converter;
};
