import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }
export const LOTTERY_FACTORY_ADDRESS: AddressMap = constructSameAddressMap('0x0A117D1e2d5c00bCE25619b8b1b46d2BADACd13d',[
  SupportedChainId.TESTNET
])

export const LOTTERY_COIN_ADDRESS: AddressMap = constructSameAddressMap('0x973Ff94d2357a43dF83da6075822855804FDC410',[
  SupportedChainId.TESTNET
])

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xaD0D0F9eC2e31e6f76087bf6d6d2F2631aEc95eA', [
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