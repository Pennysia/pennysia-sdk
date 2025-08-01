// Main SDK exports
export { PennysiaSDK } from './pennysia'
export type { SwapParams, AddLiquidityParams, RemoveLiquidityParams } from './pennysia'

// Chain and network utilities
export { ChainId, CHAIN_INFO, SUPPORTED_CHAINS, getChainInfo, getChainInfoWithRpc, isChainSupported } from './chains'
export type { ChainInfo } from './chains'

// Contract addresses
export { CONTRACT_ADDRESSES, getMarketAddress, getRouterAddress, getContractAddresses } from './addresses'
export type { ContractAddresses } from './addresses'

// Token utilities
export { Token, NativeCurrency, WETH, NATIVE_CURRENCY } from './token'

// Pair entity
export { PennysiaPair, PennysiaLiquidityToken } from './pair'
export type { PairReserves, LiquiditySupply } from './pair'

// AMM math utilities
export { PennysiaAMM } from './math'

// Constants and utilities
export { PENNYSIA_CONSTANTS, calculateMinimumAmount, calculateMaximumAmount, createDeadline, formatTokenAmount, parseTokenAmount } from './constants'
export { 
  PennysiaSDKError, 
  InsufficientLiquidityError, 
  SlippageExceededError, 
  InvalidTokenError, 
  ContractNotDeployedError, 
  UnsupportedChainError, 
  TransactionRevertedError,
  parseContractError,
  validateTokenAddress,
  validateAmount,
  validateDeadline
} from './errors'
export {
  sortTokens,
  createTokenPairKey,
  calculatePrice,
  invertPrice,
  calculatePercentageChange,
  calculateLiquidityShare,
  validateSwapPath,
  createSwapPath,
  estimateGasWithBuffer,
  isDeadlineExpired,
  formatTimeRemaining,
  shortenAddress,
  isAddressEqual,
  getExplorerUrl
} from './utils'

// Contract ABIs
export { MARKET_ABI, ROUTER_ABI, LIQUIDITY_ABI, PAYMENT_ABI, MULTICALL_ABI, ERC20_ABI } from './abis'

// Re-export ethers for convenience
export { ethers } from 'ethers'
export type { Provider, Signer, Contract } from 'ethers'
