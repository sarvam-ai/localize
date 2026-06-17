import { readFile, writeFile } from "node:fs/promises";
import { Console } from "mcmd";
import { tryAsync, trys } from "./utils";

export const readJson = async (filePath: string) => {
	const [error1, content] = await tryAsync(readFile(filePath, "utf-8"));
	if (error1) {
		Console.error(`Error read file at ${filePath}:`, error1);
		return {};
	}

	const { error, data } = trys(() => JSON.parse(content ?? "{}"));
	if (error) Console.error(`Error parsing file at ${filePath}:`, error);

	return (data ?? {}) as object;
};

export const writeJson = async (filePath: string, data: object) => {
	const content = JSON.stringify(data, null, 4);
	const [error] = await tryAsync(writeFile(filePath, content));

	if (error) Console.error(`Error writing file at ${filePath}:`, error);
};
