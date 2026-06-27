<a href="https://github.com/sarvam-ai/localize">
    <img alt="cover" src="https://github.com/sarvam-ai/localize/blob/main/cover.png?raw=true" />
</a>

# Sarvam Localize

Website localization CLI powered by Sarvam AI translation.

`sarvam-localize` helps you translate JSON locale & markdown files across Indian languages while preserving nested key structure and variables.

## Requirements

Get your key from: https://dashboard.sarvam.ai.

And paste it on `.env` file

```bash
SARVAM_API_KEY=your_api_key
```

## Install

Run without installing:

```bash
npx sarvam-localize
```

## Config File

Run `init` to creates or updates a config file (default: `localize.json`).

```jsonc
{
	"translate": {
		"dist": "locales",
		"from": "en-IN",
		"extension": "json",
		"to": ["ml-IN", "ta-IN"]
		// or use: "all": true
		// optional "model": "mayura:v1"
	},
	"markdown": {
		"source": "content",
		"destination": "localized",
		"fileType": "page.mdx",
		"to": ["hi-IN", "ta-IN"]
		// or use: "all": true
		// optional: "dataFile": "localize.json"
		// optional: "model": "sarvam-105b"
	}
}
```

CLI flags are only needed when you want to override config values for a specific run.

## Commands

###  `init`

Interactive setup for your localization workflow. It prepares your config file.

Supports `--config ./path-to-config.json` to use a custom config file. Default is `localize.json`.

```bash
npx sarvam-localize init
npx sarvam-localize init --config ./path-to-config.json

npx sarvam-localize translate init
npx sarvam-localize translate init --config ./path-to-config.json

npx sarvam-localize markdown init
npx sarvam-localize markdown init --config ./path-to-config.json
```

### `translate`

Batch translates a source locale file into target locale files.

Uses values from config (`localize.json`) when available.

```bash
npx sarvam-localize translate
npx sarvam-localize translate --redo
npx sarvam-localize translate --config ./path-to-config.json
npx sarvam-localize translate --from en-IN --to hi-IN ta-IN ml-IN
npx sarvam-localize translate --from en-IN --all
npx sarvam-localize translate --from en-IN --all --redo
```

#### Options

- `--config <path>`: custom config file path (default: `localize.json`)
- `--dist <folder>`: locale directory (default: `locales`)
- `--from <code>`: source language code (default: `en-IN`)
- `--to <code...>`: target language codes (array)
- `--all`: include all supported target languages
- `--redo`: redo keys even if target already has values
- `--extension <json>`: file extension (currently only `json`)

### `translate sync`

Translates one source file into one target file.

```bash
npx sarvam-localize translate sync --source locales/en-IN.json --target locales/hi-IN.json
npx sarvam-localize translate sync --config ./path-to-config.json --source locales/en-IN.json --target locales/hi-IN.json
npx sarvam-localize translate sync --source locales/en-IN.json --target locales/ta-IN.json --redo
```

#### Options

- `--config <path>`: custom config file path (default: `localize.json`)
- `--source <path>`: source locale file path (e.g. `locales/en-IN.json`)
- `--target <path>`: target locale file path (e.g. `locales/hi-IN.json`)
- `--redo`: overwrite already translated keys

Both file names must include a supported language code and `.json` extension.


### Locale file format 

eg: Input (`en-IN.json`)

Variables and Nested JSON is supported.

```jsonc
{
	"title": "Welcome to India",
	"home": {
		"greeting": "Hello {{variable}}, how are you?", // React i18next
		"farewell": "Goodbye {variable}, see you soon!", // Vue i18n, React Intl
		"thank_you": "Thank you %{variable}, for your support!", // Ruby i18n
		"cta": "Click here to learn more about {$variable}" // Fluent
	}
}
```

See [Demo Website](https://sarvam-localize.vercel.app) built using NextJS & next-intl

### `markdown`

Batch translates markdown/mdx files found under a source directory.

Uses values from config (`localize.json`) when available.

It scans folders in `--source` for files matching `--fileType` (default: `page.mdx`),
then writes translated files to:

`<destination>/<relative-folder>/<language>.<ext>`

```bash
npx sarvam-localize markdown
npx sarvam-localize markdown --config ./path-to-config.json
npx sarvam-localize markdown --redo
npx sarvam-localize markdown --source content --destination localized --to hi-IN ta-IN
npx sarvam-localize markdown --source content --destination localized --all
npx sarvam-localize markdown --source content --destination localized --to ml-IN --fileType doc.md
```

#### Options

- `--config <path>`: custom config file path (default: `localize.json`)
- `--source <folder>`: source directory to scan for markdown files
- `--destination <folder>`: output directory for translated files
- `--to <code...>`: target language codes (array)
- `--all`: include all supported target languages
- `--redo`: redo even if target markdown already exists
- `--fileType <name.ext>`: markdown file name pattern to scan (default: `page.mdx`)
- `--dataFile <name.ext>`: optional file to update with generated `translated` mapping
- `--model <id>`: translation model (default: `sarvam-105b`)

If neither `--to` nor `--all` is provided, the command exits with an error.

See [Demo Website](https://sarvam-localize.vercel.app/docs/something) built using NextJS & `@next/mdx`

### Supported language codes by `mayura:v1`

- `en-IN` (English - India)
- `hi-IN` (Hindi)
- `bn-IN` (Bengali)
- `gu-IN` (Gujarati)
- `kn-IN` (Kannada)
- `ml-IN` (Malayalam)
- `mr-IN` (Marathi)
- `od-IN` (Odia)
- `pa-IN` (Punjabi)
- `ta-IN` (Tamil)
- `te-IN` (Telugu)

### Supported language codes by `sarvam-translate:v1`

- All of the above plus:

- `as-IN` (Assamese)
- `ur-IN` (Urdu)
- `ne-IN` (Nepali)
- `kok-IN` (Konkani)
- `ks-IN` (Kashmiri)
- `sd-IN` (Sindhi)
- `sa-IN` (Sanskrit)
- `sat-IN` (Santali)
- `mni-IN` (Manipuri)
- `brx-IN` (Bodo)
- `mai-IN` (Maithili)
- `doi-IN` (Dogri)

### Project structure (typical)

```text
locales/
  en-IN.json
  hi-IN.json
  ta-IN.json
```

## Notes

- If a target key already exists, it is skipped by default.
- Use `--redo` to force updates.
- Default config file name is `localize.json`.
- Pass `--config ./custom.json` to use a custom config file.
- If config already exists, `init --override` can update the config.
