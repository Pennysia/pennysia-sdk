import { Token } from './token'
import { ChainId } from './chains'
import { PennysiaAMM } from './math'
import { validateAmount, PennysiaSDKError } from './errors'
import { calculatePrice, sortTokens } from './utils'
import { PENNYSIA_CONSTANTS } from './constants'

export interface PairReserves {
  reserve0Long: string
  reserve0Short: string
  reserve1Long: string
  reserve1Short: string
}

export interface LiquiditySupply {
  longX: string
  shortX: string
  longY: string
  shortY: string
}

export class PennysiaLiquidityToken extends Token {
  public readonly token0: Token
  public readonly token1: Token
  public readonly pairAddress: string

  constructor(
    chainId: ChainId,
    pairAddress: string,
    token0: Token,
    token1: Token,
    decimals: number = 18
  ) {
    const [sortedToken0, sortedToken1] = sortTokens(token0, token1)
    const symbol = `PLP-${sortedToken0.symbol}-${sortedToken1.symbol}`
    const name = `Pennysia LP ${sortedToken0.symbol}/${sortedToken1.symbol}`
    
    super(chainId, pairAddress, decimals, symbol, name)
    
    this.token0 = sortedToken0
    this.token1 = sortedToken1
    this.pairAddress = pairAddress
  }
}

export class PennysiaPair {
  public readonly token0: Token
  public readonly token1: Token
  public readonly chainId: ChainId
  public readonly pairAddress: string
  public readonly liquidityToken: PennysiaLiquidityToken
  
  private _reserves: PairReserves
  private _liquiditySupply: LiquiditySupply

  constructor(
    token0: Token,
    token1: Token,
    reserves: PairReserves,
    liquiditySupply: LiquiditySupply,
    pairAddress: string
  ) {
    // Ensure tokens are from same chain
    if (token0.chainId !== token1.chainId) {
      throw new PennysiaSDKError('Tokens must be from the same chain')
    }

    // Sort tokens for consistent ordering
    const [sortedToken0, sortedToken1] = sortTokens(token0, token1)
    
    this.token0 = sortedToken0
    this.token1 = sortedToken1
    this.chainId = token0.chainId
    this.pairAddress = pairAddress
    this._reserves = reserves
    this._liquiditySupply = liquiditySupply
    
    this.liquidityToken = new PennysiaLiquidityToken(
      this.chainId,
      pairAddress,
      this.token0,
      this.token1
    )
  }

  // Getters for reserves
  public get reserves(): PairReserves {
    return { ...this._reserves }
  }

  public get liquiditySupply(): LiquiditySupply {
    return { ...this._liquiditySupply }
  }

  // Total reserves for each token
  public get reserve0Total(): string {
    const longBig = BigInt(this._reserves.reserve0Long)
    const shortBig = BigInt(this._reserves.reserve0Short)
    return (longBig + shortBig).toString()
  }

  public get reserve1Total(): string {
    const longBig = BigInt(this._reserves.reserve1Long)
    const shortBig = BigInt(this._reserves.reserve1Short)
    return (longBig + shortBig).toString()
  }

  // Price calculations
  public get token0Price(): string {
    return calculatePrice(
      this.reserve0Total,
      this.reserve1Total,
      this.token0.decimals,
      this.token1.decimals
    )
  }

  public get token1Price(): string {
    return calculatePrice(
      this.reserve1Total,
      this.reserve0Total,
      this.token1.decimals,
      this.token0.decimals
    )
  }

  // Directional price calculations (long vs short positions)
  public getDirectionalPrice(isToken0: boolean, isLong: boolean): string {
    if (isToken0) {
      const reserveIn = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short
      const reserveOut = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short
      return calculatePrice(reserveIn, reserveOut, this.token0.decimals, this.token1.decimals)
    } else {
      const reserveIn = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short
      const reserveOut = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short
      return calculatePrice(reserveIn, reserveOut, this.token1.decimals, this.token0.decimals)
    }
  }

  // Swap calculations using AMM math
  public getOutputAmount(
    inputToken: Token,
    inputAmount: string,
    isLong: boolean
  ): { outputAmount: string; priceImpact: string } {
    validateAmount(inputAmount, 'Input amount')
    
    const isToken0Input = inputToken.equals(this.token0)
    
    let reserveIn: string
    let reserveOut: string
    
    if (isToken0Input) {
      reserveIn = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short
      reserveOut = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short
    } else {
      reserveIn = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short
      reserveOut = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short
    }
    
    const outputAmount = PennysiaAMM.getAmountOut(inputAmount, reserveIn, reserveOut)
    const priceImpact = PennysiaAMM.getPriceImpact(inputAmount, reserveIn, reserveOut)
    
    return { outputAmount, priceImpact }
  }

  public getInputAmount(
    outputToken: Token,
    outputAmount: string,
    isLong: boolean
  ): { inputAmount: string; priceImpact: string } {
    validateAmount(outputAmount, 'Output amount')
    
    const isToken0Output = outputToken.equals(this.token0)
    
    let reserveIn: string
    let reserveOut: string
    
    if (isToken0Output) {
      reserveOut = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short
      reserveIn = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short
    } else {
      reserveOut = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short
      reserveIn = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short
    }
    
    const inputAmount = PennysiaAMM.getAmountIn(outputAmount, reserveIn, reserveOut)
    const priceImpact = PennysiaAMM.getPriceImpact(inputAmount, reserveIn, reserveOut)
    
    return { inputAmount, priceImpact }
  }

  // Liquidity calculations
  public getLiquidityMinted(
    amount0Long: string,
    amount0Short: string,
    amount1Long: string,
    amount1Short: string
  ): {
    longXMinted: string
    shortXMinted: string
    longYMinted: string
    shortYMinted: string
  } {
    validateAmount(amount0Long, 'Amount 0 Long')
    validateAmount(amount0Short, 'Amount 0 Short')
    validateAmount(amount1Long, 'Amount 1 Long')
    validateAmount(amount1Short, 'Amount 1 Short')

    const longXMinted = PennysiaAMM.getLiquidityMinted(
      this._liquiditySupply.longX,
      amount0Long,
      amount1Long,
      this._reserves.reserve0Long,
      this._reserves.reserve1Long
    )

    const shortXMinted = PennysiaAMM.getLiquidityMinted(
      this._liquiditySupply.shortX,
      amount0Short,
      amount1Short,
      this._reserves.reserve0Short,
      this._reserves.reserve1Short
    )

    const longYMinted = PennysiaAMM.getLiquidityMinted(
      this._liquiditySupply.longY,
      amount1Long,
      amount0Long,
      this._reserves.reserve1Long,
      this._reserves.reserve0Long
    )

    const shortYMinted = PennysiaAMM.getLiquidityMinted(
      this._liquiditySupply.shortY,
      amount1Short,
      amount0Short,
      this._reserves.reserve1Short,
      this._reserves.reserve0Short
    )

    return {
      longXMinted,
      shortXMinted,
      longYMinted,
      shortYMinted
    }
  }

  public getLiquidityValue(
    longX: string,
    shortX: string,
    longY: string,
    shortY: string
  ): {
    amount0Long: string
    amount0Short: string
    amount1Long: string
    amount1Short: string
  } {
    const { amountA: amount0Long } = PennysiaAMM.getLiquidityValue(
      longX,
      this._liquiditySupply.longX,
      this._reserves.reserve0Long,
      this._reserves.reserve1Long
    )

    const { amountA: amount0Short } = PennysiaAMM.getLiquidityValue(
      shortX,
      this._liquiditySupply.shortX,
      this._reserves.reserve0Short,
      this._reserves.reserve1Short
    )

    const { amountA: amount1Long } = PennysiaAMM.getLiquidityValue(
      longY,
      this._liquiditySupply.longY,
      this._reserves.reserve1Long,
      this._reserves.reserve0Long
    )

    const { amountA: amount1Short } = PennysiaAMM.getLiquidityValue(
      shortY,
      this._liquiditySupply.shortY,
      this._reserves.reserve1Short,
      this._reserves.reserve0Short
    )

    return {
      amount0Long,
      amount0Short,
      amount1Long,
      amount1Short
    }
  }

  // Utility methods
  public involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1)
  }

  public otherToken(token: Token): Token {
    if (token.equals(this.token0)) {
      return this.token1
    } else if (token.equals(this.token1)) {
      return this.token0
    } else {
      throw new PennysiaSDKError('Token is not part of this pair')
    }
  }

  // Update reserves (for when new data is fetched)
  public updateReserves(newReserves: PairReserves): void {
    this._reserves = { ...newReserves }
  }

  public updateLiquiditySupply(newSupply: LiquiditySupply): void {
    this._liquiditySupply = { ...newSupply }
  }

  // Static factory method
  public static create(
    token0: Token,
    token1: Token,
    reserves: PairReserves,
    liquiditySupply: LiquiditySupply,
    pairAddress: string
  ): PennysiaPair {
    return new PennysiaPair(token0, token1, reserves, liquiditySupply, pairAddress)
  }

  // Check if pair has sufficient liquidity for trade
  public hasSufficientLiquidity(
    inputToken: Token,
    inputAmount: string,
    isLong: boolean
  ): boolean {
    try {
      this.getOutputAmount(inputToken, inputAmount, isLong)
      return true
    } catch (error) {
      return false
    }
  }

  // Get pair identifier
  public get pairKey(): string {
    return `${this.token0.address}-${this.token1.address}`
  }

  public toString(): string {
    return `${this.token0.symbol}/${this.token1.symbol}`
  }
}
