export interface JsonTranslation {
	[key: string]: string | JsonTranslation;
}

/**
 * Flatten nested JSON to dot notation keys.
 * Example: {user: {name: "Name"}} -> {"user.name": "Name"}
 */
export function flattenJson(obj: object, prefix = ""): Map<string, string> {
	const result = new Map<string, string>();

	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (typeof value === "string") {
			result.set(fullKey, value);
		} else if (typeof value === "object" && value !== null) {
			const nested = flattenJson(value, fullKey);
			for (const [nestedKey, nestedValue] of nested) {
				result.set(nestedKey, nestedValue);
			}
		}
	}

	return result;
}

/**
 * Unflatten dot notation keys back to nested JSON.
 * Example: {"user.name": "Name"} -> {user: {name: "Name"}}
 */
export function unflattenJson(translations: Map<string, string>): object {
	const result: JsonTranslation = {};

	for (const [key, value] of translations) {
		const parts = key.split(".");
		let current: JsonTranslation = result;

		for (const part of parts.slice(0, -1)) {
			if (typeof current[part] !== "object" || current[part] === null) {
				current[part] = {};
			}
			current = current[part] as JsonTranslation;
		}

		const last = parts[parts.length - 1] as string;
		current[last] = value;
	}

	return result;
}
