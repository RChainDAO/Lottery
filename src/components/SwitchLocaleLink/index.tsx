import { Trans } from '@lingui/macro'
import { useLocationLinkProps } from 'hooks/useLocationLinkProps'
import { useMemo } from 'react'
import styled from 'styled-components/macro'

import { DEFAULT_LOCALE, LOCALE_LABEL, SupportedLocale } from '../../constants/locales'
import { navigatorLocale, useActiveLocale } from '../../hooks/useActiveLocale'
import { StyledInternalLink, ThemedText } from '../../theme'
import { SUPPORTED_LOCALES } from 'constants/locales'

const Container = styled(ThemedText.Label)`

`

const useTargetLocale = (activeLocale: SupportedLocale) => {
  if(activeLocale ===  SUPPORTED_LOCALES[0]){
    return SUPPORTED_LOCALES[1]
  }
  else{
    return SUPPORTED_LOCALES[0]
  }
  // const browserLocale = useMemo(() => navigatorLocale(), [])

  // if (browserLocale && (browserLocale !== DEFAULT_LOCALE || activeLocale !== DEFAULT_LOCALE)) {
  //   if (activeLocale === browserLocale) {
  //     return DEFAULT_LOCALE
  //   } else {
  //     return browserLocale
  //   }
  // }
  // return null
}

export function SwitchLocaleLink() {
  const activeLocale = useActiveLocale()
  const targetLocale = useTargetLocale(activeLocale)
  const { to, onClick } = useLocationLinkProps(targetLocale)
  if (!targetLocale || !to) return null

  return (
    <Container>
      {
        (activeLocale === "zh-CN" && (
          <>
            <StyledInternalLink onClick={onClick} to={to} color="#1f128d !important">
              <ThemedText.Body color="#fff" display="inline" style={{ textDecoration: 'underline'}}>EN</ThemedText.Body>
            </StyledInternalLink><span> / </span><ThemedText.Body color="#fff" display="inline" opacity="0.5">中文</ThemedText.Body>
          </>
        )
        )
        ||
        <>
          <ThemedText.Body color="#fff" display="inline"  opacity="0.5">EN</ThemedText.Body><span> / </span>
          <StyledInternalLink onClick={onClick} to={to} color="#1f128d !important">
            <ThemedText.Body color="#fff" display="inline"  style={{ textDecoration: 'underline'}}>中文</ThemedText.Body>
          </StyledInternalLink>
        </>
      }
    </Container>
  )
}
