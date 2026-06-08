# LaroFund - Indie Game Funding Platform

## Idea
- **Track:** DeFi & RWA / Social Impact
- **Idea #:** Custom
- **One-liner:** Empowers Filipino indie game developers to raise funding by issuing game equity as Stellar assets and sharing revenue via Soroban.

## Problem
Indie Filipino game developers often lack access to traditional development funding. Venturing into the global market requires capital for assets, marketing, and sustainability. Backers want to support local talent but need a transparent way to share in the game's success.

## How it uses Stellar
- **Equity Tokens (Classic Assets):** Represents ownership/shares in a specific game project.
- **USDC (Anchor Asset):** Used for investments and revenue distributions.
- **Soroban Contract:** Automates the revenue sharing logic. When a developer deposits revenue into the contract, equity holders can claim their proportional share in USDC.
- **Trustlines:** Ensures secure handling of game-specific equity tokens.

## What works in the demo
- [ ] Connect wallet (Freighter, testnet)
- [ ] Issue/Receive game equity tokens
- [ ] Fund projects with USDC
- [ ] Claim revenue share via Soroban

## Setup / run
- Network: **testnet**
- `cd web && npm install && npm run dev`
- Contract: `contracts/laro-fund`, deploy using `scripts/deploy.ps1`
- Env: Set `NEXT_PUBLIC_CONTRACT_ID` in `web/.env.local`

## Demo
- Video Link: TBD
- Repo Link: TBD
