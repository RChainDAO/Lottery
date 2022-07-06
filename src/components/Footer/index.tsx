// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { RowBetween, RowFixed } from "components/Row";
import { useContext } from "react";
import styled, { ThemeContext } from 'styled-components/macro'
import { ExternalLink } from "theme";

const Link = styled(ExternalLink)`
:hover {
  text-decoration: none;
}

:focus {
  outline: none;
  text-decoration: none;
}`

const FooterRow = styled(RowBetween)`
    font-size: 14px;
    
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
`};
`

export default function Footer() {

    const theme = useContext(ThemeContext)

    return <>
        <FooterRow color={theme.text2}><RowFixed>                <Link
            style={{ color: theme.text2, paddingBottom: '2px', borderBottom: "solid 1px", fontStyle: 'italic' }}
            href="https://rchaindao.com/"
            target="_blank"
        >
            <Trans>RCHAIN DAO Foundation 2022</Trans>
        </Link></RowFixed><RowFixed><Trans>© All Rights Reserved</Trans></RowFixed></FooterRow>
    </>
}