import { getCMD } from "@/cmd";
import { LanguageCodeSchema, languageDist, languageModelZod } from "@/config";
import { writeJsonRaw } from "@/file";
import { askAndRunCommand } from "@/prompts";
import { selectFolderInLoop } from "@/select-folder";
import { fileTypeZod } from "../index";

export const options = z
	.object({
		config: z.string(),
		override: z.boolean().optional(),
	})
	.passthrough();

export default Command<typeof options>(async (data) => {
	const configPath = data.config;
	const markdownCmd = getCMD(
		"markdown",
		data.defaultPath ? undefined : `--config ${configPath}`,
	);

	const hasMarkdown =
		typeof data.markdown === "object" && data.markdown !== null;

	if (hasMarkdown && !data.override) {
		Console.blue(`Config already loaded from ${configPath}. Skipping init.`);
		Console.blue(`Pass --override to update the config file.`);
		return;
	}

	Console.log("Pick source directory (the folder to scan for markdown files)");
	const source = await selectFolderInLoop();

	Console.log(
		"Pick destination directory (where translated markdown will be written)",
	);
	const destination = await selectFolderInLoop();

	const fileTypeRes = await Console.prompts({
		type: "text",
		name: "value",
		message: "Enter markdown file type to scan",
		initial: "page.mdx",
	});

	const fileType = (fileTypeRes.value ?? "page.mdx").trim();

	const parsedFileType = fileTypeZod.safeParse(fileType);
	if (!parsedFileType.success) {
		Console.error(
			"File type must be in the format <name>.<md|mdx> (e.g. page.mdx)",
		);
		process.exit(1);
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
		message: "Pick a Sarvam Language Model",
		choices: [
			{
				title: languageModelZod.enum["sarvam-105b"],
				value: languageModelZod.enum["sarvam-105b"],
			},
			{
				title: languageModelZod.enum["sarvam-30b"],
				value: languageModelZod.enum["sarvam-30b"],
			},
			{
				title: "Automatically pick the best",
				value: "auto",
			},
		],
	});

	const model = modelRes.value === "auto" ? undefined : modelRes.value;

	const selectedLanguages = languagesRes.value as string[];
	const baseConfig = {
		model,
		source,
		destination,
		fileType,
		redo: false,
	};

	if (selectedLanguages.includes("all")) {
		await writeJsonRaw(configPath, {
			markdown: {
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
			markdown: {
				...baseConfig,
				to: target.data,
			},
		});
	}

	Console.green(`Saved markdown config to ${configPath}`);
	await askAndRunCommand(markdownCmd);
});
