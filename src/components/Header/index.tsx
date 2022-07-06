import { Trans } from '@lingui/macro'
import useScrollPosition from '@react-hook/window-scroll'
import { ButtonTheme } from 'components/Button'
import { CHAIN_INFO } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useTheme from 'hooks/useTheme'
import { useCallback } from 'react'
import { Text } from 'rebass'
import { useDarkModeManager } from 'state/user/hooks'
import { useNativeCurrencyBalances } from 'state/wallet/hooks'
import styled from 'styled-components/macro'
import { NotMediumOnly, NotSmallOnly } from 'theme'

import { ReactComponent as Logo } from '../../assets/svg/logo.svg'
import Menu from '../Menu'
import Web3Status from '../Web3Status'
import HolidayOrnament from './HolidayOrnament'
import NetworkSelector from './NetworkSelector'

const HeaderFrame = styled.div<{ showBackground: boolean }>`
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding-left: 2rem;
  padding-top: 0.5rem;
  padding-right: 2rem;
  padding-bottom: 0.5rem;
  z-index: 21;
  position: relative;
  /* Background slide effect on scroll. */
  background-image: ${({ theme }) => `linear-gradient(to bottom, transparent 50%, ${theme.bg0} 50% )}}`};
  background-position: ${({ showBackground }) => (showBackground ? '0 -100%' : '0 0')};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) => (showBackground ? theme.bg2 : 'transparent;')};
  transition: background-position 0.1s, box-shadow 0.1s;
  background-blend-mode: hard-light;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 20vw 1fr ;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: 20vw 1fr ;
  `};
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  &:not(:first-child) {
    margin-left: 0.5em;
  }

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`

const HideSmallHeaderElement = styled(HeaderElement)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  display: none;
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg0 : theme.bg0)};
  border-radius: 16px;
  white-space: nowrap;
  width: 100%;
  height: 40px;

  :focus {
    border: 1px solid blue;
  }
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  :hover {
    cursor: pointer;
  }
`

const RdaoLogo = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
  width: 200px;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 20vw;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 25vw;
    margin-left: -10px
  `};
`

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? '']
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const { white, black } = useTheme()

  const scrollY = useScrollPosition()

  const {
    nativeCurrency: { symbol: nativeCurrencySymbol },
  } = CHAIN_INFO[chainId ? chainId : SupportedChainId.MAINNET]

  return (
    <HeaderFrame showBackground={scrollY > 45}>
      <Title href=".">
        <RdaoLogo>
          <Logo fill={darkMode ? white : black} width="100%" height="100%" title="logo" />
          <HolidayOrnament />
        </RdaoLogo>
      </Title>
      <HeaderControls>
        <HeaderElement>
          <AccountElement active={!!account}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0, userSelect: 'none' }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                <Trans>
                  {userEthBalance?.toSignificant(3)} {nativeCurrencySymbol}
                </Trans>
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElement  onClick={toggleDarkMode} style={{cursor: "pointer"}}>
          <ButtonTheme/>
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  )
}
