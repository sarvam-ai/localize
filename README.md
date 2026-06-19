<a href="https://github.com/sarvam-ai/localize">
    <img alt="cover" src="https://github.com/sarvam-ai/localize/blob/main/cover.png?raw=true" />
</a>

# Sarvam Localize

Website localization CLI powered by Sarvam AI translation.

`sarvam-localize` helps you translate JSON locale files across Indian languages while preserving nested key structure.

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

## Commands

###  `init`

Interactive setup for your localization workflow.

```bash
npx sarvam-localize init
```

### `sarvam-localize translate`

Batch translates a source locale file into target locale files.

```bash
npx sarvam-localize translate --from en-IN --to hi-IN ta-IN ml-IN
npx sarvam-localize translate --from en-IN --all
npx sarvam-localize translate --from en-IN --all --retranslate
```

#### Options

- `--dist <folder>`: locale directory (default: `locales`)
- `--from <code>`: source language code (default: `en-IN`)
- `--to <code...>`: target language codes (array)
- `--all`: include all supported target languages
- `--retranslate`: retranslate keys even if target already has values
- `--extension <json>`: file extension (currently only `json`)

### `sync`

Translates one source file into one target file.

```bash
npx sarvam-localize sync --source locales/en-IN.json --target locales/hi-IN.json
npx sarvam-localize sync --source locales/en-IN.json --target locales/ta-IN.json --retranslate
```

#### Options

- `--source <path>`: source locale file path (e.g. `locales/en-IN.json`)
- `--target <path>`: target locale file path (e.g. `locales/hi-IN.json`)
- `--retranslate`: overwrite already translated keys

Both file names must include a supported language code and `.json` extension.


### Locale file format 

eg: Input (`en-IN.json`)

Nested JSON is supported.

```json
{
    "home": {
        "title": "Welcome to India",
        "cta": "Get started"
    }
}
```

The CLI flattens keys internally (`home.title`, `home.cta`) and writes them back as nested JSON in target files.

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
- Use `--retranslate` to force updates.

##
