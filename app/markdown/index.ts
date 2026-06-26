import type { infer as Infer, ZodTypeAny } from "zod";
import {
	extensionZod,
	LanguageCodeSchema,
	languageCode,
	languageModelZod,
	markdownZod,
} from "@/config";
import { updateConfig } from "@/configuration";
import { DataJsonBuilder } from "@/data";
import { readMd, writeMd } from "@/file";
import { scanFiles } from "@/folder";
import { translateWithLLM } from "@/translate";

export const fileTypeZod = <T extends ZodTypeAny>(sz: T) =>
	z.string().transform((fileNameRaw) => {
		const fileName = fileNameRaw.trim();
		const [name, extension] = fileName.split(".");

		return {
			fileName,
			name,
			ext: sz.parse(extension) as Infer<T>,
		};
	});

export const options = z.object({
	source: z.string(),
	destination: z.string(),
	to: z.array(LanguageCodeSchema).optional(),
	all: z.boolean().optional(),
	redo: z.boolean().default(false),
	fileType: fileTypeZod(markdownZod).default("page.mdx"),
	dataFile: fileTypeZod(extensionZod).optional(),
	model: languageModelZod.default("sarvam-105b"),
});

export default Command<typeof options>(
	async ({ source, to, destination, fileType, redo, all, model, dataFile }) => {
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

		if (dataFile?.name)
			await updateConfig<{ translated: ReturnType<typeof dataJson.getData> }>(
				`${destination}/${dataFile.name}.${dataFile.ext}`,
				"translated",
				dataJson.getData(),
			);
	},
);
