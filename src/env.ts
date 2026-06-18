import { Console } from "mcmd";

export function assertEnv(
	requiredVars: string[] = ["SARVAM_API_KEY"],
	env: NodeJS.ProcessEnv = process.env,
): void {
	const missing = requiredVars.filter((key) => {
		const value = env[key];
		return value === undefined || value.trim() === "";
	});

	if (missing.length > 0) {
		Console.error("No Sarvam API Key found");
		Console.error(
			"Please set the SARVAM_API_KEY environment variable in .env file to continue.",
		);
		Console.green("Get your key from: https://dashboard.sarvam.ai");
		process.exit(1);
	}
}
