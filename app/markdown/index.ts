import type { infer as Infer } from "zod";
import {
	LanguageCodeSchema,
	languageCode,
	languageModelZod,
	markdownZod,
} from "@/config";
import { readMd, writeMd } from "@/file";
import { scanFiles } from "@/folder";
import { translateWithLLM } from "@/translate";

const fileTypeZod = z.string().transform((fileName, ctx) => {
	const [name, extension] = fileName.split(".");

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

type DataJson = {
	[source: string]: {
		id: string;
		languages: Infer<typeof options.shape.to>;
	}[];
};

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

		const dataJson: DataJson = {
			[source]: [],
		};

		for (const scan of scanResult) {
			const id = scan.folder;
			const sourceFile = scan.files[0];

			if (!sourceFile) continue;

			const fromContent = await readMd(sourceFile.path);

			if (!fromContent) {
				Console.warn(`Skipping file: ${sourceFile.path}`);
				continue;
			}

			dataJson[source]?.push({ id, languages: [] });

			for (const lang of toLang) {
				const toFilePath = `./${destination}/${id}/${lang}.${fileType.ext}`;
				const toContent = await readMd(toFilePath, false);

				if (!redo && toContent) continue;

				const newContent = await translateWithLLM(fromContent, lang, model);

				await writeMd(toFilePath, newContent);
				Console.log(`Done:`, toFilePath);
			}
		}
	},
);
