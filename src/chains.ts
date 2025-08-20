export enum ChainId {
  MAINNET = 1,
  SEPOLIA = 11155111,
  SONIC = 146,
  SONIC_BLAZE_TESTNET = 57054,
}

export interface ChainInfo {
  id: ChainId
  name: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

// Default chain configurations - RPC URLs should be provided by the application
export const CHAIN_INFO: Record<ChainId, ChainInfo> = {
  [ChainId.MAINNET]: {
    id: ChainId.MAINNET,
    name: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [], // To be provided by application
    blockExplorerUrls: ['https://etherscan.io'],
  },
  [ChainId.SEPOLIA]: {
    id: ChainId.SEPOLIA,
    name: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [], // To be provided by application
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  [ChainId.SONIC]: {
    id: ChainId.SONIC,
    name: 'Sonic Mainnet',
    nativeCurrency: {
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.soniclabs.com'], // Public RPC
    blockExplorerUrls: ['https://explorer.soniclabs.com'],
  },
  [ChainId.SONIC_BLAZE_TESTNET]: {
    id: ChainId.SONIC_BLAZE_TESTNET,
    name: 'Sonic Blaze Testnet',
    nativeCurrency: {
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.blaze.soniclabs.com'], // Public RPC
    blockExplorerUrls: ['https://explorer.blaze.soniclabs.com'],
  },
}

// Helper function to get chain info with custom RPC URLs
export function getChainInfoWithRpc(chainId: ChainId, rpcUrls?: string[]): ChainInfo {
  const chainInfo = CHAIN_INFO[chainId]
  if (!chainInfo) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  
  return {
    ...chainInfo,
    rpcUrls: rpcUrls && rpcUrls.length > 0 ? rpcUrls : chainInfo.rpcUrls
  }
}

// Supported chains for Pennysia MVP (Sonic Blaze Testnet only)
export const SUPPORTED_CHAINS = [ChainId.SONIC_BLAZE_TESTNET]

export function getChainInfo(chainId: ChainId): ChainInfo | undefined {
  return CHAIN_INFO[chainId]
}

export function isChainSupported(chainId: number): chainId is ChainId {
  return SUPPORTED_CHAINS.includes(chainId as ChainId)
}
