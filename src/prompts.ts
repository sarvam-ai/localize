import { Console } from "mcmd";
import { runCMD } from "@/cmd";

export const askAndRunCommand = async (
	cmd: string,
	message = "Run this command now?",
) => {
	Console.green(`Run this next: ${cmd}`);
	const runRes = await Console.prompts({
		type: "confirm",
		name: "value",
		message,
		initial: true,
	});

	if (!runRes.value) {
		Console.blue("Skipped. You can run the command above any time.");
		process.exit(0);
	}

	const code = await runCMD(cmd);
	if (code !== 0) {
		Console.error(`Command failed with exit code ${code}`);
		process.exit(code);
	}

	process.exit(0);
};
