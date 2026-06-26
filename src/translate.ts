import { generateText } from "ai";
import { sarvam } from "sarvam-ai-sdk";
import { extraLanguageCode, languageDist } from "./config";

export const translate = async (
	text: string,
	from: string,
	to: string,
	suggestedModel?: Parameters<typeof sarvam.translation>[0],
	options?: Pick<
		Parameters<typeof sarvam.translation>[1],
		"numerals_format" | "output_script" | "mode" | "speaker_gender"
	>,
) => {
	const model =
		(extraLanguageCode as string[]).includes(from) ||
		(extraLanguageCode as string[]).includes(to)
			? "sarvam-translate:v1"
			: (suggestedModel ?? "mayura:v1");

	from = from === "en" ? "en-IN" : from;
	to = to === "en" ? "en-IN" : to;

	if (from === to) return text;

	const result = await generateText({
		model: sarvam.translation(model, {
			from,
			to,
			numerals_format: "international",
			mode: "formal",
			...options,
		}),
		prompt: text,
	});

	return result.text;
};

export const translateWithLLM = async (
	text: string,
	to: string,
	suggestedModel?: Parameters<typeof sarvam.languageModel>[0],
) => {
	to = to === "en" ? "en-IN" : to;
	const language = languageDist[to as "en-IN"];

	const result = await generateText({
		model: sarvam.languageModel(suggestedModel ?? "sarvam-105b"),
		system: [
			`Translate this markdown file to ${language ?? to} (${to})`,
			`- Don't write anything else, just do the translation.`,
			`- Don't alter any markdown format or html or javascript or react components.`,
			`- Don't alter any programming codeblocks or inline codes.`,
			`- Only translate the text contents, but make sure it perserve the same meaning.`,
			`- Use international numerals format. Don't use native numbers.`,
			`- If translation of a word does't exist, just use the original word without altering.`,
			`- Don't wrap the translation inside "\`\`\`"`,
		].join("/n"),
		prompt: text,
	});

	console.log(result.text);

	return result.text;
};

export const defaultEnglistJson = () =>
	JSON.stringify(
		{
			welcome: "Welcome to India",
			greeting: "Hello, how are you?",
			farewell: "Goodbye, see you soon!",
			thank_you: "Thank you for your support!",
		},
		null,
		4,
	);
