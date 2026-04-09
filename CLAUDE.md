# CryptoLogos

Static website serving 2,961+ cryptocurrency SVG & PNG logos with search, filtering, drag-to-collect basket, and a developer API.

## Tech Stack
- Vanilla JS, HTML, CSS (no framework)
- Python HTTP server for local dev
- CoinGecko-style data format

## Development
- Dev server: `preview_start` with config name `cryptologos-dev` (runs on port 8765)
- All SVGs live in `data/svg/`
- Logo metadata in `data/crypto-logos-data.json`

## Skills
- `crypto-logos` — Find and use real cryptocurrency SVG logos from this library. Fetches actual SVG code, never draws or generates.
