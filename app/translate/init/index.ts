import { getCMD } from "@/cmd";
import {
	LanguageCodeSchema,
	languageDist,
	translationModelZod,
} from "@/config";
import { writeJsonRaw } from "@/file";
import { createFileInFolder, listFilesInFolder } from "@/folder";
import { askAndRunCommand } from "@/prompts";
import { selectFolderInLoop } from "@/select-folder";
import { defaultEnglistJson } from "@/translate";

export const options = z
	.object({
		config: z.string(),
		override: z.boolean().optional(),
	})
	.passthrough();

export default Command<typeof options>(async (data) => {
	const configPath = data.config;
	const translateCmd = getCMD(
		"translate",
		data.defaultPath ? undefined : `--config ${configPath}`,
	);

	const hasTranslate =
		typeof data.translate === "object" && data.translate !== null;

	if (hasTranslate && !data.override) {
		Console.blue(`Config already loaded from ${configPath}. Skipping init.`);
		Console.blue(`Pass --override to update the config file.`);
	}

	const dist = await selectFolderInLoop();

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
		});

		const name = (languageRes.value ?? "").split(".")[0];
		const code = LanguageCodeSchema.safeParse(name);
		source = code.success ? code.data : null;
	}

	if (!source) {
		const languageRes = await Console.prompts({
			type: "select",
			name: "value",
			message: "Pick a language you know",
			choices: Object.entries(languageDist).map(([code, name]) => ({
				title: name,
				value: code,
			})),
			min: 1,
		});

		const code = LanguageCodeSchema.safeParse(languageRes.value);
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
			{
				title: "All of the below",
				value: "all",
			},
			...Object.entries(languageDist).map(([code, name]) => ({
				title: name,
				value: code,
			})),
		],
		min: 1,
		hint: "- Space to select. Return to submit",
	});

	const modelRes = await Console.prompts({
		type: "select",
		name: "value",
		message: "Pick a Sarvam Translation Model",
		choices: [
			{
				title: translationModelZod.enum["mayura:v1"],
				value: translationModelZod.enum["mayura:v1"],
			},
			{
				title: translationModelZod.enum["sarvam-translate:v1"],
				value: translationModelZod.enum["sarvam-translate:v1"],
			},
			{
				title: "Automatically pick the best",
				value: "auto",
			},
		],
	});

	const model =
		modelRes.value === "auto"
			? translationModelZod.enum["mayura:v1"]
			: modelRes.value;
	const selectedLanguages = languagesRes.value as string[];

	const baseConfig = {
		model,
		dist,
		from: source,
		extension: "json" as const,
	};

	if (selectedLanguages.includes("all")) {
		await writeJsonRaw(configPath, {
			translate: {
				...baseConfig,
				all: true,
			},
		});
	} else {
		const target = z.array(LanguageCodeSchema).safeParse(selectedLanguages);
		if (!target.success) {
			Console.error("Select atleast one target language");
			process.exit(1);
		}

		await writeJsonRaw(configPath, {
			translate: {
				...baseConfig,
				to: target.data,
			},
		});
	}

	Console.green(`Saved translate config to ${configPath}`);
	await askAndRunCommand(translateCmd);
});
