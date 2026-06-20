export const getCMD = (
	props: { from: string; model?: string } & ({ to: string[] } | { all: true }),
) =>
	`npx sarvam-localize translate ${props.model ? `--model ${props.model}` : ""} ${"all" in props ? "--all" : `--to ${props.to.join(" ")}`} --from ${props.from}`;
