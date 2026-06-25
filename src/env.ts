import { config } from "dotenv";
import { Console } from "mcmd";

export function assertEnv(): void {
	config({
		quiet: true,
	});

	const value = process.env.SARVAM_API_KEY;

	if (value === undefined || value.trim() === "") {
		Console.error("No Sarvam API Key found");
		Console.error(
			"Please set SARVAM_API_KEY in your .env file.",
		);
		Console.green("Get your key from: https://dashboard.sarvam.ai");
		process.exit(1);
	}
}
