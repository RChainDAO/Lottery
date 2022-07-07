import { Currency } from '@uniswap/sdk-core'
import { LOTTERY_COIN_ADDRESS } from 'constants/addresses'
import useCurrencyLogoURIs from 'lib/hooks/useCurrencyLogoURIs'
import React from 'react'
import styled from 'styled-components/macro'

import Logo from '../Logo'

const StyledLogo = styled(Logo)<{ size: string; native: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background: radial-gradient(white 50%, #ffffff00 calc(75% + 1px), #ffffff00 100%);
  border-radius: 50%;
  -mox-box-shadow: 0 0 1px ${({ native }) => (native === "1" ? 'white' : 'black')};
  -webkit-box-shadow: 0 0 1px ${({ native }) => (native === "1" ? 'white' : 'black')};
  box-shadow: 0 0 1px ${({ native }) => (native === "1" ? 'white' : 'black')};
  border: 0px solid rgba(255, 255, 255, 0);
`

export default function CurrencyLogo({
  currency,
  logoURIs = null,
  size = '24px',
  style,
  ...rest
}: {
  currency?: Currency | null
  logoURIs?: string[] | null
  size?: string
  style?: React.CSSProperties
}) {
  const logoURIsRemote = useCurrencyLogoURIs(currency)

  return (
    <StyledLogo
      size={size}
      native={currency?.isNative ? "1" : "0"}
      srcs={(logoURIs || logoURIsRemote)}
      alt={`${currency?.symbol ?? 'token'} logo`}
      style={style}
      {...rest}
    />
  )
}
