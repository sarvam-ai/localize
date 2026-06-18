import { extensionZod, SarvamLanguageCodeSchema } from "@/config";
import { readJson, writeJson } from "@/file";
import { translate } from "@/translate";

const filePathZod = z.string().transform((path, ctx) => {
	const fileName = path.split("/").pop();

	if (!fileName) {
		ctx.addIssue({
			code: "custom",
			message: "Invalid file path",
		});
		return z.NEVER;
	}

	const [language, extension] = fileName.split(".");

	return {
		src: path,
		language: SarvamLanguageCodeSchema.parse(language),
		extension: extensionZod.parse(extension),
	};
});

export const options = z.object({
	source: filePathZod,
	target: filePathZod,
	retranslate: z.boolean().default(false),
});

export default Command<typeof options>(
	async ({ source, target, retranslate }) => {
		Console.log(
			`Translations from ${source.language} to ${target.language}...`,
		);

		const from = source.language;
		const fromFilePath = source.src;
		const fromData = await readJson(fromFilePath);

		const to = target.language;
		const toFilePath = target.src;
		const toData = await readJson(toFilePath, false);

		for (const [key, value] of fromData) {
			if (!retranslate && toData.has(key)) continue;

			const newValue = await translate(value, from, to);
			toData.set(key, newValue);
		}

		await writeJson(toFilePath, toData);

		Console.log(`Translation Done`);
	},
);
