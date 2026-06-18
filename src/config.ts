import { z } from "zod";

/**
 * Specifies the language in BCP-47 format.
 */

export const SarvamLanguageCodeSchema = z.enum([
	"hi-IN", // Hindi
	"bn-IN", // Bengali
	"kn-IN", // Kannada
	"ml-IN", // Malayalam
	"mr-IN", // Marathi
	"od-IN", // Odia
	"pa-IN", // Punjabi
	"ta-IN", // Tamil
	"te-IN", // Telugu
	"en-IN", // English (India)
	"gu-IN", // Gujarati
]);

export const MoreSarvamLanguageCodeSchema = z.enum([
	"as-IN", // Assamese
	"ur-IN", // Urdu
	"ne-IN", // Nepali
	"kok-IN", // Konkani
	"ks-IN", // Kashmiri
	"sd-IN", // Sindhi
	"sa-IN", // Sanskrit
	"sat-IN", // Santali
	"mni-IN", // Manipuri
	"brx-IN", // Bodo
	"mai-IN", // Maithili
	"doi-IN", // Dogri
]);

export type MoreSarvamLanguageCode = z.infer<
	typeof MoreSarvamLanguageCodeSchema
>;

export type SarvamLanguageCode = z.infer<typeof SarvamLanguageCodeSchema>;

export const extensionZod = z.enum(["json"]);
