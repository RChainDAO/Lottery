// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCallback, useContext, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import { ButtonPrimary } from '../../components/Button'
import { LightCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { Wrapper } from '../../components/Lottery/styleds'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { LotteryField } from '../../state/lottery/actions'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import AppBody from '../AppBody'
import { useTokenContract, useLotteryContract, useLotteryFactoryContract } from 'hooks/useContract'
import { LOTTERY_COIN_ADDRESS, LOTTERY_FACTORY_ADDRESS } from 'constants/addresses'
import { LightGreyCard } from 'components/Card'
import { RowBetween, RowFixed, FullRow, StretchRow } from 'components/Row'
import { useCurrencyBalance } from 'state/wallet/hooks'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useUserLotteryInfo, useLotteryDetailInfo, LotteryState, useLotteryLocalState, useLotteryLocalActionHandlers, useLotteryPlayerPage } from 'state/lottery/hooks'
import CustomPage from 'components/Pager'
import Toast from 'components/Toast'
import { LoadingDataView } from 'components/ModalViews'
import { useLotteryPage, useLastActiveLottery } from 'state/lotteryFactory/hooks'
import Modal from 'components/Modal'
import Copy from 'components/AccountDetails/Copy'
import { ExternalLink, ThemedText } from 'theme'
import { ChevronDown } from 'react-feather'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { ZERO_ADDRESS } from 'constants/misc'
import { useToken } from 'hooks/Tokens'
import { CardSection, DataCard } from 'components/earn/styled'
import { shortenAddress } from 'utils'
import useInterval from 'lib/hooks/useInterval'
import { useActiveLocale } from 'hooks/useActiveLocale'
import { ReactComponent as Close } from '../../assets/images/x.svg'

const WrapperCard = styled.div`
  display: flex;
  justify-content: space-between;
  margin: auto;
  width: 100%;
  min-height: 100%;
  flex-direction: row;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
  `};
`

const BodySectionCard = styled(LightGreyCard)`
  flex: 3;
  padding: 8px 12px;
  margin-top: 4px;
  margin-bottom: 4px;
`

const BodySectionCardLeft = styled(BodySectionCard)`
  flex: 3;
  padding: 8px 12px;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-right: 10px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-right: 0px;
  `};
`

const BodySectionCardRight = styled(BodySectionCard)`
  margin-left: 10px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-left: 0px;
  `};
`

const ModalCard = styled(LightGreyCard)`
  flex: 3;
  padding: 8px 12px;
`

const DetailInfoRow = styled(StretchRow)`
  margin-top: 4px;
  margin-bottom: 4px;  
`

const DetailInfoCard = styled(LightCard)`
  display: flex;
  flex-direction: column;
  margin: 2px;
  padding: 10px;
`
const PoolAmountCard = styled(DetailInfoCard)`
`

const TextTitle = styled(Text)`
  font-size: 10pt;
  text-align: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 2vw;
  `};
`
const TextValue = styled(Text)`
  flex: 1;
  text-align: center;
  font-size: 12pt;
  vertical-align: middle;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 2.5vw;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 5px;
  `};
`

const TimeValue = styled(TextValue)`

`

const TextTitleBigger = styled(TextTitle)`
  font-size: 11pt;
  font-weight: 700;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 2.2vw;
  `};
`
const TextValueBigger = styled(TextValue)`
  font-weight: 600;
  font-size: 12pt;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 3vw;
  `};
`
const TextValueLong = styled(TextValue)`
  font-size: 11pt !important;
  ${({ theme }) => theme.mediaWidth.upToLarge`
      font-size: 2.5vw !important;
  `};
 `
const TextWrapper = styled(ThemedText.Main)`
  ml: 6px;
  font-size: 10pt;
  color: ${({ theme }) => theme.text1};
  margin-right: 6px !important;
`

const InlineText = styled(Text)`
  display: inline-block;
`

const TopSection = styled(AutoColumn)`
  width: 100%;
`

const InstructionCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const SwitchLocaleLinkWrapper = styled(ThemedText.White)`
  font-size: 13pt;
  flex: "1";
`

export const ShortLotteryAddress = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: block;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 8pt;
  `};
`
export const FullLotteryAddress = styled.span`
  display: block;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 16px;
  `};
`

const Link = styled(ExternalLink)`
  :hover {
    text-decoration: none;
  }

  :focus {
    outline: none;
    text-decoration: none;
}`

const CloseIcon = styled.div`
  padding-right: 5px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const LotteryCopy = styled(Copy)`

`

export default function Lottery({ history }: RouteComponentProps) {
  const theme = useContext(ThemeContext)
  const [lotteryPageSize, setLotteryPageSize] = useState(10)
  const [playerPageSize, setPlayerPageSize] = useState(10)
  const [playerCurPage, setPlayerCurPage] = useState(1)
  const [lotteryCurPage, setLotteryCurPage] = useState(1)
  const [showLotteryList, setShowLotteryList] = useState(false)

  const { account, chainId } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const showConnectAWallet = Boolean(!account)
  const { AMOUNT, selectedLottery, remainTime } = useLotteryLocalState()
  const { onUserInput, onLotterySelection, onRefreshRemainTime } = useLotteryLocalActionHandlers()
  const coinAddress = (account && chainId) ? LOTTERY_COIN_ADDRESS[chainId] : undefined;
  const lotteryFactoryAddress = (account && chainId) ? LOTTERY_FACTORY_ADDRESS[chainId] : undefined;
  const coinContract = useTokenContract(coinAddress, true)
  const lotteryFactoryContract = useLotteryFactoryContract(lotteryFactoryAddress, true)
  const [lotterises, lotteryCount] = useLotteryPage(lotteryCurPage, lotteryPageSize, lotteryFactoryContract)
  const lastActiveLottery = useLastActiveLottery(lotteryFactoryContract)
  if (!account && !!selectedLottery) {
    onLotterySelection(undefined)
  }
  else if (lastActiveLottery && !selectedLottery) {
    onLotterySelection(lastActiveLottery)
  }
  const lotteryContract = useLotteryContract(selectedLottery, true)
  const coinToken = useToken(coinAddress) || undefined
  const [lotteryDetail, loadingLottery] = useLotteryDetailInfo(lotteryContract, coinToken)
  const [depositedAmount, entryTime] = useUserLotteryInfo(account, lotteryContract, coinToken)
  const [approvalState, approveCallback] = useApproveCallback(lotteryDetail?.minAmount, lotteryFactoryAddress)
  const [players, loadingPlayers] = useLotteryPlayerPage(playerCurPage, playerPageSize, lotteryContract)
  const locale = useActiveLocale()
  const hasWinner = lotteryDetail?.winner && lotteryDetail.winner !== ZERO_ADDRESS
  useInterval(() => {
    if (lotteryDetail && lotteryDetail.stopTime) {
      const rt = lotteryDetail?.stopTime - Date.now().valueOf() / 1000
      if (rt >= 0) {
        onRefreshRemainTime(rt)
      }
      else {
        onRefreshRemainTime(0)
      }
    }
    else {
      onRefreshRemainTime(undefined)
    }
  }, 1000)

  const handleApprove = useCallback(async () => {
    let ok = true
    await approveCallback().catch((err) => {
      ok = false
      const msg = (err?.result?.error?.message) || (err?.data?.message) || (err?.reason)
      if (msg) {
        Toast(msg)
      }
    }).finally(() => {
      if (ok) {
        Toast(t`approve success, please wait the block confirm.`)
      }
    })
  }, [approveCallback])

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(AMOUNT.typedValue, coinToken),
    [coinToken, AMOUNT.typedValue]
  )
  const handleParticipate = useCallback(async () => {
    const quotient = parsedAmount?.quotient;
    if (!quotient) {
      Toast(t`please enter the deposit amount`)
      return
    }
    const amount = quotient.toString();
    if (!account || !lotteryContract || !coinContract || approvalState !== ApprovalState.APPROVED) {
      Toast(t`please approve the contract firstly`)
      return;
    }
    let ok = true
    lotteryContract.participate(amount).catch((err) => {
      ok = false
      const msg = (err?.result?.error?.message) || (err?.data?.message) || (err?.reason)
      if (msg) {
        Toast(msg)
      }
    }).finally(() => {
      if (ok) {
        Toast(t`deposit success, please wait the block confirm.`)
        if (lotteryDetail?.minAmount) {
          onUserInput(LotteryField.AMOUNT, lotteryDetail?.minAmount?.toExact())
        }
        else {
          onUserInput(LotteryField.AMOUNT, "0")
        }
      }
    })
  }, [account, lotteryContract, coinContract, approvalState, parsedAmount?.quotient, lotteryDetail?.minAmount, onUserInput])

  const currencies = { "AMOUNT": coinToken }
  const relevantTokenBalance = useCurrencyBalance(
    account ?? undefined,
    coinToken
  )
  const currencyBalances = useMemo(() => ({ "AMOUNT": relevantTokenBalance }), [relevantTokenBalance])
  const maxInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(currencyBalances[LotteryField.AMOUNT]),
    [currencyBalances]
  )

  if (!AMOUNT.typedValue && lotteryDetail && lotteryDetail.minAmount || (lotteryDetail && lotteryDetail.minAmount && Number.parseFloat(AMOUNT.typedValue) < Number.parseFloat(lotteryDetail.minAmount.toExact()))) {
    onUserInput(LotteryField.AMOUNT, lotteryDetail?.minAmount?.toExact())
  }
  const handleTypeInput = useCallback(
    (value: string) => {
      if (lotteryDetail && lotteryDetail.minAmount && Number.parseFloat(value) < Number.parseFloat(lotteryDetail.minAmount.toExact())) {
        Toast(t`deposit amount should bigger than ${lotteryDetail?.minAmount?.toExact() + " " + lotteryDetail.minAmount.currency.symbol}`)
      }
      onUserInput(LotteryField.AMOUNT, value)
    },
    [onUserInput, lotteryDetail]
  )
  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(LotteryField.AMOUNT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const handleChangePage = (page: number) => {
    //if (playerCurPage !== page) {
    setPlayerCurPage(page)
    //}
  }

  const handleChangeLotteryPage = (page: number) => {
    if (lotteryCurPage !== page) {
      setLotteryCurPage(page)
    }
  }

  const handleChangeLotteryPageSize = (pageSize: number) => {
    if (pageSize !== lotteryPageSize) {
      setLotteryPageSize(pageSize)
    }
  }

  const handleChangePlayerPageSize = (pageSize: number) => {
    if (pageSize !== playerPageSize) {
      setPlayerPageSize(pageSize)
    }
  }

  const dateTimeDesc = (time: number | undefined) => {
    if (!time || time === 0) {
      return ""
    }
    else {
      const dateFormat: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: "h24"
      }

      return new Date(time * 1000).toLocaleString(locale, dateFormat)
    }
  }

  const remainTimeStr = useMemo(() => {
    if (remainTime !== undefined) {
      if (remainTime <= 0) {
        return t`Finished`
      }
      else if (lotteryDetail?.state === LotteryState.Finish) {
        return t`Finished`
      }
      else if (lotteryDetail?.state === LotteryState.WaitLucyDraw) {
        return t`Wait Luck Draw`
      }
      else if (lotteryDetail?.state === LotteryState.WaitStart) {
        return t`Pending`
      }
      else if (lotteryDetail?.state === LotteryState.Pausing) {
        return t`Pausing`
      }
      else if (lotteryDetail?.state === LotteryState.Disable) {
        return t`Canceled`
      }
      const day = Math.floor(remainTime / (3600 * 24));
      const hour = Math.floor(remainTime % (3600 * 24) / 3600);
      const min = Math.floor(remainTime % 3600 / 60);
      const dayDesc = day > 1 ? t`Days` : t`Day`
      const hourDesc = hour > 1 ? t`Hours` : t`Hour`
      const minDesc = min > 1 ? t`Minutes` : t`Minute`
      return day + " " + dayDesc + " " + hour + " " + hourDesc + " " + min + " " + minDesc
    }
    return ""
  }, [remainTime, lotteryDetail?.state])

  const currencyInfo = (currency: CurrencyAmount<Currency> | undefined) => {
    if (!currency) {
      return ""
    }
    return currency.toFixed(0, { groupSeparator: ',' }) + " " + currency.currency.symbol
  }

  function onLotteryListDismiss() {
    setShowLotteryList(false)
  }

  const handleShowLotteryList = useCallback(() => {
    if (lotteryCount && lotteryCount > 0) {
      setShowLotteryList(true)
    }
  }, [lotteryCount])

  const handleSelectLottery = useCallback((a) => {
    onUserInput(LotteryField.AMOUNT, "0")
    onLotterySelection(a.lotteryAddress ?? "")
    setShowLotteryList(false)
  }, [onUserInput, onLotterySelection, setShowLotteryList])

  const formatNum = useCallback((num: number): string => {
    const m = num.toString();
    const len = m.length;
    if (len <= 3) return m;
    const n = len % 3;
    if (n > 0) {
      return m.slice(0, n) + "," + m.slice(n, len)?.match(/\d{3}/g)?.join(",")
    } else {
      return m.slice(n, len)?.match(/\d{3}/g)?.join(",") || m
    }
  }, [])
  return (
    <>
      <TopSection gap="md">
        <InstructionCard>
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <ThemedText.White fontSize={20} fontWeight={600}>
                  <Trans>Game Instructions</Trans>
                </ThemedText.White>
                <SwitchLocaleLinkWrapper>
                  <SwitchLocaleLink />
                </SwitchLocaleLinkWrapper>

              </RowBetween>
              <RowBetween>
                <ThemedText.White fontSize={14}>
                  <ol>
                    <li> <Trans>When each round of the lottery pool begins, the organizer will transfer a certain amount of RDAOs to the lottery pool.</Trans></li>
                    <li> <Trans>Each participant only needs to pay 100 RDAOs in order to participate.</Trans></li>
                    <li> <Trans>All participating RDAOs are accumulated in the lottery pool.</Trans></li>
                    <li> <Trans>At the end of each round, one lucky player will be randomly selected by the blockchain.</Trans></li>
                    <li> <Trans>The lottery pool will then automatically transfer all accumulated RDAOs to the lucky player.</Trans></li>
                  </ol>
                </ThemedText.White>
              </RowBetween>
              <RowBetween>
                <ThemedText.Yellow fontWeight={locale === "zh-CN" ? 600 : 500}>
                  <Trans>*Lottery pools are run on the blockchain. Our game code is fully open source. Final interpretation is at the organizer&apos;s discretion.</Trans>
                </ThemedText.Yellow>
              </RowBetween>
              <RowBetween>
                <Link
                  style={{ color: 'white', paddingBottom: '2px', borderBottom: "solid 1px", fontStyle: 'italic' }}
                  href="https://github.com/rchaindao/lottery"
                  target="_blank"
                >
                  <ThemedText.White fontSize={14}>
                    <Trans>https://github.com/rchaindao/lottery</Trans>
                  </ThemedText.White>
                </Link>
              </RowBetween>
            </AutoColumn>
          </CardSection>
        </InstructionCard>
      </TopSection>
      <WrapperCard>
        <BodySectionCard height="auto">
          <RowBetween style={{ cursor: "pointer", padding: "5px" }} onClick={handleShowLotteryList}>
            <InlineText fontWeight={500} fontSize={16} marginLeft={'12px'}>
              {
                (!lotteryCount && <Trans>No Lottery Exist</Trans>)
                ||
                ((!selectedLottery || selectedLottery.length === 0) && <Trans>Select A Lottery Contract</Trans>)
                ||
                (
                  <>
                    <ShortLotteryAddress><Trans>Lottery: {shortenAddress(selectedLottery || '')}</Trans></ShortLotteryAddress>
                    <FullLotteryAddress><Trans>Lottery: {selectedLottery}</Trans></FullLotteryAddress>
                  </>
                )
              }
            </InlineText>
            {
              selectedLottery && selectedLottery.length > 0 && <LotteryCopy size={8} toCopy={selectedLottery}>
                <span style={{ marginLeft: '3px', display: "inline-block" }}>
                  <Trans>Copy Address</Trans>
                </span>
              </LotteryCopy>
            }
            <InlineText style={{ flex: "1" }}></InlineText>
            <ChevronDown size={24} />
          </RowBetween>

        </BodySectionCard>
      </WrapperCard>
      <WrapperCard>
        <BodySectionCardLeft height="auto">
          <DetailInfoRow>
            <DetailInfoCard>
              <TextTitle><Trans>State</Trans></TextTitle>
              <TextValue>{
                (loadingLottery && <LoadingDataView />)
                ||
                ((lotteryDetail?.state === LotteryState.Running) && <Trans>Running</Trans>)
                ||
                ((lotteryDetail?.state === LotteryState.Finish) && <Trans>Finished</Trans>)
                ||
                ((lotteryDetail?.state === LotteryState.WaitLucyDraw) && <Trans>Wait Luck Draw</Trans>)
                ||
                ((lotteryDetail?.state === LotteryState.WaitStart) && <Trans>Pending</Trans>)
                ||
                ((lotteryDetail?.state === LotteryState.Pausing) && <Trans>Pausing</Trans>)
                ||
                ((lotteryDetail?.state === LotteryState.Disable) && <Trans>Canceled</Trans>)
              }</TextValue>
            </DetailInfoCard>
          </DetailInfoRow>
          <DetailInfoRow>
            <DetailInfoCard flex="1" width="100%">
              <TextTitle><Trans>Start Time</Trans></TextTitle>
              <TimeValue>{loadingLottery ? <LoadingDataView /> : dateTimeDesc(lotteryDetail?.startTime)}</TimeValue>
            </DetailInfoCard>
            <DetailInfoCard flex="1" width="100%">
              <TextTitle><Trans>Remaining Time</Trans></TextTitle>
              <TimeValue>{(loadingLottery) ? <LoadingDataView /> : remainTimeStr}</TimeValue>
            </DetailInfoCard>
          </DetailInfoRow>
          <DetailInfoRow>
            <DetailInfoCard flex="1">
              <TextTitle><Trans>Min Amount</Trans></TextTitle>
              <TextValue>{loadingLottery ? <LoadingDataView /> : currencyInfo(lotteryDetail?.minAmount)}</TextValue>
            </DetailInfoCard>
            <DetailInfoCard flex="1">
              <TextTitle><Trans>Player Count</Trans></TextTitle>
              <TextValue>{loadingLottery ? <LoadingDataView /> : (lotteryDetail?.playerCount === undefined ? "" : formatNum(lotteryDetail.playerCount))}</TextValue>
            </DetailInfoCard>
            <PoolAmountCard flex="1" style={{ backgroundColor: "#3ee4c4" }}>
              <TextTitleBigger><Trans>Pool Amount</Trans></TextTitleBigger>
              <TextValueBigger>{loadingLottery ? <LoadingDataView /> : currencyInfo(lotteryDetail?.prize)}</TextValueBigger>
            </PoolAmountCard>
          </DetailInfoRow>
          {
            entryTime > 0 && (
              <DetailInfoRow>
                <DetailInfoCard>
                  <TextTitle><Trans>My Deposited</Trans></TextTitle>
                  <TextValue>{loadingLottery ? <LoadingDataView /> : currencyInfo(depositedAmount)}</TextValue>
                </DetailInfoCard>
              </DetailInfoRow>
            )
          }
          {
            lotteryDetail?.state === LotteryState.Finish && <DetailInfoRow>
              <DetailInfoCard style={{ backgroundColor: hasWinner ? "#E8006F" : theme.bg1 }}>
                <TextTitle style={{ color: hasWinner ? "#ffffff" : theme.text1 }}>
                  <Trans>Winner</Trans>
                </TextTitle>
                <TextValueLong style={{ color: hasWinner ? "#ffffff" : theme.text1 }}>{
                  (loadingLottery && <LoadingDataView />)
                  ||
                  (hasWinner && <span style={{ fontWeight: 700 }}>{lotteryDetail?.winner}</span>)
                  ||
                  ((lotteryDetail?.state && lotteryDetail?.state === LotteryState.Finish) && <Trans>No Winner</Trans>)
                  ||
                  <Trans>Not yet drawn</Trans>
                }
                </TextValueLong>
              </DetailInfoCard>
            </DetailInfoRow>
          }
          {showConnectAWallet && (
            <ButtonPrimary marginTop={3} marginBottom={3} onClick={toggleWalletModal}>
              <Trans>Connect a wallet</Trans>
            </ButtonPrimary>
          )}

          {!showConnectAWallet && (lotteryDetail?.manager !== account) && (approvalState !== ApprovalState.APPROVED) && (lotteryDetail?.state === LotteryState.Running) && (
            <>
              <RowBetween marginTop={50}>
                <FullRow>
                  <ThemedText.Main fontSize="12pt" color={theme.text1} width="100%" textAlign="center">
                    <Trans>Please approve firstly</Trans>
                  </ThemedText.Main>
                </FullRow>
              </RowBetween>
              <ButtonPrimary disabled={approvalState === ApprovalState.PENDING} marginTop={3} marginBottom={3} onClick={handleApprove}>
                <ThemedText.Label mb="4px">
                  <Trans>Approve</Trans>
                </ThemedText.Label>
              </ButtonPrimary>
            </>
          )
          }
          {
            !showConnectAWallet && (lotteryDetail?.manager !== account) && approvalState === ApprovalState.APPROVED && lotteryDetail?.state === LotteryState.Running && (
              <>
                <AppBody>
                  <Wrapper id="lottery-page">
                    <AutoColumn gap={'sm'}>
                      <div style={{ display: 'relative' }}>
                        <CurrencyInputPanel
                          hideInput={false}
                          value={AMOUNT.typedValue}
                          showMaxButton={true}
                          logoURIs={[`https://raw.githubusercontent.com/rchaindao/publicity/main/assets/RDAO_Circle_64.png`]}
                          currency={currencies[LotteryField.AMOUNT]}
                          onUserInput={handleTypeInput}
                          onMax={handleMaxInput}
                          fiatValue={undefined}
                          onCurrencySelect={undefined}
                          otherCurrency={currencies[LotteryField.AMOUNT]}
                          showCommonBases={true}
                          id="lottery-currency-input"
                        />
                      </div>
                    </AutoColumn>
                  </Wrapper>
                </AppBody>
                <ButtonPrimary disabled={!account || approvalState !== ApprovalState.APPROVED || lotteryDetail?.state !== LotteryState.Running} marginTop={30} onClick={handleParticipate}>
                  <ThemedText.Label mb="4px">
                    {depositedAmount?.greaterThan(0) ? <Trans>Add Deposit</Trans> : <Trans>Deposit</Trans>}
                  </ThemedText.Label>
                </ButtonPrimary>
              </>
            )
          }
        </BodySectionCardLeft>
        <BodySectionCardRight display="flex" flexDirection="column">
          <RowBetween marginTop={2} marginBottom={3}>
            <RowFixed>
              <ThemedText.Main ml="6px" fontSize="10pt" color={theme.text1}>
                <Trans>Players list</Trans>:
              </ThemedText.Main>
            </RowFixed>
          </RowBetween>
          <RowBetween flex="1" flexDirection="column">
            {
              loadingPlayers && <LoadingDataView />
            }
            {!loadingPlayers && players.map((a, i) => {
              return (
                <RowBetween key={i} marginTop={2} flex="1" marginBottom={2} height="20px">
                  <FullRow>
                    <ThemedText.Main flex="1" ml="6px" fontSize="8pt" color={theme.text1} style={{ overflow: "hidden", display: "inline-block", whiteSpace: "nowrap", textOverflow: "ellipsis", msTextOverflow: "ellipsis" }}>
                      {!(a.entryTime && a.entryTime > 0) ? "" : a.address}
                    </ThemedText.Main>
                    <ThemedText.Main ml="6px" fontSize="8pt" color={theme.text1}>
                      <span>{dateTimeDesc(a.entryTime)}</span>
                    </ThemedText.Main>
                  </FullRow>
                </RowBetween>
              )
            })}
          </RowBetween>
          <CustomPage marginTop={2} mutipleRow={false} onChangePage={handleChangePage} onChangePageSize={handleChangePlayerPageSize} page={playerCurPage} size={playerPageSize} total={lotteryDetail?.playerCount} showJump={true} showEnds={true} showTotal={true} ></CustomPage>
        </BodySectionCardRight>
      </WrapperCard>
      <Modal isOpen={showLotteryList} onDismiss={onLotteryListDismiss} minHeight={20}>
        <ModalCard display="flex" flexDirection="column">
          <RowBetween marginTop={2} marginBottom={3}>
            <RowFixed>
              <TextWrapper>
                <Trans>Lotteries list</Trans>:
              </TextWrapper>
            </RowFixed>
            <RowFixed>
              <CloseIcon onClick={onLotteryListDismiss}>
                <CloseColor />
              </CloseIcon>
            </RowFixed>
          </RowBetween>
          <RowBetween flex="1" flexDirection="column">
            {
              lotterises.map((a, i) => {
                return (
                  <RowBetween key={i} marginTop={2} flex="1" marginBottom={2} height="20px">
                    <FullRow>
                      <ThemedText.Main flex="2" ml="6px" fontSize="12px" color={theme.text1} style={{ overflow: "hidden", cursor: "pointer", display: "inline-block", whiteSpace: "nowrap", textOverflow: "ellipsis", msTextOverflow: "ellipsis" }}>
                        <span onClick={() => { handleSelectLottery(a) }}>
                          {!(a.createTime && a.createTime > 0) ? "" : a.lotteryAddress}
                        </span>
                      </ThemedText.Main>
                      <ThemedText.Main ml="6px" fontSize="12px" color={theme.text1}>
                        <span>{dateTimeDesc(a.createTime)}</span>
                      </ThemedText.Main>
                    </FullRow>
                  </RowBetween>
                )
              })}
          </RowBetween>
          <CustomPage marginTop={5} mutipleRow={true} onChangePage={handleChangeLotteryPage} onChangePageSize={handleChangeLotteryPageSize} page={lotteryCurPage} size={lotteryPageSize} total={lotteryCount} showJump={true} showEnds={true} showTotal={true} ></CustomPage>
        </ModalCard>
      </Modal>
    </>
  )
}

