import ethereumLogoUrl from 'assets/images/ethereum-logo.png'

import { SupportedChainId, SupportedL1ChainId } from './chains'

export enum NetworkType {
  L1,
  L2,
}

interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

export type ChainInfoMap = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo }

export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://rchaindao.com/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://rchaindao.com/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.TESTNET]: {
    networkType: NetworkType.L1,
    docs: 'https://rchaindao.com/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://https://rchaindao.com/',
    label: 'TestEthereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'CPAY Ether', symbol: 'CPAY', decimals: 18 },
  },
}
