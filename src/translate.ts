import { generateText } from "ai";
import { sarvam } from "sarvam-ai-sdk";

export const translate = async (text: string, from: string, to: string) => {
	const result = await generateText({
		model: sarvam.translation("mayura:v1", {
			from,
			to,
		}),
		prompt: text,
	});

	return result.text;
};
