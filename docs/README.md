# GitHub Actions Guide (for `sarvam-localize`)

This folder contains example GitHub Actions workflows to automatically generate locale files in pull requests.

## What these workflows do

- **`localize.yml`**: Runs on PR updates (when source locale/config changes) and commits generated locale files to the same PR branch.
- **`localize-on-comment.yml`**: Runs when a trusted contributor comments `/localize` on a PR.

> In this repository, these files are shown under `docs/.github/workflows/` as examples.
> In your own repository, place them in **`.github/workflows/`**.

## Prerequisites

Before enabling these workflows, make sure your repository has:

1. A valid `sarvam-localize` setup (`localize.json` present).
2. A source locale file (for example `locales/en-IN.json`).
3. A Node.js project with lockfile (`package-lock.json`) if you use `npm ci`.
4. Repository secret:
   - `SARVAM_API_KEY` (from https://dashboard.sarvam.ai)

Add the secret in:
`Settings -> Secrets and variables -> Actions -> New repository secret`

## 1) Auto-generate on PR updates (`localize.yml`)

### Trigger behavior

This workflow runs on:
- PR opened / synchronized / reopened
- only when configured paths are changed

Example path filters (adjust to your project):

```yml
paths:
  - locales/en-IN.json
  - localize.json
```

If your source file or config path is different, update this list.

### Safety checks included
- Skips bot loops (`github-actions[bot]`)
- Only pushes if PR branch belongs to same repository (not forks)

## 2) Generate on comment command (`localize-on-comment.yml`)

### Trigger behavior

Runs when someone comments `/localize` on a PR.

### Trust guard (recommended)

Only allow trusted users to trigger it:

- `OWNER`
- `MEMBER`
- `COLLABORATOR`

This protects write-token workflows from untrusted commenters.

### Fork PR behavior

If PR comes from a fork, workflow cannot push to contributor branch. The example posts a comment explaining this.

## Typical usage

1. Open or update a PR with locale source/config changes.
2. Auto workflow generates translated files and commits them.
3. If you need a manual rerun, a trusted maintainer comments:
   - `/localize`

## Common customizations

- Change generation command:
  - `npx sarvam-localize translate`
  - or `npx sarvam-localize translate --config ./path/to/localize.json`
- Update commit scope:
  - `git add locales` (current example)
  - use `git add -A` if output paths may vary
- Change Node version in `actions/setup-node`
- Add `[skip ci]` in commit message if your repo has push-triggered CI loops

## Troubleshooting

- **Workflow not triggered**
  - Check `paths` filter and event type.
- **No files committed**
  - Generation produced no diff (`git diff --cached --quiet`), expected behavior.
- **`npm ci` fails**
  - Ensure lockfile exists and dependencies are valid.
- **API/auth errors**
  - Verify `SARVAM_API_KEY` secret is set correctly.

## Minimal checklist

- [ ] Workflows copied to `.github/workflows/`
- [ ] `SARVAM_API_KEY` secret configured
- [ ] `paths` in `localize.yml` match your real files
- [ ] Trusted commenter guard enabled in `localize-on-comment.yml`
- [ ] `localize.json` and locale input paths are correct
