import { generateText } from "ai";
import { sarvam } from "sarvam-ai-sdk";

export const translate = async (text: string, from: string, to: string) => {
	const result = await generateText({
		model: sarvam.translation("mayura:v1", {
			from,
			to,
			numerals_format: "international",
			mode: "formal",
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
