import { Token } from './token'
import { ChainId } from './chains'
import { validateTokenAddress, validateAmount } from './errors'

// Token utilities
export function sortTokens(tokenA: Token, tokenB: Token): [Token, Token] {
  if (tokenA.chainId !== tokenB.chainId) {
    throw new Error('Cannot sort tokens from different chains')
  }
  return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
}

export function createTokenPairKey(tokenA: Token, tokenB: Token): string {
  const [token0, token1] = sortTokens(tokenA, tokenB)
  return `${token0.address}-${token1.address}`
}

// Price utilities
export function calculatePrice(reserve0: string, reserve1: string, decimals0: number, decimals1: number): string {
  const reserve0Big = BigInt(reserve0)
  const reserve1Big = BigInt(reserve1)
  
  if (reserve0Big === BigInt(0)) {
    return '0'
  }
  
  // Adjust for decimal differences
  const decimalDiff = decimals1 - decimals0
  const adjustedReserve1 = decimalDiff >= 0 
    ? reserve1Big * BigInt(10 ** Math.abs(decimalDiff))
    : reserve1Big / BigInt(10 ** Math.abs(decimalDiff))
  
  // Calculate price as reserve1/reserve0
  const price = (adjustedReserve1 * BigInt(10 ** 18)) / reserve0Big
  return price.toString()
}

export function invertPrice(price: string): string {
  const priceBig = BigInt(price)
  if (priceBig === BigInt(0)) {
    return '0'
  }
  
  const inverted = (BigInt(10 ** 18) * BigInt(10 ** 18)) / priceBig
  return inverted.toString()
}

// Percentage utilities
export function calculatePercentageChange(oldValue: string, newValue: string): string {
  const oldBig = BigInt(oldValue)
  const newBig = BigInt(newValue)
  
  if (oldBig === BigInt(0)) {
    return newBig > BigInt(0) ? '100' : '0'
  }
  
  const change = newBig - oldBig
  const percentage = (change * BigInt(10000)) / oldBig // 100 for percentage, 100 for 2 decimal places
  return percentage.toString()
}

// Liquidity utilities
export function calculateLiquidityShare(
  userLiquidity: string,
  totalLiquidity: string,
  decimals: number = 18
): string {
  const userBig = BigInt(userLiquidity)
  const totalBig = BigInt(totalLiquidity)
  
  if (totalBig === BigInt(0)) {
    return '0'
  }
  
  // Calculate percentage with 4 decimal places precision
  const share = (userBig * BigInt(10 ** (decimals + 4))) / totalBig
  return share.toString()
}

// Path utilities for multi-hop swaps
export function validateSwapPath(path: string[]): void {
  if (!path || path.length < 2) {
    throw new Error('Swap path must contain at least 2 tokens')
  }
  
  if (path.length > 4) {
    throw new Error('Swap path cannot contain more than 4 tokens')
  }
  
  // Validate each address in path
  path.forEach((address, index) => {
    try {
      validateTokenAddress(address)
    } catch (error) {
      throw new Error(`Invalid token address at path index ${index}: ${address}`)
    }
  })
  
  // Check for duplicate consecutive tokens
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i].toLowerCase() === path[i + 1].toLowerCase()) {
      throw new Error(`Duplicate consecutive tokens in path at index ${i}`)
    }
  }
}

export function createSwapPath(tokenIn: Token, tokenOut: Token, intermediateTokens: Token[] = []): string[] {
  const path = [tokenIn.address]
  
  // Add intermediate tokens
  intermediateTokens.forEach(token => {
    if (token.chainId !== tokenIn.chainId) {
      throw new Error('All tokens in swap path must be on the same chain')
    }
    path.push(token.address)
  })
  
  path.push(tokenOut.address)
  
  validateSwapPath(path)
  return path
}

// Gas estimation utilities
export function estimateGasWithBuffer(estimatedGas: bigint, bufferPercent: number = 20): bigint {
  const buffer = (estimatedGas * BigInt(bufferPercent)) / BigInt(100)
  return estimatedGas + buffer
}

// Time utilities
export function isDeadlineExpired(deadline: number): boolean {
  return Math.floor(Date.now() / 1000) >= deadline
}

export function formatTimeRemaining(deadline: number): string {
  const now = Math.floor(Date.now() / 1000)
  const remaining = deadline - now
  
  if (remaining <= 0) {
    return 'Expired'
  }
  
  if (remaining < 60) {
    return `${remaining}s`
  }
  
  if (remaining < 3600) {
    const minutes = Math.floor(remaining / 60)
    return `${minutes}m`
  }
  
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  return `${hours}h ${minutes}m`
}

// Address utilities
export function shortenAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) {
    return address
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

export function isAddressEqual(address1: string, address2: string): boolean {
  return address1.toLowerCase() === address2.toLowerCase()
}

// Network utilities
export function getExplorerUrl(chainId: ChainId, hash: string, type: 'tx' | 'address' | 'token' = 'tx'): string {
  const baseUrls: Record<ChainId, string> = {
    [ChainId.MAINNET]: 'https://etherscan.io',
    [ChainId.SEPOLIA]: 'https://sepolia.etherscan.io',
    [ChainId.SONIC]: 'https://explorer.soniclabs.com',
    [ChainId.SONIC_BLAZE_TESTNET]: 'https://explorer.blaze.soniclabs.com',
  }
  
  const baseUrl = baseUrls[chainId]
  if (!baseUrl) {
    return ''
  }
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`
    case 'address':
      return `${baseUrl}/address/${hash}`
    case 'token':
      return `${baseUrl}/token/${hash}`
    default:
      return `${baseUrl}/tx/${hash}`
  }
}
