import MarkDownInitCode from "../markdown/init/index";
import TranslateInitCode from "../translate/init/index";

export const options = z
	.object({
		config: z.string(),
		override: z.boolean().optional(),
	})
	.passthrough();

export default Command<typeof options>(async (data) => {
	const typeRes = await Console.prompts({
		type: "select",
		name: "value",
		message: "Select which kind of initalization you want to do",
		choices: [
			{
				title: "json translation",
				value: "translate",
			},
			{
				title: "markdown translation",
				value: "markdown",
			},
		],
	});

	switch (typeRes.value) {
		case "markdown":
			return MarkDownInitCode(data);
		case "translate":
			return TranslateInitCode(data);
		default: {
			Console.error("Wrong Selection");
		}
	}
});
