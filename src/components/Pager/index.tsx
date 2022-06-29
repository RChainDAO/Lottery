/* eslint-disable */
import './page.scss'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Box, Button, Link } from 'rebass/styled-components'
import { RowBetween, RowFixed } from 'components/Row'
import { ThemedText } from 'theme'
import { Trans } from '@lingui/macro'
import styled, { ThemeContext } from 'styled-components/macro'
import { ButtonGray, ButtonLight, ButtonOutlined } from 'components/Button'
import { Input } from '@rebass/forms'


interface PageProps {
    onChangePage: (value: number) => void
    page: number | undefined
    size: number | undefined
    total: number | undefined
    marginTop: number | undefined
    showJump: boolean | undefined
    showTotal: boolean | undefined
    showEnds: boolean | undefined
}

const ButtonGrayNumber = styled(ButtonGray)`
    width: 12pt;
    height: 12pt;
    font-size: 10pt;
    padding: 12pt;
`

const ButtonOutlinedNumber = styled(ButtonOutlined)`
width: 12pt;
height: 12pt;
font-size: 10pt;
padding: 10pt;
`
const ButtonLightArrow = styled(ButtonLight)`
    width：12pt;
    height: 10pt !important;
    fontSize: 8pt !important;
    font-size: 10pt;
    padding: 10pt;
`
export default function CustomPage({
    onChangePage,
    page = 1,
    size = 10,
    total = 1,
    marginTop = 5,
    showJump = true,
    showTotal = true,
    showEnds = true,
    ...rest
}: PageProps) {
    // page ,number
    // size ,number
    // total,number
    // changePage
    // showJump,true/false
    // showTotal
    // showEnds

    const pageCount = Math.ceil(total/size)
    const enterKeyCallback = useCallback(
        (e) => {
            const value = e.target.value
            if (e.nativeEvent.keyCode === 13) {
                if (value == '') {
                    return
                }
                onChangePage(parseInt(value))
                setJumpPage('')
            }
        },
        [onChangePage]
    )

    const jumPageCallback = useCallback(
        (e) => {
            const value = e.target.value
            const totalPage = Math.ceil(total / size)
            if (value != '') {
                if (parseInt(value) > 0) {
                    if (parseInt(value) > totalPage) {
                        onChangePage(totalPage)
                        setJumpPage(totalPage+"")
                    } else {
                        onChangePage(parseInt(value))
                        setJumpPage(value)
                    }
                }
            } else {
                setJumpPage('')
            }
        },
        [onChangePage]
    )
    
    const go2Page = useCallback((p) => {
        if(p > 0 && p <= pageCount){
            onChangePage(p)
        }
    },[])

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

    const lastPage = useCallback(
        () => {
            const n = pageCount
            go2Page(n)
        },
        [onChangePage]
    )

    const firstPage = useCallback(
        () => {
            const n = 1
            go2Page(n)
        },
        [onChangePage]
    )
    const initPage: Number[] = [];
    const [pageArr, setPageArr] = useState(initPage)
    const [jumpPage, setJumpPage] = useState('')

    function initializationPage() {
        const totalPage = Math.ceil(total / size)
        let result = [];
        if (totalPage < 11) {
            for (let i = 0; i < totalPage; i++) {
                result.push(i + 1);
            }
        } else if (page > 5 && (totalPage - page) > 3) {
            result = [page - 5, page - 4, page - 3, page - 2, page - 1, page, page + 1, page + 2, page + 3, page + 4]
        } else if (page > 5 && totalPage - page < 4) {
            result = [totalPage - 9, totalPage - 8, totalPage - 7, totalPage - 6, totalPage - 5, totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage]
        } else if (page < 6 && totalPage > 9) {
            for (let i = 0; i < 10; i++) {
                result.push(i + 1);
            }
        }
        setPageArr(result)
    }

    useEffect(() => {
        initializationPage()
    }, [page, total, size])
    const theme = useContext(ThemeContext)
    return (
        <RowBetween marginTop={marginTop} marginBottom={2}>
            <RowFixed>
                {
                    showTotal && <RowFixed>
                        <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                            <Trans>Total:</Trans>
                        </ThemedText.Main>
                        <ThemedText.Label ml="6px" fontSize="8pt" color={theme.text1}>
                            {total}
                        </ThemedText.Label>
                        <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                            <Trans>items</Trans>
                        </ThemedText.Main>
                    </RowFixed>
                }
                {showEnds && <RowFixed>
                    <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                        <ButtonLightArrow mr={2} onClick={firstPage}>{"<<"}</ButtonLightArrow>
                    </ThemedText.Main>
                </RowFixed>
                }
                <RowFixed>
                    <ThemedText.Main ml="6px" color={theme.text1}>
                        <ButtonLightArrow mr={2} onClick={prePage}>{"<"}</ButtonLightArrow>
                    </ThemedText.Main>
                </RowFixed>
                {
                    pageArr.map(i =>
                        <RowFixed key={i.valueOf()}>
                            <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                                {
                                    page == i ?
                                    <ButtonGrayNumber mr="0px">{i}</ButtonGrayNumber>
                                    :
                                    <ButtonOutlinedNumber mr={2} onClick={()=>onChangePage(i.valueOf())}>{i}</ButtonOutlinedNumber>
                                }
                            </ThemedText.Main>
                        </RowFixed>
                    )
                }
                <RowFixed>
                    <ThemedText.Main ml="6px" color={theme.text1}>
                        <ButtonLightArrow mr={2} onClick={nextPage}>{">"}</ButtonLightArrow>
                    </ThemedText.Main>
                </RowFixed>
                {showEnds && <RowFixed>
                    <ThemedText.Main ml="6px" color={theme.text1}>
                        <ButtonLightArrow mr={2} onClick={lastPage}>{">>"}</ButtonLightArrow>
                    </ThemedText.Main>
                </RowFixed>
                }
                {showJump && <RowFixed>
                    <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                        <Trans>go to</Trans>
                    </ThemedText.Main>
                    <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                        <Box marginLeft={1} width="40pt">
                            <Input
                                id='page'
                                name='page'
                                type='number'
                                placeholder='1'
                                value={jumpPage}
                                onChange={jumPageCallback} 
                                onKeyPress={enterKeyCallback}
                            />
                        </Box>
                    </ThemedText.Main>
                    <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                        <Trans>page</Trans>
                    </ThemedText.Main>
                </RowFixed>
                }
            </RowFixed>
        </RowBetween>
    )
}