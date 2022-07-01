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
const LanguageSeperater = styled.span`
  color: #ffffff;
  font-size: 16px;
  
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`

const Language = styled(ThemedText.Language)`
  font-size: 16px;
  
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
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
              <Language color="#fff" display="inline" style={{ textDecoration: 'underline'}}>EN</Language>
            </StyledInternalLink><LanguageSeperater> / </LanguageSeperater><Language color="#fff" display="inline" opacity="0.5">中文</Language>
          </>
        )
        )
        ||
        <>
          <Language color="#fff" display="inline"  opacity="0.5">EN</Language><LanguageSeperater> / </LanguageSeperater>
          <StyledInternalLink onClick={onClick} to={to} color="#1f128d !important">
            <Language color="#fff" display="inline"  style={{ textDecoration: 'underline'}}>中文</Language>
          </StyledInternalLink>
        </>
      }
    </Container>
  )
}
