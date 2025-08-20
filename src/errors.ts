// Custom error classes for Pennysia SDK
export class PennysiaSDKError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'PennysiaSDKError'
  }
}

export class InsufficientLiquidityError extends PennysiaSDKError {
  constructor(message: string = 'Insufficient liquidity for this trade') {
    super(message, 'INSUFFICIENT_LIQUIDITY')
    this.name = 'InsufficientLiquidityError'
  }
}

export class SlippageExceededError extends PennysiaSDKError {
  constructor(message: string = 'Transaction would exceed maximum slippage') {
    super(message, 'SLIPPAGE_EXCEEDED')
    this.name = 'SlippageExceededError'
  }
}

export class InvalidTokenError extends PennysiaSDKError {
  constructor(message: string = 'Invalid token address or configuration') {
    super(message, 'INVALID_TOKEN')
    this.name = 'InvalidTokenError'
  }
}

export class ContractNotDeployedError extends PennysiaSDKError {
  constructor(chainId: number) {
    super(`Pennysia contracts not deployed on chain ${chainId}`, 'CONTRACT_NOT_DEPLOYED')
    this.name = 'ContractNotDeployedError'
  }
}

export class UnsupportedChainError extends PennysiaSDKError {
  constructor(chainId: number) {
    super(`Chain ${chainId} is not supported`, 'UNSUPPORTED_CHAIN')
    this.name = 'UnsupportedChainError'
  }
}

export class TransactionRevertedError extends PennysiaSDKError {
  constructor(message: string, public txHash?: string) {
    super(`Transaction reverted: ${message}`, 'TRANSACTION_REVERTED')
    this.name = 'TransactionRevertedError'
    this.txHash = txHash
  }
}

// Error parsing utilities
export function parseContractError(error: any): PennysiaSDKError {
  const message = error?.message || error?.toString() || 'Unknown contract error'
  
  // Parse common contract errors
  if (message.includes('slippage')) {
    return new SlippageExceededError()
  }
  
  if (message.includes('insufficient') || message.includes('InsufficientLiquidity')) {
    return new InsufficientLiquidityError()
  }
  
  if (message.includes('forbidden')) {
    return new PennysiaSDKError('Transaction forbidden by contract', 'FORBIDDEN')
  }
  
  if (message.includes('pairNotFound')) {
    return new PennysiaSDKError('Trading pair not found', 'PAIR_NOT_FOUND')
  }
  
  if (message.includes('minimumLiquidity')) {
    return new PennysiaSDKError('Minimum liquidity requirement not met', 'MINIMUM_LIQUIDITY')
  }
  
  if (message.includes('invalidPath')) {
    return new PennysiaSDKError('Invalid swap path', 'INVALID_PATH')
  }
  
  // Generic transaction error
  if (error?.hash) {
    return new TransactionRevertedError(message, error.hash)
  }
  
  return new PennysiaSDKError(message)
}

// Validation utilities
export function validateTokenAddress(address: string): void {
  if (!address || typeof address !== 'string') {
    throw new InvalidTokenError('Token address must be a non-empty string')
  }
  
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new InvalidTokenError('Invalid token address format')
  }
}

export function validateAmount(amount: string, name: string = 'Amount'): void {
  if (!amount || typeof amount !== 'string') {
    throw new PennysiaSDKError(`${name} must be a non-empty string`)
  }
  
  try {
    const amountBig = BigInt(amount)
    if (amountBig <= 0) {
      throw new PennysiaSDKError(`${name} must be greater than 0`)
    }
  } catch (error) {
    throw new PennysiaSDKError(`Invalid ${name.toLowerCase()} format`)
  }
}

export function validateDeadline(deadline: number): void {
  const now = Math.floor(Date.now() / 1000)
  if (deadline <= now) {
    throw new PennysiaSDKError('Deadline must be in the future')
  }
  
  // Warn if deadline is more than 24 hours in the future
  const maxDeadline = now + (24 * 60 * 60)
  if (deadline > maxDeadline) {
    console.warn('Warning: Deadline is more than 24 hours in the future')
  }
}
