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
    market: '0xe3b11A98E34aA76e3F03F45dF63cce75C7ECcBdf',
    router: '0x6cAEB59821A29845eddf5ea7b54850eDdD14AF0f',
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
