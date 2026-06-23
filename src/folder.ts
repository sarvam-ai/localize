import { mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const listFoldersInFolder = async (folderPath = ".") => {
	const currentDirectory = process.cwd();
	const targetPath = resolve(currentDirectory, folderPath);
	const entries = await readdir(targetPath, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);
};

export const listFoldersInCurrentDirectory = async () =>
	listFoldersInFolder(".");

export const createDirectory = async (directoryPath: string) => {
	const currentDirectory = process.cwd();
	const targetPath = resolve(currentDirectory, directoryPath);
	await mkdir(targetPath, { recursive: true });
	return directoryPath;
};

export const listFilesInFolder = async (folderPath: string, type = "json") => {
	const currentDirectory = process.cwd();
	const targetPath = resolve(currentDirectory, folderPath);
	const entries = await readdir(targetPath, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((fileName) => fileName.endsWith(`.${type}`));
};

export const createFileInFolder = async (
	folderPath: string,
	fileName: string,
	content = "",
) => {
	const currentDirectory = process.cwd();
	const targetFolderPath = resolve(currentDirectory, folderPath);
	const targetFilePath = resolve(targetFolderPath, fileName);

	await mkdir(targetFolderPath, { recursive: true });
	await writeFile(targetFilePath, content, "utf-8");
};
