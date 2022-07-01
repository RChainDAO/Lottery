/* eslint-disable */
import './page.scss'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Box, Button, Link } from 'rebass/styled-components'
import { RowBetween, RowFixed } from 'components/Row'
import { NotSmallOnly, SmallOnly, ThemedText } from 'theme'
import { Trans } from '@lingui/macro'
import styled, { ThemeContext } from 'styled-components/macro'
import { BaseButton, ButtonGray, ButtonLight, ButtonOutlined } from 'components/Button'
import { Input } from '@rebass/forms'
import { ReactComponent as ArrowRight } from '../../assets/images/arrow_right.svg'
import { ReactComponent as ArrowLeft } from '../../assets/images/arrow_left.svg'
import { FlyoutAlignment, NewMenu } from 'components/Menu'
import { ChevronDown } from 'react-feather'
import { ApplicationModal } from 'state/application/reducer'
import { useToggleModal } from 'state/application/hooks'


interface PageProps {
    onChangePage: (value: number) => void
    onChangePageSize: (value: number) => void
    page: number | undefined
    size: number | undefined
    total: number | undefined
    marginTop: number | undefined
    showJump: boolean | undefined
    showTotal: boolean | undefined
    showEnds: boolean | undefined
    mutipleRow: boolean | undefined
}

const ButtonGrayNumber = styled(ButtonGray)`
    width: 26px;
    height: 26px;
    font-size: 10pt;
    padding: 12px;
`

const ButtonEllipsis = styled(ButtonGray)`
    width: 26px;
    height: 26px;
    font-size: 10pt;
    padding: 12px;
    background-color: transparent;
`

const ButtonOutlinedNumber = styled(ButtonOutlined)`
width: 26px;
height: 26px;
font-size: 8pt;
padding: 10px;
`

const ButtonLightArrow = styled(ButtonOutlined)`
    padding: 6px;
    height: 22px;
    width: 22px;
    text-align: center;
`

const MenuItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-weight: 500;
  font-size: 10pt;
`

const PageLabel = styled(ThemedText.Main)`
    font-size: 8pt;
    ${({ theme }) => theme.text1};
`

const Menu = styled(NewMenu)`
  margin-left: 0;
  a {
    width: 100%;
  }
`

const MoreOptionsButton = styled(ButtonGray)`
  border-radius: 12px;
  flex: 1 1 auto;
  padding: 6px 8px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg0};
  margin-right: 8px;
`

export default function CustomPage({
    onChangePage,
    onChangePageSize,
    page = 1,
    size = 10,
    total = 0,
    marginTop = 5,
    showJump = true,
    showTotal = true,
    showEnds = true,
    mutipleRow = false,
    ...rest
}: PageProps) {
    // page ,number
    // size ,number
    // total,number
    // changePage
    // showJump,true/false
    // showTotal
    // showEnds

    const pageCount = Math.ceil(total / size)
    const toggle = useToggleModal(ApplicationModal.POOL_OVERVIEW_OPTIONS)
    const go2Page = useCallback((p) => {
        if (p > 0 && p <= pageCount) {
            onChangePage(p)
        }
    }, [])

    const nextPage = useCallback(
        () => {
            const n = page + 1
            go2Page(n)
        },
        [onChangePage]
    )

    const prePage = useCallback(
        () => {
            const n = page - 1
            go2Page(n)
        },
        [onChangePage]
    )

    const initPage: Number[] = [];
    const [pageArr, setPageArr] = useState(initPage)

    function initializationPage() {
        const totalPage = Math.ceil(total / size)
        const firstPage = 1
        let result = [firstPage];
        if (page > 4) {
            result.push(0)
        }
        if (page > 3) {
            result.push(page - 2)
            result.push(page - 1)
        }
        else if (page > 2) {
            result.push(page - 1)
        }
        if (page > firstPage) {
            result.push(page)
        }
        if (page + 1 < totalPage) {
            result.push(page + 1)
        }
        if (page + 2 < totalPage) {
            result.push(page + 2)
        }
        if (page + 3 < totalPage) {
            result.push(0)
        }
        if (totalPage > page) {
            result.push(totalPage)
        }
        setPageArr(result)
    }

    useEffect(() => {
        initializationPage()
    }, [page, total, size])
    const menuItems = [
        {
            content: (
                <MenuItem>
                    <Trans>10</Trans>
                </MenuItem>
            ),
            external: false,
            link: "#",
            onClick: () => {
                toggle()
                onChangePageSize(10)
                go2Page(1)
            },
        },
        {
            content: (
                <MenuItem>
                    <Trans>20</Trans>
                </MenuItem>
            ),
            external: false,
            link: "#",
            onClick: () => {
                toggle()
                onChangePageSize(20)
                go2Page(1)
            },
        },
        {
            content: (
                <MenuItem>
                    <Trans>50</Trans>
                </MenuItem>
            ),
            external: false,
            link: "#",
            onClick: () => {
                toggle()
                onChangePageSize(50)
                go2Page(1)
            },
        },
    ]

    const fromItemIdx = ((page - 1) * size + 1) > total ? total : ((page - 1) * size + 1)
    const toItemIdx = (page * size) > total ? total : (page * size)

    return (
        !mutipleRow ? <>
            <RowBetween marginTop={marginTop} marginBottom={2}>
                <NotSmallOnly>
                    <RowFixed style={{ minWidth: "140px" }}>
                        <PageLabel><Trans>Showing {fromItemIdx} - {toItemIdx} out of {total}</Trans></PageLabel>
                    </RowFixed>
                </NotSmallOnly>
                <SmallOnly><RowFixed></RowFixed></SmallOnly>
                <RowFixed>
                    <ButtonLightArrow mr={2} onClick={prePage}><ArrowLeft /></ButtonLightArrow>

                    {
                        pageArr.map((i, idx) =>
                            <RowFixed key={idx.valueOf()}>
                                <PageLabel>
                                    {
                                        i === 0 ? <ButtonEllipsis mr="0px">...</ButtonEllipsis>
                                            : (
                                                page == i ?
                                                    <ButtonGrayNumber mr="0px">{i}</ButtonGrayNumber>
                                                    :
                                                    <ButtonOutlinedNumber mr={2} onClick={() => onChangePage(i.valueOf())}>{i}</ButtonOutlinedNumber>
                                            )
                                    }
                                </PageLabel>
                            </RowFixed>
                        )
                    }
                    <ButtonLightArrow ml={2} onClick={nextPage}><ArrowRight /></ButtonLightArrow>

                </RowFixed>
                <SmallOnly><RowFixed></RowFixed></SmallOnly>
                <NotSmallOnly>
                    <RowFixed  style={{ minWidth: "140px", display:"flex", justifyContent:"flex-end" }}>
                        <PageLabel mr={2}><Trans>Show rows</Trans></PageLabel>
                        <Menu
                            menuItems={menuItems}
                            flyoutAlignment={FlyoutAlignment.RIGHT}
                            ToggleUI={(props: any) => (
                                <MoreOptionsButton {...props}>
                                    <ThemedText.Body style={{ alignItems: 'center', display: 'flex', fontSize: "10pt" }}>
                                        {size}
                                        <ChevronDown size={15} />
                                    </ThemedText.Body>
                                </MoreOptionsButton>
                            )}
                        />
                    </RowFixed>
                </NotSmallOnly>
            </RowBetween>
            <SmallOnly>
                <RowBetween marginBottom={2}>
                    <RowFixed>
                        <PageLabel><Trans>Showing {fromItemIdx} - {toItemIdx} out of {total}</Trans></PageLabel>
                    </RowFixed>
                    <RowFixed>
                        <PageLabel mr={2}><Trans>Show rows</Trans></PageLabel>
                        <Menu
                            menuItems={menuItems}
                            flyoutAlignment={FlyoutAlignment.LEFT}
                            ToggleUI={(props: any) => (
                                <MoreOptionsButton {...props}>
                                    <ThemedText.Body style={{ alignItems: 'center', display: 'flex', fontSize: "10pt" }}>
                                        {size}
                                        <ChevronDown size={15} />
                                    </ThemedText.Body>
                                </MoreOptionsButton>
                            )}
                        />
                    </RowFixed>
                </RowBetween>
            </SmallOnly>
        </>
            :
            <>
                <RowBetween marginTop={marginTop} marginBottom={2}>
                    <RowFixed></RowFixed>
                    <RowFixed>
                        <ButtonLightArrow mr={2} onClick={prePage}><ArrowLeft /></ButtonLightArrow>

                        {
                            pageArr.map((i, idx) =>
                                <RowFixed key={idx.valueOf()}>
                                    <PageLabel>
                                        {
                                            i === 0 ? <ButtonEllipsis mr="0px">...</ButtonEllipsis>
                                                : (
                                                    page == i ?
                                                        <ButtonGrayNumber mr="0px">{i}</ButtonGrayNumber>
                                                        :
                                                        <ButtonOutlinedNumber mr={2} onClick={() => onChangePage(i.valueOf())}>{i}</ButtonOutlinedNumber>
                                                )
                                        }
                                    </PageLabel>
                                </RowFixed>
                            )
                        }
                        <ButtonLightArrow ml={2} onClick={nextPage}><ArrowRight /></ButtonLightArrow>

                    </RowFixed>
                    <RowFixed></RowFixed>
                </RowBetween>
                <RowBetween marginBottom={2}>
                    <RowFixed>
                        <PageLabel><Trans>Showing {fromItemIdx} - {toItemIdx} out of {total}</Trans></PageLabel>
                    </RowFixed>
                    <RowFixed>

                    </RowFixed>
                </RowBetween>
            </>
    )
}