import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./.mcmd/cli.ts"],
	format: ["esm"],
	dts: false,
	banner: {
		js: "#!/usr/bin/env node",
	},
});
