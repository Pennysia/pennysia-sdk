import Big from 'big.js'

// Configure Big.js for precision
Big.DP = 40 // decimal places
Big.RM = Big.roundHalfUp // rounding mode

export class PennysiaAMM {
  // Fee is 0.3% (3/1000)
  private static readonly FEE_NUMERATOR = 3
  private static readonly FEE_DENOMINATOR = 1000

  /**
   * Calculate output amount for a given input amount
   * Based on Market.sol logic: fee is deducted from output
   */
  static getAmountOut(
    amountIn: string,
    reserveIn: string,
    reserveOut: string
  ): string {
    if (new Big(amountIn).lte(0)) {
      throw new Error('Amount in must be greater than 0')
    }
    if (new Big(reserveIn).lte(0) || new Big(reserveOut).lte(0)) {
      throw new Error('Reserves must be greater than 0')
    }

    const amountInBig = new Big(amountIn)
    const reserveInBig = new Big(reserveIn)
    const reserveOutBig = new Big(reserveOut)

    // Calculate new reserve after input
    const newReserveIn = reserveInBig.plus(amountInBig)
    
    // Calculate new reserve out using constant product formula
    const newReserveOut = reserveInBig.times(reserveOutBig).div(newReserveIn)
    
    // Calculate gross amount out
    const grossAmountOut = reserveOutBig.minus(newReserveOut)
    
    // Deduct fee from output (fee = grossAmountOut * 3/1000)
    const fee = grossAmountOut.times(this.FEE_NUMERATOR).div(this.FEE_DENOMINATOR)
    const netAmountOut = grossAmountOut.minus(fee)

    return netAmountOut.toFixed(0) // Return as integer string
  }

  /**
   * Calculate input amount needed for a given output amount
   * Based on RouterLibrary.sol logic: fee-inclusive calculation
   */
  static getAmountIn(
    amountOut: string,
    reserveIn: string,
    reserveOut: string
  ): string {
    if (new Big(amountOut).lte(0)) {
      throw new Error('Amount out must be greater than 0')
    }
    if (new Big(reserveIn).lte(0) || new Big(reserveOut).lte(0)) {
      throw new Error('Reserves must be greater than 0')
    }

    const amountOutBig = new Big(amountOut)
    const reserveInBig = new Big(reserveIn)
    const reserveOutBig = new Big(reserveOut)

    // Calculate fee-inclusive amount out (divUp equivalent)
    const amountOutWithFee = amountOutBig.times(this.FEE_DENOMINATOR + this.FEE_NUMERATOR).div(this.FEE_DENOMINATOR)
    
    // Check if we have enough reserves
    if (amountOutWithFee.gte(reserveOutBig)) {
      throw new Error('Insufficient reserves for requested output')
    }

    // Calculate new reserve out after withdrawal
    const newReserveOut = reserveOutBig.minus(amountOutWithFee)
    
    // Calculate required input using constant product formula
    const newReserveIn = reserveInBig.times(reserveOutBig).div(newReserveOut)
    const amountIn = newReserveIn.minus(reserveInBig)

    return amountIn.toFixed(0) // Return as integer string
  }

  /**
   * Calculate liquidity tokens to mint for given token amounts
   * Based on Market.sol addLiquidity logic
   */
  static getLiquidityMinted(
    totalSupply: string,
    tokenAAmount: string,
    tokenBAmount: string,
    reserveA: string,
    reserveB: string
  ): string {
    const totalSupplyBig = new Big(totalSupply)
    
    if (totalSupplyBig.eq(0)) {
      // First liquidity provision - use geometric mean
      const tokenABig = new Big(tokenAAmount)
      const tokenBBig = new Big(tokenBAmount)
      return tokenABig.times(tokenBBig).sqrt().toFixed(0)
    }

    // Subsequent liquidity provision - proportional to existing reserves
    const tokenABig = new Big(tokenAAmount)
    const tokenBBig = new Big(tokenBAmount)
    const reserveABig = new Big(reserveA)
    const reserveBBig = new Big(reserveB)

    const liquidityA = tokenABig.times(totalSupplyBig).div(reserveABig)
    const liquidityB = tokenBBig.times(totalSupplyBig).div(reserveBBig)

    // Return the minimum to ensure both tokens are fully utilized
    return liquidityA.lt(liquidityB) ? liquidityA.toFixed(0) : liquidityB.toFixed(0)
  }

  /**
   * Calculate token amounts to receive when burning liquidity
   */
  static getLiquidityValue(
    liquidity: string,
    totalSupply: string,
    reserveA: string,
    reserveB: string
  ): { amountA: string; amountB: string } {
    const liquidityBig = new Big(liquidity)
    const totalSupplyBig = new Big(totalSupply)
    const reserveABig = new Big(reserveA)
    const reserveBBig = new Big(reserveB)

    const amountA = liquidityBig.times(reserveABig).div(totalSupplyBig)
    const amountB = liquidityBig.times(reserveBBig).div(totalSupplyBig)

    return {
      amountA: amountA.toFixed(0),
      amountB: amountB.toFixed(0)
    }
  }

  /**
   * Calculate price impact for a trade
   */
  static getPriceImpact(
    amountIn: string,
    reserveIn: string,
    reserveOut: string
  ): string {
    const amountInBig = new Big(amountIn)
    const reserveInBig = new Big(reserveIn)
    const reserveOutBig = new Big(reserveOut)

    // Price before trade
    const priceBefore = reserveOutBig.div(reserveInBig)
    
    // Price after trade
    const newReserveIn = reserveInBig.plus(amountInBig)
    const amountOut = this.getAmountOut(amountIn, reserveIn, reserveOut)
    const newReserveOut = reserveOutBig.minus(amountOut)
    const priceAfter = newReserveOut.div(newReserveIn)

    // Price impact as percentage
    const priceImpact = priceBefore.minus(priceAfter).div(priceBefore).times(100)
    
    return priceImpact.toFixed(4) // Return as percentage with 4 decimal places
  }
}
