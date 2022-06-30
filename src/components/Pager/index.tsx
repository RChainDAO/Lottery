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
    width: 12pt;
    height: 12pt;
    font-size: 10pt;
    padding: 12pt;
`

const ButtonEllipsis = styled(ButtonGray)`
    width: 12pt;
    height: 12pt;
    font-size: 10pt;
    padding: 12pt;
    background-color: transparent;
`

const ButtonOutlinedNumber = styled(ButtonOutlined)`
width: 12pt;
height: 12pt;
font-size: 8pt;
padding: 10pt;
`

const ButtonLightArrow = styled(ButtonOutlined)`
    padding: 5px;
    height: 22pt;
    width: 22pt;
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

const PageNumber = styled(Box)`
    width: 40pt;
${({ theme }) => theme.mediaWidth.upToSmall`
    width: 30pt;
`};
`

const SmallCenter = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
    margin: 0 auto;
  `};
`

const Menu = styled(NewMenu)`
  margin-left: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 1 1 auto;
    width: 49%;
    right: 0px;
  `};

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
        // let leftPageLabel = page - 1
        // let rightPageLabel = page + 1

        // for(let i = 0; i < 2 && leftPageLabel > firstPage; i++){
        //     leftPageLabel
        // }
        // if(leftPageLabel > firstPage){

        // }
        // if (totalPage < 11) {
        //     for (let i = 0; i < totalPage; i++) {
        //         result.push(i + 1);
        //     }
        // } else if (page > 5 && (totalPage - page) > 3) {
        //     result = [page - 5, page - 4, page - 3, page - 2, page - 1, page, page + 1, page + 2, page + 3, page + 4]
        // } else if (page > 5 && totalPage - page < 4) {
        //     result = [totalPage - 9, totalPage - 8, totalPage - 7, totalPage - 6, totalPage - 5, totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage]
        // } else if (page < 6 && totalPage > 9) {
        //     for (let i = 0; i < 10; i++) {
        //         result.push(i + 1);
        //     }
        // }
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
    return (
        !mutipleRow ? <>
            <RowBetween marginTop={marginTop} marginBottom={2}>
                <NotSmallOnly>
                    <RowFixed style={{ minWidth: "120pt" }}>
                        <PageLabel><Trans>Showing {((page - 1) * size + 1) > total ? total : ((page - 1) * size + 1)} - {(page * size) > total ? total : (page * size)} out of {total}</Trans></PageLabel>
                    </RowFixed>
                </NotSmallOnly>
                <SmallOnly><RowFixed></RowFixed></SmallOnly>
                <RowFixed>
                    <ButtonLightArrow mr={2} onClick={prePage}><ArrowLeft /></ButtonLightArrow>

                    {
                        pageArr.map((i, idx) =>
                            <RowFixed key={idx.valueOf()}>
                                <PageLabel ml="6px">
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
                    <RowFixed style={{ minWidth: "90pt" }}>
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
                </NotSmallOnly>
            </RowBetween>
            <SmallOnly>
                <RowBetween marginBottom={2}>
                    <RowFixed style={{ minWidth: "120pt" }}>
                        <PageLabel><Trans>Showing {(page - 1) * size + 1} - {page * size} out of {total}</Trans></PageLabel>
                    </RowFixed>
                    <RowFixed style={{ minWidth: "100pt" }}>
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
                                <PageLabel ml="6px">
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
                    <RowFixed style={{ minWidth: "120pt" }}>
                        <PageLabel><Trans>Showing {(page - 1) * size + 1} - {page * size} out of {total}</Trans></PageLabel>
                    </RowFixed>
                    <RowFixed style={{ minWidth: "100pt" }}>
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
            </>
    )
}