import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }
export const LOTTERY_FACTORY_ADDRESS: AddressMap = constructSameAddressMap('0xb94579149647a77A5880ba6b39Fd371Ca417f5c5',[
  SupportedChainId.TESTNET,
  SupportedChainId.MAINNET,
])

export const LOTTERY_COIN_ADDRESS: AddressMap = constructSameAddressMap('0xc8754E609cb35C1D04D50734761beC38b7dA9278',[
  SupportedChainId.TESTNET,
  SupportedChainId.MAINNET,
])

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984', [
    SupportedChainId.TESTNET,
    SupportedChainId.MAINNET,
  ])
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
}

export const MERKLE_DISTRIBUTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e',
}

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}