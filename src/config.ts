import { z } from "zod";

/**
 * Specifies the language in BCP-47 format.
 */

export const baseLanguageDist = {
	"hi-IN": "Hindi",
	"bn-IN": "Bengali",
	"kn-IN": "Kannada",
	"ml-IN": "Malayalam",
	"mr-IN": "Marathi",
	"od-IN": "Odia",
	"pa-IN": "Punjabi",
	"ta-IN": "Tamil",
	"te-IN": "Telugu",
	"en-IN": "English (India)",
	"gu-IN": "Gujarati",
} as const;

export const extraLanguageDist = {
	"as-IN": "Assamese",
	"ur-IN": "Urdu",
	"ne-IN": "Nepali",
	"kok-IN": "Konkani",
	"ks-IN": "Kashmiri",
	"sd-IN": "Sindhi",
	"sa-IN": "Sanskrit",
	"sat-IN": "Santali",
	"mni-IN": "Manipuri",
	"brx-IN": "Bodo",
	"mai-IN": "Maithili",
	"doi-IN": "Dogri",
} as const;

export const baseLanguageCode = Object.keys(baseLanguageDist);
export const BaseLanguageCodeSchema = z.enum(["en", ...baseLanguageCode]);

export const extraLanguageCode = Object.keys(extraLanguageDist);
export const ExtraLanguageCodeSchema = z.enum(["en", ...extraLanguageCode]);

export const languageDist = {
	...baseLanguageDist,
	...extraLanguageDist,
} as const;
export const languageCode = Object.keys(languageDist);
export const LanguageCodeSchema = z.enum(["en", ...languageCode]);

export const modelZod = z.enum(["mayura:v1", "sarvam-translate:v1"]);

export const extensionZod = z.enum(["json"]);
