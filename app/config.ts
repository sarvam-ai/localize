import { mergeObjects } from "mcmd/engine";
import { assertEnv } from "@/env";
import { readJsonRaw } from "@/file";

export type ConfigFile = {
	translate?: {
		model: string;
		dist: string;
		from: string;
		extension: "json";
	} & (
		| {
				to: string[];
		  }
		| {
				all: boolean;
		  }
	);
	markdown?: {
		model: string;
		scan: {
			directory: string;
			fileName: string;
		};
		out: {
			directory: string;
			jsonFile?: string;
		};
	};
};

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

			const configContent = await readJsonRaw<ConfigFile>(config, false);
			const mainCmd = cmd[0];

			switch (mainCmd) {
				case "init":
					return mergeObjects({ config, defaultPath }, configContent);
				case "translate":
					return mergeObjects({ config, defaultPath }, configContent.translate);
				case "markdown":
					return mergeObjects({ config, defaultPath }, configContent.markdown);
				default:
					return {};
			}
		},
	},
});
