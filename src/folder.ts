import { mkdir, readdir, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

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

export const scanFiles = async (
	sourceFolderPath: string,
	checkFunction: (name: string, extension: string) => boolean,
) => {
	const currentDirectory = process.cwd();
	const sourcePath = resolve(currentDirectory, sourceFolderPath);

	const nestedEntries = await readdir(sourcePath, { withFileTypes: true });
	const nestedFolders = nestedEntries.filter((entry) => entry.isDirectory());

	const results = await Promise.all(
		nestedFolders.map(async (folder) => {
			const nestedFolderPath = resolve(sourcePath, folder.name);
			const entries = await readdir(nestedFolderPath, { withFileTypes: true });

			const files = entries
				.filter((entry) => entry.isFile())
				.map((entry) => entry.name)
				.filter((fileName) => {
					const extension = extname(fileName);
					const nameWithoutExtension = extension
						? fileName.slice(0, -extension.length)
						: fileName;

					return checkFunction(nameWithoutExtension, extension);
				})
				.map((fileName) => ({
					name: fileName,
					path: `${sourceFolderPath}/${folder.name}/${fileName}`.replaceAll(
						"\\",
						"/",
					),
				}));

			return {
				folder: folder.name,
				files,
			};
		}),
	);

	return results;
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
