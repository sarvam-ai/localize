import {
	extensionZod,
	LanguageCodeSchema,
	languageCode,
	translationModelZod,
} from "@/config";
import { readJson, writeJson } from "@/file";
import { translate } from "@/translate";

export const options = z.object({
	dist: z.string().default("locales"),
	from: LanguageCodeSchema.default("en"),
	to: z.array(LanguageCodeSchema).optional(),
	all: z.boolean().optional(),
	retranslate: z.boolean().default(false),
	extension: extensionZod.default("json"),
	model: translationModelZod.default("mayura:v1"),
});

export default Command<typeof options>(
	async ({ from, to, dist, extension, retranslate, all, model }) => {
		const fromFilePath = `./${dist}/${from}.${extension}`;
		const fromData = await readJson(fromFilePath);
		const toLang = to?.length ? to : all ? languageCode : [];

		if (!toLang.length) {
			Console.error("No target languages specified. Use --to or --all flag.");
			process.exit(1);
		}

		for (const lang of toLang) {
			const toFilePath = `./${dist}/${lang}.${extension}`;
			const toData = await readJson(toFilePath, false);

			for (const [key, value] of fromData) {
				if (!retranslate && toData.has(key)) continue;

				const newValue = await translate(value, from, lang, model);
				toData.set(key, newValue);
			}
			await writeJson(toFilePath, toData);
			Console.log(`Done:`, toFilePath);
		}
	},
);
