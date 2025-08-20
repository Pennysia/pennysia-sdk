import { ChainId } from './chains'

export class Token {
  public readonly chainId: ChainId
  public readonly address: string
  public readonly decimals: number
  public readonly symbol: string
  public readonly name: string

  constructor(
    chainId: ChainId,
    address: string,
    decimals: number,
    symbol: string,
    name: string
  ) {
    this.chainId = chainId
    this.address = address.toLowerCase()
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
  }

  public equals(other: Token): boolean {
    return (
      this.chainId === other.chainId &&
      this.address === other.address
    )
  }

  public sortsBefore(other: Token): boolean {
    if (this.chainId !== other.chainId) {
      throw new Error('Cannot compare tokens from different chains')
    }
    return this.address.toLowerCase() < other.address.toLowerCase()
  }
}

// Native currency wrapper
export class NativeCurrency extends Token {
  constructor(chainId: ChainId, decimals: number, symbol: string, name: string) {
    super(chainId, '0x0000000000000000000000000000000000000000', decimals, symbol, name)
  }

  public get isNative(): boolean {
    return true
  }
}

// Common tokens - to be updated with actual deployed addresses
export const WETH: Record<ChainId, Token> = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [ChainId.SEPOLIA]: new Token(
    ChainId.SEPOLIA,
    '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [ChainId.SONIC]: new Token(
    ChainId.SONIC,
    '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', // Placeholder
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [ChainId.SONIC_BLAZE_TESTNET]: new Token(
    ChainId.SONIC_BLAZE_TESTNET,
    '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', // Placeholder
    18,
    'WETH',
    'Wrapped Ether'
  ),
}

export const NATIVE_CURRENCY: Record<ChainId, NativeCurrency> = {
  [ChainId.MAINNET]: new NativeCurrency(ChainId.MAINNET, 18, 'ETH', 'Ether'),
  [ChainId.SEPOLIA]: new NativeCurrency(ChainId.SEPOLIA, 18, 'SEP', 'Sepolia Ether'),
  [ChainId.SONIC]: new NativeCurrency(ChainId.SONIC, 18, 'S', 'Sonic'),
  [ChainId.SONIC_BLAZE_TESTNET]: new NativeCurrency(ChainId.SONIC_BLAZE_TESTNET, 18, 'S', 'Sonic'),
}
