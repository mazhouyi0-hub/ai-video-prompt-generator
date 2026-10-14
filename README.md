# PromptReel — AI Video Prompt Generator

A free, static, no-backend tool site that turns structured choices into
ready-to-paste AI video prompts. Pages:

- `/` — AI Video Prompt Generator (all models)
- `/veo-3-prompt-generator/` — Veo 3 / 3.1, with JSON output
- `/sora-2-prompt-generator/` — Sora 2

## Run locally
Any static server, e.g. `python3 -m http.server 8000` in this folder.

## Test
`node tests/test.mjs` — unit tests for the prompt assembly logic.

## Deploy
See `02-deployment.md`. Root directory is the site; no build step.
Canonical/sitemap URLs use `https://example.com` as a placeholder —
replace with the real domain before submitting to Google Search Console.
