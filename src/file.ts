import { readFile, writeFile } from "node:fs/promises";

export const readJson = async (filePath: string) => {
	try {
		const data = await readFile(filePath, "utf-8");
		return JSON.parse(data) as object;
	} catch (error) {
		console.error(`Error reading file at ${filePath}:`, error);
		throw error;
	}
};

export const writeJson = async (filePath: string, data: object) => {
	try {
		await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
	} catch (error) {
		console.error(`Error writing file at ${filePath}:`, error);
		throw error;
	}
};
