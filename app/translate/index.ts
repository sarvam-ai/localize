import { extensionZod, SarvamLanguageCodeSchema } from "@/config";
import { readJson, writeJson } from "@/file";
import { translate } from "@/translate";

export const options = z.object({
	dist: z.string().default("locales"),
	from: SarvamLanguageCodeSchema.default("en-IN"),
	to: z.array(SarvamLanguageCodeSchema).optional(),
	all: z.boolean().optional(),
	retranslate: z.boolean().default(false),
	extension: extensionZod.default("json"),
});

export default Command<typeof options>(
	async ({ from, to, dist, extension, retranslate, all }) => {
		const fromFilePath = `./${dist}/${from}.${extension}`;
		const fromData = await readJson(fromFilePath);
		const languages =
			(to ?? all) ? Object.keys(SarvamLanguageCodeSchema.enum) : [];

		if (!languages.length) {
			Console.error("No target languages specified. Use --to or --all flag.");
		}

		for (const lang of languages) {
			const toFilePath = `./${dist}/${lang}.${extension}`;
			const toData = await readJson(toFilePath, false);

			for (const [key, value] of fromData) {
				if (!retranslate && toData.has(key)) continue;

				const newValue = await translate(value, from, lang);
				toData.set(key, newValue);
			}
			await writeJson(toFilePath, toData);
			Console.log(`Done:`, toFilePath);
		}
	},
);
