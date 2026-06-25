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
			const configPath = (data as { config: string }).config ?? "localize.json";
			const config = await readJsonRaw<ConfigFile>(configPath, false);
			const mainCmd = cmd[0];

			switch (mainCmd) {
				case "translate":
					return config.translate ?? {};
				default:
					return {};
			}
		},
	},
});
