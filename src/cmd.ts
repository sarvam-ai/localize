export const getCMD = (
	props: { from: string } & ({ to: string[] } | { all: true }),
) =>
	`npx sarvam-localize translate ${"all" in props ? "--all" : `--to ${props.to.join(" ")}`} --from ${props.from}`;
