import { ChainId } from './chains'

export interface ContractAddresses {
  market?: string
  router?: string
}

// Pennysia contract addresses - deployed on Sonic Blaze Testnet
export const CONTRACT_ADDRESSES: Record<ChainId, ContractAddresses> = {
  [ChainId.MAINNET]: {
    // Not supported in MVP
  },
  [ChainId.SEPOLIA]: {
    // Not supported in MVP
  },
  [ChainId.SONIC]: {
    // Not supported in MVP
  },
  [ChainId.SONIC_BLAZE_TESTNET]: {
    market: '0x1b4C769a1E14C9dbB158da0b9E3e5A53826AA9F5',
    router: '0x91205B2C56bc078B5777Fc96919A6CA4f7BDc3C7',
  },
}

export function getMarketAddress(chainId: ChainId): string | undefined {
  return CONTRACT_ADDRESSES[chainId]?.market
}

export function getRouterAddress(chainId: ChainId): string | undefined {
  return CONTRACT_ADDRESSES[chainId]?.router
}

export function getContractAddresses(chainId: ChainId): ContractAddresses {
  return CONTRACT_ADDRESSES[chainId] || {}
}
