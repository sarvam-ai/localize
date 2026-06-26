import type { infer as Infer } from "zod";
import type { LanguageCodeSchema } from "./config";

type LanguageCode = Infer<typeof LanguageCodeSchema>;

type DataJson = {
	id: string;
	languages: LanguageCode[];
}[];

export class DataJsonBuilder {
	private dataJson: DataJson;

	constructor(defaultValues: DataJson = []) {
		this.dataJson = defaultValues;
	}

	populateSource(id: string, language: LanguageCode) {
		let sourceEntry = this.dataJson.find((entry) => entry.id === id);

		if (!sourceEntry) {
			sourceEntry = { id, languages: [] };
			this.dataJson.push(sourceEntry);
		}

		if (!sourceEntry.languages.includes(language)) {
			sourceEntry.languages.push(language);
		}
	}

	addLanguages(id: string, languages: LanguageCode[]) {
		for (const language of languages) {
			this.populateSource(id, language);
		}
	}

	getData() {
		return this.dataJson;
	}
}
