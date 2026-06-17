import { SarvamLanguageCodeSchema } from "@/config";
import { readJson, writeJson } from "@/file";
import { translate } from "@/translate";
import { options as syncOptions } from "../sync";

export const options = syncOptions
	.omit({
		to: true,
	})
	.extend({
		to: z.array(SarvamLanguageCodeSchema),
	});

export default Command<typeof options>(async ({ from, to, dist, mode }) => {
	const fromFilePath = `./${dist}/${from}.${mode}`;
	const fromData = await readJson(fromFilePath);

	for (const lang of to) {
		const toFilePath = `./${dist}/${lang}.${mode}`;
		const toData = await readJson(toFilePath);

		for (const [key, value] of fromData) {
			if (toData.has(key)) continue;

			const newValue = await translate(value, from, lang);
			toData.set(key, newValue);
		}
		await writeJson(toFilePath, toData);
		Console.log(`Done:`, toFilePath);
	}
});
