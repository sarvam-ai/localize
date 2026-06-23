import { dirname, join } from "node:path";
import { Console } from "mcmd";
import { createDirectory, listFoldersInFolder } from "@/folder";

export const selectFolderInLoop = async () => {
	let currentFolder = ".";

	while (true) {
		const folders = await listFoldersInFolder(currentFolder);
		const currentLabel = currentFolder === "." ? "./" : `./${currentFolder}`;

		const folderRes = await Console.prompts({
			type: "select",
			name: "value",
			message: "Pick your locales folder",
			warn: `Current folder: ${currentLabel}`,
			choices: [
				{
					title: `Select this folder (${currentLabel})`,
					value: "select",
				},
				...folders.map((folder) => ({
					title: `Open: ${folder}`,
					value: `open:${folder}`,
				})),
				...(currentFolder === "."
					? []
					: [
							{
								title: "Go to parent folder",
								value: "up",
							},
						]),
				{
					title: "Create a new folder called `locales` here",
					value: "create",
				},
			],
		});

		const action = folderRes.value as string;

		if (action === "select") {
			return currentFolder;
		}

		if (action === "up") {
			currentFolder = dirname(currentFolder);
			continue;
		}

		if (action === "create") {
			const targetFolder =
				currentFolder === "." ? "locales" : join(currentFolder, "locales");
			return createDirectory(targetFolder);
		}

		if (action.startsWith("open:")) {
			const folderName = action.replace("open:", "");
			currentFolder =
				currentFolder === "." ? folderName : join(currentFolder, folderName);
		}
	}
};
