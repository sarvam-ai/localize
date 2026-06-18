import { getCMD } from "@/cmd";
import { languages, SarvamLanguageCodeSchema } from "@/config";
import { assertEnv } from "@/env";
import {
	createDirectory,
	createFileInFolder,
	listFilesInFolder,
	listFoldersInCurrentDirectory,
} from "@/folder";
import { defaultEnglistJson } from "@/translate";

export default Command(async () => {
	assertEnv();

	const ls = await listFoldersInCurrentDirectory();

	const folderRes = await Console.prompts({
		type: "select",
		name: "value",
		message: "Pick your locales folder",
		warn: "If you don't I'll create on called `locales`",
		choices: [
			...ls.map((folder) => ({ title: folder, value: folder })),
			{
				title: "Create a new folder called `locales`",
				value: "create",
			},
		],
	});

	const dist: string =
		folderRes.value === "create"
			? await createDirectory(`locales`)
			: folderRes.value;

	const files = await listFilesInFolder(dist);
	let source = null;

	if (files.length !== 0) {
		const languageRes = await Console.prompts({
			type: "select",
			name: "value",
			message: "Pick your source language",
			choices: files.map((file) => ({
				title: file,
				value: file,
			})),
			initial: 1,
		});

		const name = (languageRes.value ?? "").split(".")[0];
		const code = SarvamLanguageCodeSchema.safeParse(name);
		source = code.success ? code.data : null;
	}

	if (!source) {
		const languageRes = await Console.prompts({
			type: "select",
			name: "value",
			message: "Pick a language you know",
			choices: Object.entries(languages).map(([code, name]) => ({
				title: name,
				value: code,
			})),
			min: 1,
			initial: 1,
		});

		const code = SarvamLanguageCodeSchema.safeParse(languageRes.value);
		if (!code.success) {
			Console.error("Select or create atleast one source file");
			process.exit(1);
		}
		source = code.data;
		await createFileInFolder(
			dist,
			`${source}.json`,
			source === "en-IN" ? defaultEnglistJson() : "{}",
		);
	}

	const languagesRes = await Console.prompts({
		type: "multiselect",
		name: "value",
		message: "Pick all the target languages you want",
		choices: [
			...Object.entries(languages).map(([code, name]) => ({
				title: name,
				value: code,
			})),
			{
				title: "All of the above",
				value: "all",
			},
		],
		min: 1,
		hint: "- Space to select. Return to submit",
	});

	console.log(languagesRes);

	if ((languagesRes.value as string[]).includes("all")) {
		Console.green("You're ready to run the following command");
		Console.log(
			getCMD({
				from: source,
				all: true,
			}),
		);
		process.exit(0);
	}

	const target = z
		.array(SarvamLanguageCodeSchema)
		.safeParse(languagesRes.value);
	if (!target.success) {
		Console.error("Select atleast one target language");
		process.exit(1);
	}

	Console.green("You're ready to run the following command");
	Console.log(
		getCMD({
			from: source,
			to: target.data,
		}),
	);
	process.exit(0);
});
