import { Web3Provider } from '@ethersproject/providers'
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react'
import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { INFURA_NETWORK_URLS } from 'constants/infura'
import { InjectedConnector } from 'web3-react-injected-connector'
import { WalletConnectConnector } from 'web3-react-walletconnect-connector'

import getLibrary from '../utils/getLibrary'
import { NetworkConnector } from './NetworkConnector'


export const network = new NetworkConnector({
  urls: INFURA_NETWORK_URLS,
  defaultChainId: 1,
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(network.provider))
}

export const injected = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
})

export const gnosisSafe = new SafeAppConnector()

export const walletconnect = new WalletConnectConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
  rpc: INFURA_NETWORK_URLS,
  qrcode: true,
})
