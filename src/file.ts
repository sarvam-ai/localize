import { readFile, writeFile } from "node:fs/promises";
import { Console } from "mcmd";
import { flattenJson, unflattenJson } from "@/json";
import { tryAsync, trys } from "./utils";

export const readJson = async (filePath: string) => {
	const [error1, content] = await tryAsync(readFile(filePath, "utf-8"));
	if (error1) {
		Console.error(`Error read file at ${filePath}:`, error1);
		return new Map<string, string>();
	}

	const { error, data } = trys(() => JSON.parse(content ?? "{}"));
	if (error) Console.error(`Error parsing file at ${filePath}:`, error);

	return flattenJson((data ?? {}) as object);
};

export const writeJson = async (
	filePath: string,
	data: Map<string, string>,
) => {
	const content = JSON.stringify(unflattenJson(data), null, 4);
	const [error] = await tryAsync(writeFile(filePath, content));

	if (error) Console.error(`Error writing file at ${filePath}:`, error);
};
