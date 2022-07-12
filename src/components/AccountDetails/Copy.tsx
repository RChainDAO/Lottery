import { Trans } from '@lingui/macro'
import useCopyClipboard from 'hooks/useCopyClipboard'
import React, { useCallback } from 'react'
import { CheckCircle, Copy } from 'react-feather'
import styled from 'styled-components/macro'
import { LinkStyledButton } from 'theme'

const CopyIcon = styled(LinkStyledButton)<{
  fontSize:number
}>`
  color: ${({ color, theme }) => color || theme.text3};
  flex-shrink: 0;
  display: flex;
  text-decoration: none;
  font-size: ${({fontSize})=>fontSize}px;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ color, theme }) => color || theme.text2};
  }
`
const TransactionStatusText = styled.span<{
  fontSize: number
}>`
  margin-left: 0.25rem;
  font-size: ${({fontSize})=> fontSize}px;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

interface BaseProps {
  toCopy: string
  color?: string
  size?: number
}
export type CopyHelperProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

export default function CopyHelper({ color, toCopy, children,size = 12 }: CopyHelperProps) {
  const [isCopied, setCopied] = useCopyClipboard()
  const copy = useCallback((e) => {
    e.stopPropagation();
    setCopied(toCopy)
  }, [toCopy, setCopied])

  return (
    <CopyIcon style={{display: "inline-block"}} fontSize={size} onClick={copy} color={color}>
      &nbsp;
      {isCopied ? (
        <TransactionStatusText fontSize={size} style={{display: "inline-block"}} >
          <CheckCircle size={size} />
          <TransactionStatusText fontSize={size}  style={{display: "inline-block"}}>
            <Trans>Copied</Trans>
          </TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText fontSize={size} style={{display: "inline-block"}} >
          <Copy size={size} />
        </TransactionStatusText>
      )}
      {isCopied ? '' : children}
    </CopyIcon>
  )
}
