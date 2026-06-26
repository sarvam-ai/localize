import {
	LanguageCodeSchema,
	languageCode,
	languageModelZod,
	markdownZod,
} from "@/config";
import { DataJsonBuilder } from "@/data";
import { readMd, writeMd } from "@/file";
import { scanFiles } from "@/folder";
import { translateWithLLM } from "@/translate";

export const fileTypeZod = z.string().transform((fileName) => {
	const [name, extension] = fileName.trim().split(".");

	return {
		name: name,
		ext: markdownZod.parse(extension),
	};
});

export const options = z.object({
	source: z.string(),
	destination: z.string(),
	to: z.array(LanguageCodeSchema).optional(),
	all: z.boolean().optional(),
	redo: z.boolean().default(false),
	fileType: fileTypeZod.default("page.mdx"),
	model: languageModelZod.default("sarvam-105b"),
});

export default Command<typeof options>(
	async ({ source, to, destination, fileType, redo, all, model }) => {
		const scanResult = await scanFiles(source, (name, ext) => {
			if (ext !== fileType.ext) return false;
			if (name !== fileType.name) return false;
			return true;
		});

		const toLang = to?.length ? to : all ? languageCode : [];

		if (!toLang.length) {
			Console.error("No target languages specified. Use --to or --all flag.");
			process.exit(1);
		}

		const dataJson = new DataJsonBuilder();

		for (const scan of scanResult) {
			const id = scan.folder;
			const sourceFile = scan.files[0];

			if (!sourceFile) continue;

			const fromContent = await readMd(sourceFile.path);

			if (!fromContent) {
				Console.warn(`Skipping file: ${sourceFile.path}`);
				continue;
			}

			for (const lang of toLang) {
				const toFilePath = `./${destination}/${id}/${lang}.${fileType.ext}`;
				const toContent = await readMd(toFilePath, false);

				if (!redo && toContent) continue;

				const newContent = await translateWithLLM(fromContent, lang, model);

				await writeMd(toFilePath, newContent);
				dataJson.populateSource(id, lang);
				Console.log(`Done:`, toFilePath);
			}
		}

		Console.log(dataJson.getData());
	},
);
