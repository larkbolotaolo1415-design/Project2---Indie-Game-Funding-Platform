# Deploy the savings-goal contract to Stellar testnet, then write the contract
# ID into web\.env.local so the frontend can call it.
#
# Prereqs (from the workshop setup checklist): Rust + the wasm32v1-none target,
# and the Stellar CLI (run `stellar --version` to confirm).
#
# Usage:  .\scripts\deploy.ps1 [identityName]   (default identity: workshop)

param([string]$Identity = "workshop")

$ErrorActionPreference = "Stop"
$Network = "testnet"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Wasm = "target\wasm32v1-none\release\laro_fund.wasm"
$EnvFile = Join-Path $Root "web\.env.local"

Set-Location $Root

# 1. Ensure a funded testnet identity exists
$keys = stellar keys ls
if ($keys -notcontains $Identity) {
  Write-Host "Creating + funding testnet identity '$Identity'..."
  stellar keys generate $Identity --network $Network --fund
}
$IdentityAddress = (stellar keys address $Identity).Trim()

# 2. Setup Assets (SAC)
Write-Host "Setting up Demo USDC (SAC)..."
$UsdcSac = (stellar contract asset deploy --asset USDC:$IdentityAddress --source-account $Identity --network $Network).Trim()
Write-Host "USDC SAC: $UsdcSac"

Write-Host "Setting up Demo Equity (LARO, SAC)..."
$EquitySac = (stellar contract asset deploy --asset LARO:$IdentityAddress --source-account $Identity --network $Network).Trim()
Write-Host "LARO SAC: $EquitySac"

# 3. Build the contract to wasm
Write-Host "Building contract..."
stellar contract build

# 4. Deploy to testnet
Write-Host "Deploying LaroFund to $Network..."
$ContractId = (stellar contract deploy --wasm $Wasm --source-account $Identity --network $Network).Trim()
Write-Host "Deployed contract ID: $ContractId"

# 5. Initialise LaroFund
Write-Host "Initialising LaroFund (1M shares)..."
try {
  stellar contract invoke --id $ContractId --source-account $Identity --network $Network -- init --admin $IdentityAddress --usdc_asset $UsdcSac --equity_asset $EquitySac --total_shares 1000000
} catch {
  Write-Host "(init skipped - contract may already be initialised)"
}

# 6. Write to web\.env.local
if (Test-Path $EnvFile) {
  (Get-Content $EnvFile) | Where-Object { $_ -notmatch '^NEXT_PUBLIC_CONTRACT_ID=' -and $_ -notmatch '^NEXT_PUBLIC_USDC_ID=' -and $_ -notmatch '^NEXT_PUBLIC_EQUITY_ID=' } | Set-Content $EnvFile
}
Add-Content $EnvFile "NEXT_PUBLIC_CONTRACT_ID=$ContractId"
Add-Content $EnvFile "NEXT_PUBLIC_USDC_ID=$UsdcSac"
Add-Content $EnvFile "NEXT_PUBLIC_EQUITY_ID=$EquitySac"
Write-Host ""
Write-Host "Wrote Contract, USDC, and Equity IDs to web\.env.local"
Write-Host "Restart 'npm run dev' to pick up the changes."
