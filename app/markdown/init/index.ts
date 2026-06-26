import { getCMD } from "@/cmd";
import {
	extensionZod,
	LanguageCodeSchema,
	languageDist,
	languageModelZod,
	markdownZod,
} from "@/config";
import { updateConfig } from "@/configuration";
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

	const source = await selectFolderInLoop("source");
	const destination = await selectFolderInLoop("destination");

	const fileTypeRes = await Console.prompts({
		type: "text",
		name: "value",
		message: "Enter markdown file type to scan",
		initial: "page.mdx",
	});

	const fileType = fileTypeZod(markdownZod)
		.default("page.mdx")
		.safeParse(fileTypeRes.value);

	if (!fileType.success) {
		Console.error(
			"File type must be in the format <name>.<md|mdx> (e.g. page.mdx)",
		);
		process.exit(1);
	}

	const dataFileRes = await Console.prompts({
		type: "text",
		name: "value",
		message: "Enter, If you want a summary json file",
		initial: "localize.json",
	});

	const dataFile = fileTypeZod(extensionZod)
		.optional()
		.safeParse(dataFileRes.value);

	if (!dataFile.success) {
		Console.warn(
			"File type must be in the format <name>.<json> (e.g. page.mdx)",
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

	const selectedLanguages = languagesRes.value as string[];
	const extraConfig: { all?: boolean; to?: string[] } = {};

	if (selectedLanguages.includes("all")) extraConfig.all = true;
	else {
		const target = z.array(LanguageCodeSchema).safeParse(selectedLanguages);
		if (!target.success) {
			Console.error("Select atleast one target language");
			process.exit(1);
		}

		extraConfig.to = target.data;
	}

	await updateConfig(configPath, "markdown", {
		model: modelRes.value === "auto" ? undefined : modelRes.value,
		source,
		destination,
		fileType: fileType.data.fileName,
		dataFile: dataFile.data?.fileName,
		...(extraConfig as Required<typeof extraConfig>),
	});

	Console.green(`Saved markdown config to ${configPath}`);
	await askAndRunCommand(markdownCmd);
});
