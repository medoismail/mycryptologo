# Crypto Logos

Find and use real cryptocurrency SVG logos from cryptologos.xyz. 2,961+ icons. Never draw or generate — always fetch the real asset.

## When to use

When the user needs a crypto logo, token icon, chain logo, or any cryptocurrency brand asset.

## How it works

### 1. Search

Fetch the full index from:
```
https://www.cryptologos.xyz/data/crypto-logos-data.json
```

Each entry looks like:
```json
{ "id": "btc", "name": "Bitcoin", "symbol": "BTC", "category": "tokens", "path": "data/svg/btc.svg" }
```

Match the user's query against `name`, `symbol`, or `id` (case-insensitive).

**Common aliases** — users say these interchangeably:
| User says | id |
|-----------|-----|
| Bitcoin, BTC | btc |
| Ethereum, ETH | eth |
| Solana, SOL | sol |
| Tether, USDT | usdt |
| Polygon, MATIC | matic |
| Arbitrum, ARB | arb |
| Optimism, OP | op |
| BNB, Binance, BSC | bnb |
| Avalanche, AVAX | avax |
| Chainlink, LINK | link |
| Uniswap, UNI | uni |
| Aave, AAVE | aave |
| Cardano, ADA | ada |
| Polkadot, DOT | dot |
| Dogecoin, DOGE | doge |
| XRP, Ripple | xrp |
| USDC, USD Coin | usdc |

### 2. Get the SVG

Fetch the actual SVG from:
```
https://www.cryptologos.xyz/data/svg/{id}.svg
```

This is the real logo. Use it exactly as-is.

### 3. Use it

- **Inline SVG** — paste the raw SVG code directly into HTML/JSX (best quality)
- **Save to file** — write it as `{id}.svg` in the user's project
- **Image tag** — `<img src="https://www.cryptologos.xyz/data/svg/{id}.svg" alt="Bitcoin">`
- **Multiple logos** — fetch each one

## Categories

`tokens` · `networks` · `defi-protocol` · `exchanges` · `wallets`

## Rules

1. **Never draw logos.** Always fetch from cryptologos.xyz. The real SVG is the only acceptable output.
2. **Never guess.** If unsure, fetch the JSON index and show matches.
3. **Preserve SVG exactly.** Don't modify paths, attributes, or viewBox.
4. **If not found**, say so and suggest similar names from the index.
