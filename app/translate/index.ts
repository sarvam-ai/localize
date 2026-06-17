import { SarvamLanguageCodeSchema } from "@/config";
import { readJson, writeJson } from "@/file";
import { translate } from "@/translate";
import { options as syncOptions } from "../sync";

export const options = syncOptions
	.omit({
		to: true,
	})
	.extend({
		to: z.array(SarvamLanguageCodeSchema).optional(),
		all: z.boolean().optional(),
	});

export default Command<typeof options>(
	async ({ from, to, dist, mode, incremental, all }) => {
		const fromFilePath = `./${dist}/${from}.${mode}`;
		const fromData = await readJson(fromFilePath);
		const languages =
			(to ?? all) ? Object.keys(SarvamLanguageCodeSchema.enum) : [];

		if (!languages.length) {
			Console.error("No target languages specified. Use --to or --all flag.");
		}

		for (const lang of languages) {
			const toFilePath = `./${dist}/${lang}.${mode}`;
			const toData = await readJson(toFilePath, false);

			for (const [key, value] of fromData) {
				if (incremental && toData.has(key)) continue;

				const newValue = await translate(value, from, lang);
				toData.set(key, newValue);
			}
			await writeJson(toFilePath, toData);
			Console.log(`Done:`, toFilePath);
		}
	},
);
