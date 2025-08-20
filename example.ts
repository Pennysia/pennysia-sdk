import { PennysiaSDK, ChainId, Token, PennysiaAMM } from './src/index'
import { ethers } from 'ethers'

async function example() {
  // Initialize provider (replace with your RPC URL)
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_INFURA_KEY')
  
  // Initialize SDK (without signer for read-only operations)
  const sdk = PennysiaSDK.create(ChainId.SEPOLIA, provider)
  
  // Create example tokens
  const USDC = new Token(
    ChainId.SEPOLIA,
    '0xA0b86a33E6441E8C8C0Dd7C0C3F8C7D0E8F9A0B1', // Example address
    6,
    'USDC',
    'USD Coin'
  )
  
  const WETH = sdk.getWETH()
  
  console.log('🚀 Pennysia SDK Example')
  console.log('Chain:', sdk.getChainInfo()?.name)
  console.log('Native Currency:', sdk.getNativeCurrency().symbol)
  
  // Example: Calculate swap amounts using built-in math
  const amountIn = '1000000' // 1 USDC (6 decimals)
  const reserveUSDC = '10000000000' // 10,000 USDC
  const reserveWETH = '5000000000000000000' // 5 WETH
  
  try {
    const amountOut = PennysiaAMM.getAmountOut(amountIn, reserveUSDC, reserveWETH)
    const priceImpact = PennysiaAMM.getPriceImpact(amountIn, reserveUSDC, reserveWETH)
    
    console.log('\n💱 Swap Calculation:')
    console.log(`Input: ${ethers.formatUnits(amountIn, 6)} USDC`)
    console.log(`Output: ${ethers.formatEther(amountOut)} WETH`)
    console.log(`Price Impact: ${priceImpact}%`)
    
    // Calculate reverse (how much USDC needed for 1 WETH)
    const oneWETH = ethers.parseEther('1').toString()
    const requiredUSDC = PennysiaAMM.getAmountIn(oneWETH, reserveUSDC, reserveWETH)
    console.log(`To get 1 WETH, need: ${ethers.formatUnits(requiredUSDC, 6)} USDC`)
    
  } catch (error) {
    console.error('Calculation error:', error)
  }
  
  // Example: Liquidity calculations
  console.log('\n💧 Liquidity Calculation:')
  const totalSupply = '1000000000000000000000' // 1000 LP tokens
  const tokenAAmount = '2000000000' // 2000 USDC
  const tokenBAmount = '1000000000000000000' // 1 WETH
  
  const liquidityMinted = PennysiaAMM.getLiquidityMinted(
    totalSupply,
    tokenAAmount,
    tokenBAmount,
    reserveUSDC,
    reserveWETH
  )
  
  console.log(`LP tokens to mint: ${ethers.formatEther(liquidityMinted)}`)
  
  // Example: Contract interactions (would require deployed contracts)
  console.log('\n📋 Contract Setup:')
  console.log('Market Address:', sdk.marketContract.target || 'Not deployed')
  console.log('Router Address:', sdk.routerContract.target || 'Not deployed')
  
  // Example: Create deadline for transactions
  const deadline = PennysiaSDK.createDeadline(20) // 20 minutes from now
  console.log(`Transaction deadline: ${new Date(deadline * 1000).toISOString()}`)
  
  console.log('\n✅ SDK is ready for frontend integration!')
}

// Run example if this file is executed directly
if (require.main === module) {
  example().catch(console.error)
}

export { example }
