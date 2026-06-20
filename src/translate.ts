import { generateText } from "ai";
import { sarvam } from "sarvam-ai-sdk";
import { extraLanguageCode } from "./config";

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
