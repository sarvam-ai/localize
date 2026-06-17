import { SarvamLanguageCodeSchema } from "@/config";
import { readJson, writeJson } from "@/file";
import { translate } from "@/translate";

export const alias = "i";

export const options = z.object({
	from: SarvamLanguageCodeSchema.default("en-IN"),
	to: SarvamLanguageCodeSchema,
	dist: z.string().default("locales"),
	mode: z.enum(["json"]).default("json"),
});

export default Command<typeof options>(async ({ from, to, dist, mode }) => {
	Console.log(`Translations from ${from} to ${to}...`);

	const fromFilePath = `./${dist}/${from}.${mode}`;
	const jsonData = await readJson(fromFilePath);
	const jsonEntry = Object.entries(jsonData);

	const translated = {} as Record<string, string>;

	for (const [key, value] of jsonEntry) {
		const newValue = await translate(value, from, to);
		translated[key] = newValue;
	}

	const toFilePath = `./${dist}/${to}.${mode}`;
	await writeJson(toFilePath, translated);

	Console.log(`Translation Done`);
});
