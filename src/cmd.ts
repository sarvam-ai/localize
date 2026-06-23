import { spawn } from "node:child_process";

export type TranslateCmdProps = {
	from: string;
	model?: string;
} & ({ to: string[] } | { all: true });

const getRuntime = () => {
	const userAgent = (process.env.npm_config_user_agent ?? "").toLowerCase();
	const execPath = (process.env.npm_execpath ?? "").toLowerCase();
	const hasBun =
		typeof (globalThis as { Bun?: unknown }).Bun !== "undefined" ||
		Boolean(process.versions["bun"]);

	if (hasBun || userAgent.includes("bun") || execPath.includes("bun")) {
		return "bun";
	}

	if (userAgent.includes("pnpm") || execPath.includes("pnpm")) {
		return "pnpm";
	}

	if (userAgent.includes("yarn") || execPath.includes("yarn")) {
		return "yarn";
	}

	if (
		userAgent.includes("deno") ||
		process.execPath.toLowerCase().includes("deno")
	) {
		return "deno";
	}

	return "npm";
};

const getPackageRunner = (pkg: string) => {
	const runtime = getRuntime();

	switch (runtime) {
		case "bun":
			return `bunx ${pkg}`;
		case "pnpm":
			return `pnpm dlx ${pkg}`;
		case "yarn":
			return `yarn dlx ${pkg}`;
		case "deno":
			return `deno run -A npm:${pkg}`;
		default:
			return `npx ${pkg}`;
	}
};

export const getCMD = (props: TranslateCmdProps) => {
	const model = props.model ? `--model ${props.model}` : "";
	const target = "all" in props ? "--all" : `--to ${props.to.join(" ")}`;
	const runner = getPackageRunner("sarvam-localize");

	return `${runner} translate ${model} ${target} --from ${props.from}`.trim();
};

export const runCMD = (cmd: string) =>
	new Promise<number>((resolve, reject) => {
		const child = spawn(cmd, {
			stdio: "inherit",
			shell: true,
		});

		child.on("error", reject);
		child.on("close", (code) => resolve(code ?? 1));
	});
