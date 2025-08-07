# Pennysia SDK

A minimal, lightweight SDK for interacting with Pennysia AMM contracts. Built specifically for MVP frontend development with essential utilities and contract wrappers.

## Features

- 🚀 **Lightweight**: Only essential functions for MVP
- 🔧 **Type-safe**: Full TypeScript support with contract ABIs
- 🧮 **AMM Math**: Built-in calculations for swaps and liquidity
- ⛓️ **Multi-chain**: Support for Ethereum, Sepolia, Sonic, and Sonic Blaze
- 🕐 **TTL Approvals**: Native support for Pennysia's time-based approvals
- 📦 **Zero Dependencies**: Only ethers.js and big.js for math

## Installation

```bash
npm install pennysia-sdk
# or
yarn add pennysia-sdk
```

## Quick Start

```typescript
import { PennysiaSDK, ChainId, Token, getChainInfoWithRpc } from 'pennysia-sdk'
import { ethers } from 'ethers'

// Secure RPC configuration - use environment variables
const rpcUrl = process.env.REACT_APP_RPC_URL || process.env.RPC_URL
const provider = new ethers.JsonRpcProvider(rpcUrl)
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
const sdk = PennysiaSDK.create(ChainId.SEPOLIA, provider, signer)

// Create tokens
const tokenA = new Token(ChainId.SEPOLIA, '0x...', 18, 'USDC', 'USD Coin')
const tokenB = new Token(ChainId.SEPOLIA, '0x...', 18, 'WETH', 'Wrapped Ether')

// Get quote for swap
const amountOut = await sdk.getAmountOut('1000000', tokenA, tokenB) // 1 USDC
console.log(`1 USDC = ${ethers.formatUnits(amountOut, 18)} WETH`)

// Execute swap
const deadline = PennysiaSDK.createDeadline(20) // 20 minutes from now
const swapTx = await sdk.swap({
  tokenIn: tokenA,
  tokenOut: tokenB,
  amountIn: '1000000', // 1 USDC
  amountOutMin: '0', // Set appropriate slippage
  to: await signer.getAddress(),
  deadline
})

await swapTx.wait()
console.log('Swap completed!')
```

## Core Classes

### PennysiaSDK

Main SDK class providing contract interactions:

```typescript
const sdk = PennysiaSDK.create(chainId, provider, signer)

// Market data
const reserves = await sdk.getReserves(tokenA, tokenB)
const liquiditySupply = await sdk.getLiquiditySupply(tokenA, tokenB)

// Trading
await sdk.swap(swapParams)
await sdk.addLiquidity(liquidityParams)
await sdk.withdrawLiquidity(withdrawParams)

// TTL approvals
await sdk.approveTTL(token, spender, amount, deadline)
```

### Token

Token representation with chain validation:

```typescript
const token = new Token(
  ChainId.MAINNET,
  '0xA0b86a33E6441E8C8C0Dd7C0C3F8C7D0E8F9A0B1',
  18,
  'USDC',
  'USD Coin'
)

// Built-in tokens
const weth = sdk.getWETH()
const native = sdk.getNativeCurrency()
```

### PennysiaAMM

AMM math utilities matching contract logic:

```typescript
import { PennysiaAMM } from 'pennysia-sdk'

// Calculate swap outputs
const amountOut = PennysiaAMM.getAmountOut(amountIn, reserveIn, reserveOut)
const amountIn = PennysiaAMM.getAmountIn(amountOut, reserveIn, reserveOut)

// Liquidity calculations
const liquidity = PennysiaAMM.getLiquidityMinted(
  totalSupply, tokenAAmount, tokenBAmount, reserveA, reserveB
)

// Price impact
const impact = PennysiaAMM.getPriceImpact(amountIn, reserveIn, reserveOut)
```

## Security & RPC Configuration

⚠️ **IMPORTANT**: Never hardcode API keys or private keys in your application code!

### Secure RPC Setup

The SDK requires you to provide your own RPC URLs to avoid exposing API keys:

```typescript
// ✅ GOOD - Use environment variables
const rpcUrl = process.env.REACT_APP_INFURA_URL // Frontend
// or
const rpcUrl = process.env.INFURA_URL // Backend

// ✅ GOOD - Use getChainInfoWithRpc for custom RPC
import { getChainInfoWithRpc, ChainId } from 'pennysia-sdk'

const chainInfo = getChainInfoWithRpc(ChainId.MAINNET, [
  process.env.REACT_APP_INFURA_URL!,
  process.env.REACT_APP_ALCHEMY_URL! // Fallback
])

// ❌ BAD - Never do this
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_API_KEY')
```

### Environment Variables Setup

**Frontend (.env.local):**
```bash
REACT_APP_INFURA_URL=https://mainnet.infura.io/v3/your_project_id
REACT_APP_SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
```

**Backend (.env):**
```bash
INFURA_URL=https://mainnet.infura.io/v3/your_project_id
PRIVATE_KEY=your_private_key_here
```

### Wallet Security

```typescript
// ✅ GOOD - Environment variables
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

// ✅ BETTER - Use wallet connect or browser wallets in frontend
const signer = await window.ethereum.request({ method: 'eth_requestAccounts' })
```

## Supported Chains

- **Sonic Blaze Testnet** (ChainId.SONIC_BLAZE_TESTNET) - ✅ **LIVE & DEPLOYED**
  - Chain ID: `57054`
  - RPC URL: `https://rpc.blaze.soniclabs.com`
  - Explorer: `https://testnet.sonicscan.org`
  - **Market Contract**: `0x1082c49293D3F2f59BD32f358a3f273E5ee38312`
  - **Router Contract**: `0x6cAEB59821A29845eddf5ea7b54850eDdD14AF0f`

> **Status**: ✅ Deployed and verified on Sonic Blaze Testnet

```typescript
export const CONTRACT_ADDRESSES: Record<ChainId, ContractAddresses> = {
  [ChainId.SONIC_BLAZE_TESTNET]: {
    market: '0x1082c49293D3F2f59BD32f358a3f273E5ee38312',
    router: '0x6cAEB59821A29845eddf5ea7b54850eDdD14AF0f',
  },
  // ... other chains
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Test
npm run test

# Lint
npm run lint
```

## Architecture

This SDK is designed for MVP simplicity:

- **No complex routing**: Direct pair swaps only
- **Essential functions**: Only what's needed for basic AMM operations  
- **Minimal dependencies**: ethers.js + big.js for precision math
- **Type safety**: Full TypeScript with contract ABIs
- **Extensible**: Easy to add features as needed

## License

MIT
