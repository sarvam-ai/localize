import { SarvamLanguageCodeSchema } from "@/config";
import { readJson, writeJson } from "@/file";
import { translate } from "@/translate";

export const options = z.object({
	from: SarvamLanguageCodeSchema.default("en-IN"),
	to: SarvamLanguageCodeSchema,
	dist: z.string().default("locales"),
	mode: z.enum(["json"]).default("json"),
	incremental: z.boolean().default(true),
});

export default Command<typeof options>(
	async ({ from, to, dist, mode, incremental }) => {
		Console.log(`Translations from ${from} to ${to}...`);

		const fromFilePath = `./${dist}/${from}.${mode}`;
		const fromData = await readJson(fromFilePath);

		const toFilePath = `./${dist}/${to}.${mode}`;
		const toData = await readJson(toFilePath, false);

		for (const [key, value] of fromData) {
			if (incremental && toData.has(key)) continue;

			const newValue = await translate(value, from, to);
			toData.set(key, newValue);
		}

		await writeJson(toFilePath, toData);

		Console.log(`Translation Done`);
	},
);
