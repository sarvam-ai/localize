import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Console } from "mcmd";
import { tryAsync, trys } from "@/utils";

export type ConfigFile = {
	translate?: {
		model?: string;
		dist: string;
		from: string;
		extension: "json";
	} & (
		| {
				to: string[];
		  }
		| {
				all: boolean;
		  }
	);
	markdown?: {
		model?: string;
		source: string;
		destination: string;
		fileType: string;
		dataFile?: string;
	} & (
		| {
				to: string[];
		  }
		| {
				all: boolean;
		  }
	);
};

export const readConfig = async <T = ConfigFile>(
	filePath: string,
	showError = true,
): Promise<T | null> => {
	const [readErr, content] = await tryAsync(readFile(filePath, "utf-8"));
	if (readErr) {
		const error = readErr as NodeJS.ErrnoException;
		if (error.code === "ENOENT") return null;

		if (showError) Console.error(`Error read file at ${filePath}:`, error);
		return null;
	}

	const json = trys(() => JSON.parse(content ?? "{}"));
	if (!json.isSuccess) {
		if (showError)
			Console.error(`Error parsing file at ${filePath}:`, json.error);
		return null;
	}

	return (json.data ?? {}) as T;
};

export const writeConfig = async (
	filePath: string,
	data: ConfigFile,
	showError = true,
) => {
	await tryAsync(mkdir(dirname(filePath), { recursive: true }));

	const content = JSON.stringify(data, null, 4);
	const [writeErr] = await tryAsync(writeFile(filePath, content));
	if (showError && writeErr) {
		Console.error(`Error writing file at ${filePath}:`, writeErr);
		throw writeErr;
	}
};

export const updateConfig = async <
	C extends Record<string, object> = ConfigFile,
	K extends keyof C = keyof C,
	V extends C[K] = C[K],
>(
	filePath: string,
	section: K,
	value: V,
) => {
	const existing = await readConfig<C>(filePath, true);
	await writeConfig(filePath, {
		...(existing ?? {}),
		[section]: value,
	});
};
