# Pennysia SDK

[![TypeScript](https://img.shields.io/badge/TypeScript->5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Minimal TypeScript SDK for interacting with the Pennysia AMM on EVM-compatible chains. It provides a clean interface for quoting prices, swapping, and managing liquidity, plus deterministic on-chain math helpers and utilities for tokens, chains, and formatting.

### Features
- **Typed SDK surface**: `PennysiaSDK` for market data, quoting, swaps, and liquidity.
- **Deterministic math**: `PennysiaAMM` mirrors on-chain formulas (no RPC required).
- **Pairs abstraction**: `PennysiaPair` and `PennysiaLiquidityToken` for reserve- and liquidity-aware UX.
- **Utilities**: token sorting, swap path validation, slippage/deadline helpers, formatting, and explorer links.
- **Error-handling**: typed errors and `parseContractError` for cleaner UX.

## Installation

Choose how you want to consume the SDK. If this package isn’t published to npm, use Git, a local path, or a workspace.

- From npm registry (if/when published under your scope):

```bash
npm install @your-scope/pennysia-sdk ethers
```

- Directly from Git (no publish required):

```bash
npm install github:OWNER/REPO#main ethers
```

- Local path (consume from a sibling folder):

```bash
npm install file:../pennysia-sdk ethers
```

- Monorepo workspace (pnpm/yarn/npm workspaces):

```json
// package.json (consumer)
{
  "dependencies": {
    "pennysia-sdk": "workspace:*",
    "ethers": "^6"
  }
}
```

Note: The import path `pennysia-sdk` works as long as this package’s `name` in `package.json` is set accordingly.

## Quickstart

```ts
import {
  PennysiaSDK,
  ChainId,
  Token,
  createDeadline,
  calculateMinimumAmount,
  createSwapPath,
} from 'pennysia-sdk'
import { ethers } from 'ethers'

// 1) Provider (public RPC or your own)
const provider = new ethers.JsonRpcProvider('https://your-rpc-url')

// 2) Optional signer (for write actions)
// const signer = new ethers.Wallet(PRIVATE_KEY, provider)

// 3) Initialize SDK (read-only if no signer is provided)
const sdk = PennysiaSDK.create(ChainId.SONIC_BLAZE_TESTNET, provider /*, signer*/)

// 4) Define tokens (use your token addresses)
const TOKEN_A = new Token(ChainId.SONIC_BLAZE_TESTNET, '0xYourTokenA', 18, 'TKA', 'Token A')
const TOKEN_B = new Token(ChainId.SONIC_BLAZE_TESTNET, '0xYourTokenB', 18, 'TKB', 'Token B')

// 5) Quote a simple 1-hop path
const path = createSwapPath(TOKEN_A, TOKEN_B)
const amounts = await sdk.getAmountsOut('1000000000000000000', path) // 1.0 TKA (18 decimals)
console.log('Amounts out per hop:', amounts)

// 6) Swap (requires signer)
const deadline = createDeadline(20)
const minOut = calculateMinimumAmount(amounts[amounts.length - 1], 50) // 0.5% slippage
// await sdk.swap({ path, amountIn: '1000000000000000000', amountOutMin: minOut, to: await signer.getAddress(), deadline })
```

### Read Market Data

```ts
// Current reserves for a pair
const reserves = await sdk.getReserves(TOKEN_A, TOKEN_B)
console.log(reserves)

// Pair id and on-chain pair info
const pairId = await sdk.getPairId(TOKEN_A, TOKEN_B)
const pairInfo = await sdk.getPairInfo(pairId)
```

### Quotes and Pricing

```ts
// Router-based quotes
const amountOut = await sdk.getAmountOut('1000', '100000', '50000')
const amountIn = await sdk.getAmountIn('100', '100000', '50000')

// Multi-hop quotes
const amountsOut = await sdk.getAmountsOut('1000000', [TOKEN_A.address, TOKEN_B.address])
const amountsIn = await sdk.getAmountsIn('1000', [TOKEN_A.address, TOKEN_B.address])

// Client-side math (no RPC)
import { PennysiaAMM } from 'pennysia-sdk'
const simOut = PennysiaAMM.getAmountOut('1000', '100000', '50000')
const simIn = PennysiaAMM.getAmountIn('100', '100000', '50000')
const impact = PennysiaAMM.getPriceImpact('1000', '100000', '50000')
```

### Pairs Abstraction (UX helpers)

```ts
import { PennysiaPair } from 'pennysia-sdk'

const pair = PennysiaPair.create(
  TOKEN_A,
  TOKEN_B,
  {
    reserve0Long: '0', reserve0Short: '0',
    reserve1Long: '0', reserve1Short: '0',
  },
  {
    longX: '0', shortX: '0', longY: '0', shortY: '0'
  },
  '0xPairAddress' // identifier; not a deployment requirement for client math
)

// Compute output and price impact for a direction
const { outputAmount, priceImpact } = pair.getOutputAmount(TOKEN_A, '1000000', true /* isLong */)

// Directional price
const px = pair.getDirectionalPrice(true /* token0? */, true /* long? */)
```

### Swaps (write)

```ts
import { createSwapPath, calculateMinimumAmount } from 'pennysia-sdk'

const signerAddress = await sdk.signer!.getAddress()
const path = createSwapPath(TOKEN_A, TOKEN_B)
const quoted = await sdk.getAmountsOut('1000000000000000000', path)
const minOut = calculateMinimumAmount(quoted.at(-1)!, 50) // 0.5% slippage
const deadline = PennysiaSDK.createDeadline(20)

const tx = await sdk.swap({
  path,
  amountIn: '1000000000000000000',
  amountOutMin: minOut,
  to: signerAddress,
  deadline,
})
await tx.wait()
```

### Liquidity (write)

```ts
// Quote liquidity split
const q = await sdk.quoteLiquidity(
  TOKEN_A, TOKEN_B,
  '1000000000000000000', // A long
  '0',                   // A short
  '1000000000000000000', // B long
  '0'                    // B short
)

// Add liquidity
const tx = await sdk.addLiquidity({
  token0: TOKEN_A,
  token1: TOKEN_B,
  amount0Long: '1000000000000000000',
  amount0Short: '0',
  amount1Long: '1000000000000000000',
  amount1Short: '0',
  longXMinimum: '0', shortXMinimum: '0', longYMinimum: '0', shortYMinimum: '0',
  to: await sdk.signer!.getAddress(),
  deadline: PennysiaSDK.createDeadline(20),
})
await tx.wait()

// Remove liquidity
await sdk.removeLiquidity({
  token0: TOKEN_A,
  token1: TOKEN_B,
  longX: '1000', shortX: '0', longY: '1000', shortY: '0',
  amount0Minimum: '0', amount1Minimum: '0',
  to: await sdk.signer!.getAddress(),
  deadline: PennysiaSDK.createDeadline(20),
})
```

### TTL Approvals

```ts
// Approve with TTL
const approveTx = await sdk.approveTTL(
  TOKEN_A,
  '0xSpender',
  '1000000000000000000',
  PennysiaSDK.createDeadline(60)
)
await approveTx.wait()

// Read TTL allowance
const ttl = await sdk.getAllowanceTTL(TOKEN_A, '0xOwner', '0xSpender')
console.log(ttl.value, ttl.deadline)
```

## Tokens and Chains

- **Token**: `new Token(chainId, address, decimals, symbol, name)`
- **Native and Wrapped**:
  - `sdk.getNativeCurrency()` returns the chain’s native currency as a `Token`-like wrapper
  - `sdk.getWETH()` returns the canonical wrapped token for the chain
- **Chain info**: `getChainInfo`, `getChainInfoWithRpc`, `isChainSupported`, `SUPPORTED_CHAINS`, `ChainId`

## Utilities

- **Slippage and deadlines**: `calculateMinimumAmount`, `calculateMaximumAmount`, `createDeadline`
- **Formatting**: `formatTokenAmount`, `parseTokenAmount`
- **Addresses & paths**: `shortenAddress`, `isAddressEqual`, `createSwapPath`, `validateSwapPath`
- **Explorers**: `getExplorerUrl(chainId, hash, type)` with `type` in `tx | address | token`
- **Gas**: `estimateGasWithBuffer(estimated, bufferPercent)`

## Errors

```ts
import {
  parseContractError,
  PennysiaSDKError,
  SlippageExceededError,
  InsufficientLiquidityError,
  UnsupportedChainError,
} from 'pennysia-sdk'

try {
  // await sdk.swap(...)
} catch (e) {
  const err = parseContractError(e)
  if (err instanceof SlippageExceededError) {
    // handle slippage UX
  }
  console.error(err.message)
}
```

## Contract Access

- `sdk.marketContract` and `sdk.routerContract` expose typed `ethers` `Contract` instances.
- Use `getMarketAddress`, `getRouterAddress`, or `getContractAddresses` to resolve current chain endpoints.
- If contracts are not available for the chosen chain, the SDK throws a descriptive error.

Note: This README intentionally does not include any deployment addresses. Resolve addresses programmatically via the SDK.

## Types

```ts
type SwapParams = {
  path: string[]
  amountIn: string
  amountOutMin: string
  to: string
  deadline: number
}

type AddLiquidityParams = {
  token0: Token
  token1: Token
  amount0Long: string
  amount0Short: string
  amount1Long: string
  amount1Short: string
  longXMinimum: string
  shortXMinimum: string
  longYMinimum: string
  shortYMinimum: string
  to: string
  deadline: number
}

type RemoveLiquidityParams = {
  token0: Token
  token1: Token
  longX: string
  shortX: string
  longY: string
  shortY: string
  amount0Minimum: string
  amount1Minimum: string
  to: string
  deadline: number
}
```

## Development

```bash
npm run build   # tsc compile to dist/
npm run dev     # tsc --watch
npm run test    # jest
npm run lint    # eslint
```

## License

MIT © Pennysia


---

**Built with ❤️ by the Pennysia Team**