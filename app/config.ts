import { mergeObjects } from "mcmd/engine";
import { readConfig } from "@/configuration";
import { assertEnv } from "@/env";

export default defineConfig({
	parser: {
		string: ["config"],
		array: ["to"],
	},
	hook: {
		before: async () => {
			assertEnv();
		},
		extra: async (cmd, data) => {
			const config = (data as { config: string }).config ?? "localize.json";
			const defaultPath = config === "localize.json";

			const configContent = await readConfig(config);
			const mainCmd = cmd[0];

			switch (mainCmd) {
				case "init":
					return mergeObjects({ config, defaultPath }, configContent);
				case "translate":
					return mergeObjects(
						{ config, defaultPath },
						configContent?.translate,
					);
				case "markdown":
					return mergeObjects({ config, defaultPath }, configContent?.markdown);
				default:
					return {};
			}
		},
	},
});
