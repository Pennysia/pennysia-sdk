// Market contract ABI - contract interface
export const MARKET_ABI = [
  // View functions
  'function pairs(uint256 pairId) external view returns (uint128 reserve0Long, uint128 reserve0Short, uint128 reserve1Long, uint128 reserve1Short, uint64 blockTimestampLast, uint192 cbrtPriceX128CumulativeLast)',
  'function tokenBalances(address token) external view returns (uint256)',
  'function getPairId(address token0, address token1) external view returns (uint256)',
  'function getReserves(uint256 pairId) external view returns (uint128 reserve0Long, uint128 reserve0Short, uint128 reserve1Long, uint128 reserve1Short)',
  'function getSweepable(address token) external view returns (uint256)',
  'function owner() external view returns (address)',
  
  // State-changing functions
  'function createLiquidity(address to, address token0, address token1, uint256 amount0Long, uint256 amount0Short, uint256 amount1Long, uint256 amount1Short) external returns (uint256 pairId, uint256 liquidity0Long, uint256 liquidity0Short, uint256 liquidity1Long, uint256 liquidity1Short)',
  'function withdrawLiquidity(address to, address token0, address token1, uint256 liquidity0Long, uint256 liquidity0Short, uint256 liquidity1Long, uint256 liquidity1Short) external returns (uint256 pairId, uint256 amount0, uint256 amount1)',
  'function swap(address to, address[] calldata path, uint256 amountIn) external returns (uint256 amountOut)',
  'function lpSwap(address to, address token0, address token1, bool longToShort0, uint256 liquidity0, bool longToShort1, uint256 liquidity1) external returns (uint256 pairId, uint256 liquidityOut0, uint256 liquidityOut1)',
  'function sweep(address[] calldata tokens, uint256[] calldata amounts, address[] calldata to) external',
  'function flash(address to, address[] calldata tokens, uint256[] calldata amounts) external',
  'function setOwner(address _owner) external',
  
  // Events
  'event Create(address indexed token0, address indexed token1, uint256 pairId)',
  'event Mint(address indexed sender, address indexed to, uint256 indexed pairId, uint256 amount0, uint256 amount1)',
  'event Burn(address indexed sender, address indexed to, uint256 indexed pairId, uint256 amount0, uint256 amount1)',
  'event Sweep(address indexed sender, address[] to, address[] tokens, uint256[] amounts)',
  'event Flash(address indexed sender, address to, address[] tokens, uint256[] amounts, uint256[] paybackAmounts)',
  'event Swap(address indexed sender, address indexed to, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)',
  'event LiquiditySwap(address indexed sender, address indexed to, uint256 indexed pairId, bool longToShort0, uint256 liquidity0, uint256 liquidityOut0, bool longToShort1, uint256 liquidity1, uint256 liquidityOut1)',
  
  // Errors
  'error forbidden()',
  'error pairNotFound()',
  'error excessiveSweep()',
  'error minimumLiquidity()',
  'error invalidPath()',
] as const

// Router contract ABI - based on IRouter interface
export const ROUTER_ABI = [
  // View functions
  'function quoteLiquidity(address token0, address token1, uint256 amountLong0, uint256 amountShort0, uint256 amountLong1, uint256 amountShort1) external view returns (uint256 longX, uint256 shortX, uint256 longY, uint256 shortY)',
  'function quoteReserve(address token0, address token1, uint256 longX, uint256 shortX, uint256 longY, uint256 shortY) external view returns (uint256 amountLong0, uint256 amountShort0, uint256 amountLong1, uint256 amountShort1)',
  'function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut)',
  'function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountIn)',
  'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)',
  'function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts)',
  
  // State-changing functions
  'function addLiquidity(address token0, address token1, uint256 amount0Long, uint256 amount0Short, uint256 amount1Long, uint256 amount1Short, uint256 longXMinimum, uint256 shortXMinimum, uint256 longYMinimum, uint256 shortYMinimum, address to, uint256 deadline) external payable returns (uint256 longX, uint256 shortX, uint256 longY, uint256 shortY)',
  'function removeLiquidity(address token0, address token1, uint256 longX, uint256 shortX, uint256 longY, uint256 shortY, uint256 amount0Minimum, uint256 amount1Minimum, address to, uint256 deadline) external payable returns (uint256 amount0, uint256 amount1)',
  'function swap(uint256 amountIn, uint256 amountOutMinimum, address[] calldata path, address to, uint256 deadline) external payable returns (uint256 amountOut)',
  'function liquiditySwap(address token0, address token1, bool longToShort0, uint256 liquidity0, bool longToShort1, uint256 liquidity1, uint256 liquidity0OutMinimum, uint256 liquidity1OutMinimum, address to, uint256 deadline) external payable returns (uint256 liquidityOut0, uint256 liquidityOut1)',
  'function sweepNative(address to) external',
  
  // Errors
  'error slippage()',
  'error forbidden()',
] as const

// Liquidity contract ABI - based on ILiquidity interface
export const LIQUIDITY_ABI = [
  // View functions
  'function name() external view returns (string memory)',
  'function symbol() external view returns (string memory)',
  'function decimals() external view returns (uint8)',
  'function totalSupply(uint256 poolId) external view returns (uint128 longX, uint128 shortX, uint128 longY, uint128 shortY)',
  'function balanceOf(address account, uint256 poolId) external view returns (uint128 longX, uint128 shortX, uint128 longY, uint128 shortY)',
  'function allowance(address owner, address spender, uint256 poolId) external view returns (uint256)',
  'function nonces(address owner, uint256 poolId) external view returns (uint256)',
  'function DOMAIN_SEPARATOR() external view returns (bytes32)',
  
  // State-changing functions
  'function approve(address spender, uint256 poolId, uint256 value) external returns (bool)',
  'function transfer(address to, uint256 poolId, uint128 longX, uint128 shortX, uint128 longY, uint128 shortY) external returns (bool)',
  'function transferFrom(address from, address to, uint256 poolId, uint128 longX, uint128 shortX, uint128 longY, uint128 shortY) external returns (bool)',
  'function permit(address owner, address spender, uint256 poolId, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external returns (bool)',
  
  // Events
  'event Approval(address indexed owner, address indexed spender, uint256 indexed poolId, uint256 value)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed poolId, uint128 longX, uint128 shortX, uint128 longY, uint128 shortY)',
  
  // Errors
  'error InsufficientAllowance()',
  'error InvalidAddress()',
] as const

// Payment interface ABI - based on IPayment interface
export const PAYMENT_ABI = [
  'function requestToken(address to, address[] memory tokens, uint256[] memory paybackAmounts) external payable',
  'function requestLiquidity(address to, uint256 poolId, uint128 amountForLongX, uint128 amountForShortX, uint128 amountForLongY, uint128 amountForShortY) external',
] as const

// Multicall interface ABI - based on IMulticall interface
export const MULTICALL_ABI = [
  'function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)',
] as const

// Standard ERC20 ABI - based on IERC20 interface
export const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address recipient, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
  
  // Additional standard ERC20 functions (commonly used)
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const
