import { ethers, Contract, Provider, Signer } from 'ethers'
import { ChainId, getChainInfo } from './chains'
import { getMarketAddress, getRouterAddress } from './addresses'
import { Token, NATIVE_CURRENCY, WETH } from './token'
import { PennysiaAMM } from './math'
import { MARKET_ABI, ROUTER_ABI, ERC20_ABI } from './abis'

export interface SwapParams {
  path: string[]
  amountIn: string
  amountOutMin: string
  to: string
  deadline: number
}

export interface AddLiquidityParams {
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

export interface RemoveLiquidityParams {
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

export class PennysiaSDK {
  public readonly chainId: ChainId
  public readonly provider: Provider
  public readonly signer?: Signer
  public readonly marketContract: Contract
  public readonly routerContract: Contract

  constructor(chainId: ChainId, provider: Provider, signer?: Signer) {
    this.chainId = chainId
    this.provider = provider
    this.signer = signer

    const marketAddress = getMarketAddress(chainId)
    const routerAddress = getRouterAddress(chainId)

    if (!marketAddress || !routerAddress) {
      throw new Error(`Pennysia contracts not deployed on chain ${chainId}`)
    }

    this.marketContract = new Contract(marketAddress, MARKET_ABI, signer || provider)
    this.routerContract = new Contract(routerAddress, ROUTER_ABI, signer || provider)
  }

  // Static factory method
  static create(chainId: ChainId, provider: Provider, signer?: Signer): PennysiaSDK {
    return new PennysiaSDK(chainId, provider, signer)
  }

  // Token utilities
  async getTokenContract(tokenAddress: string): Promise<Contract> {
    return new Contract(tokenAddress, ERC20_ABI, this.signer || this.provider)
  }

  async getTokenInfo(tokenAddress: string): Promise<{
    name: string
    symbol: string
    decimals: number
    totalSupply: string
  }> {
    const contract = await this.getTokenContract(tokenAddress)
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ])

    return {
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString()
    }
  }

  // Market data functions
  async getReserves(token0: Token, token1: Token): Promise<{
    reserve0Long: string
    reserve0Short: string
    reserve1Long: string
    reserve1Short: string
  }> {
    const reserves = await this.marketContract.getReserves(token0.address, token1.address)
    return {
      reserve0Long: reserves.reserve0Long.toString(),
      reserve0Short: reserves.reserve0Short.toString(),
      reserve1Long: reserves.reserve1Long.toString(),
      reserve1Short: reserves.reserve1Short.toString()
    }
  }

  async getPairId(token0: Token, token1: Token): Promise<string> {
    const pairId = await this.marketContract.getPairId(token0.address, token1.address)
    return pairId.toString()
  }

  async getPairInfo(pairId: string): Promise<{
    reserve0Long: string
    reserve0Short: string
    reserve1Long: string
    reserve1Short: string
    blockTimestampLast: string
    cbrtPriceX128CumulativeLast: string
  }> {
    const pair = await this.marketContract.pairs(pairId)
    return {
      reserve0Long: pair.reserve0Long.toString(),
      reserve0Short: pair.reserve0Short.toString(),
      reserve1Long: pair.reserve1Long.toString(),
      reserve1Short: pair.reserve1Short.toString(),
      blockTimestampLast: pair.blockTimestampLast.toString(),
      cbrtPriceX128CumulativeLast: pair.cbrtPriceX128CumulativeLast.toString()
    }
  }

  // Price and quote functions
  async getAmountOut(amountIn: string, reserveIn: string, reserveOut: string): Promise<string> {
    const amountOut = await this.routerContract.getAmountOut(amountIn, reserveIn, reserveOut)
    return amountOut.toString()
  }

  async getAmountIn(amountOut: string, reserveIn: string, reserveOut: string): Promise<string> {
    const amountIn = await this.routerContract.getAmountIn(amountOut, reserveIn, reserveOut)
    return amountIn.toString()
  }

  async getAmountsOut(amountIn: string, path: string[]): Promise<string[]> {
    const amounts = await this.routerContract.getAmountsOut(amountIn, path)
    return amounts.map((amount: any) => amount.toString())
  }

  async getAmountsIn(amountOut: string, path: string[]): Promise<string[]> {
    const amounts = await this.routerContract.getAmountsIn(amountOut, path)
    return amounts.map((amount: any) => amount.toString())
  }

  async quoteLiquidity(
    token0: Token,
    token1: Token,
    amountLong0: string,
    amountShort0: string,
    amountLong1: string,
    amountShort1: string
  ): Promise<{ longX: string; shortX: string; longY: string; shortY: string }> {
    const quote = await this.routerContract.quoteLiquidity(
      token0.address,
      token1.address,
      amountLong0,
      amountShort0,
      amountLong1,
      amountShort1
    )
    return {
      longX: quote.longX.toString(),
      shortX: quote.shortX.toString(),
      longY: quote.longY.toString(),
      shortY: quote.shortY.toString()
    }
  }

  // Trading functions
  async swap(params: SwapParams): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for trading operations')
    }

    return await this.routerContract.swap(
      params.amountIn,
      params.amountOutMin,
      params.path,
      params.to,
      params.deadline
    )
  }

  async addLiquidity(params: AddLiquidityParams): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for liquidity operations')
    }

    return await this.routerContract.addLiquidity(
      params.token0.address,
      params.token1.address,
      params.amount0Long,
      params.amount0Short,
      params.amount1Long,
      params.amount1Short,
      params.longXMinimum,
      params.shortXMinimum,
      params.longYMinimum,
      params.shortYMinimum,
      params.to,
      params.deadline
    )
  }

  async removeLiquidity(params: RemoveLiquidityParams): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for liquidity operations')
    }

    return await this.routerContract.removeLiquidity(
      params.token0.address,
      params.token1.address,
      params.longX,
      params.shortX,
      params.longY,
      params.shortY,
      params.amount0Minimum,
      params.amount1Minimum,
      params.to,
      params.deadline
    )
  }

  // TTL approval functions
  async approveTTL(
    token: Token,
    spender: string,
    value: string,
    deadline: number
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for approval operations')
    }

    return await this.routerContract.approveTTL(token.address, spender, value, deadline)
  }

  async getAllowanceTTL(
    token: Token,
    owner: string,
    spender: string
  ): Promise<{ value: string; deadline: string }> {
    const allowance = await this.routerContract.getAllowanceTTL(token.address, owner, spender)
    return {
      value: allowance.value.toString(),
      deadline: allowance.deadline.toString()
    }
  }

  // Utility functions
  getNativeCurrency(): Token {
    return NATIVE_CURRENCY[this.chainId]
  }

  getWETH(): Token {
    return WETH[this.chainId]
  }

  getChainInfo() {
    return getChainInfo(this.chainId)
  }

  // Calculate price impact for a trade
  async calculatePriceImpact(
    amountIn: string,
    tokenIn: Token,
    tokenOut: Token
  ): Promise<string> {
    const reserves = await this.getReserves(tokenIn, tokenOut)
    
    // Determine which reserves to use based on token order
    const [reserveIn, reserveOut] = tokenIn.sortsBefore(tokenOut)
      ? [reserves.reserve0Long, reserves.reserve1Long] // Simplified - using Long reserves
      : [reserves.reserve1Long, reserves.reserve0Long]

    return PennysiaAMM.getPriceImpact(amountIn, reserveIn, reserveOut)
  }

  // Helper to create deadline timestamp (current time + minutes)
  static createDeadline(minutesFromNow: number = 20): number {
    return Math.floor(Date.now() / 1000) + (minutesFromNow * 60)
  }
}
