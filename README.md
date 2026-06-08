# LaroFund - Indie Game Funding Platform

LaroFund is a crowdfunding and revenue-sharing platform designed specifically for the Filipino indie game development scene. Built on the Stellar network, it leverages Classic Assets for game equity and Soroban smart contracts for automated, transparent revenue distribution.

## The Problem
Indie Filipino game developers often lack access to traditional development funding. Venturing into the global market requires capital for assets, marketing, and sustainability. Backers want to support local talent but need a transparent way to share in the game's success.

## The Solution
- **Game Equity as Tokens:** Developers issue specific Stellar assets (e.g., `LARO`) representing "shares" or equity in their game.
- **USDC Investment:** Backers invest USDC in exchange for these equity tokens.
- **Automated Revenue Share:** When the game generates revenue, developers distribute USDC through a Soroban contract. Equity holders can claim their proportional share of the revenue directly through the platform.

## Features
- **Project Exploration:** Discover and fund upcoming Filipino indie games.
- **Wallet Integration:** Seamless connection with Freighter wallet.
- **Investment Dashboard:** Track your game equity holdings and claim pending revenue.
- **Developer Tools:** Manage funding rounds and distribute revenue to backers.

## Tech Stack
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS (Cyber-Pinoy Theme).
- **Blockchain:** Stellar (Classic Assets + Soroban).
- **Contract:** Rust Soroban SDK.

## Getting Started

### Prerequisites
- **Node.js 20+**
- **Freighter Wallet** (set to Testnet)
- **Rust** and **Stellar CLI** (for contract deployment)

### Installation
1. Clone the repo.
2. Install dependencies:
   ```bash
   cd web
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Contract Deployment
1. Navigate to the root directory.
2. Build and deploy the contract:
   ```powershell
   # Windows
   .\scripts\deploy.ps1
   # macOS/Linux
   ./scripts/deploy.sh
   ```
3. Update `web/.env.local` with the `NEXT_PUBLIC_CONTRACT_ID` provided by the deploy script.

## Project Structure
- `web/`: Next.js frontend application.
- `contracts/laro-fund/`: Soroban smart contract for revenue distribution.
- `scripts/`: Deployment scripts for the Soroban contract.

## License
MIT
