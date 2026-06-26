import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Console } from "mcmd";
import { flattenJson, unflattenJson } from "@/json";
import { tryAsync, trys } from "./utils";

export const readJson = async (filePath: string, showError = true) => {
	const [err, content] = await tryAsync(readFile(filePath, "utf-8"));
	if (showError && err) {
		Console.error(`Error read file at ${filePath}:`, err);
		return new Map<string, string>();
	}

	const { error, data } = trys(() => JSON.parse(content ?? "{}"));
	if (showError && error)
		Console.error(`Error parsing file at ${filePath}:`, error);

	return flattenJson((data ?? {}) as object);
};

export const readJsonRaw = async <T extends object = Record<string, unknown>>(
	filePath: string,
	showError = true,
): Promise<T> => {
	const [err, content] = await tryAsync(readFile(filePath, "utf-8"));
	if (showError && err) {
		Console.error(`Error read file at ${filePath}:`, err);
		return {} as T;
	}

	const { error, data } = trys(() => JSON.parse(content ?? "{}"));
	if (showError && error)
		Console.error(`Error parsing file at ${filePath}:`, error);

	return (data ?? {}) as T;
};

export const writeJson = async (
	filePath: string,
	data: Map<string, string>,
) => {
	const content = JSON.stringify(unflattenJson(data), null, 4);
	const [error] = await tryAsync(writeFile(filePath, content));

	if (error) Console.error(`Error writing file at ${filePath}:`, error);
};

export const writeJsonRaw = async (filePath: string, data: object) => {
	const content = JSON.stringify(data, null, 4);
	const [error] = await tryAsync(writeFile(filePath, content));

	if (error) Console.error(`Error writing file at ${filePath}:`, error);
};

export const readMd = async (
	filePath: string,
	showError = true,
): Promise<string | null> => {
	const [error, content] = await tryAsync(readFile(filePath, "utf-8"));

	if (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		if (showError) Console.error(`Error read file at ${filePath}:`, error);
		return null;
	}

	if (!content || content.trim().length === 0) return null;
	return content;
};

export const writeMd = async (filePath: string, content: string) => {
	const [mkdirError] = await tryAsync(
		mkdir(dirname(filePath), { recursive: true }),
	);
	if (mkdirError) {
		Console.error(`Error creating directory for ${filePath}:`, mkdirError);
		return;
	}

	const [error] = await tryAsync(writeFile(filePath, content));
	if (error) Console.error(`Error writing file at ${filePath}:`, error);
};
