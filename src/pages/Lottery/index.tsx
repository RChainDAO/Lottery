// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
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
import { RowBetween, RowFixed, FullRow } from 'components/Row'
import { useCurrencyBalance } from 'state/wallet/hooks'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useUserLotteryInfo, useLotteryDetailInfo, LotteryState, useLotteryLocalState, useLotteryLocalActionHandlers, useLotteryPlayerPage } from 'state/lottery/hooks'
import CustomPage from 'components/Pager'
import Toast from 'components/Toast'
import { LoadingDataView } from 'components/ModalViews'
import { useLotteryCount, useLotteryPage, useLastActiveLottery } from 'state/lotteryFactory/hooks'
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
import JSBI from 'jsbi'

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
  margin-left: 20px;
  margin-right: 20px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-left: 0px;
    margin-right: 0px;
  `};
`

const ModalCard = styled(LightGreyCard)`
  flex: 3;
  padding: 8px 12px;
`

const DetailInfoRow = styled(RowBetween)`
  margin-top: 4px;
  margin-bottom: 4px;  
`

const DetailInfoCard = styled(LightCard)`
  display: flex;
  flex-direction: column;
  margin: 2px;
  padding: 10px;
`
const PoolAmountCard = styled(LightCard)`
  margin: 2px;
  padding: 10px;
`

const TextTitle = styled(Text)`
  font-size: 10pt;
  text-align: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 2vw;
  `};
`
const TextValue = styled(Text)`
  flex: 1;
  text-align: center;
  font-size: 12pt;
  min-height: 21px;
  vertical-align: middle;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 2.5vw;
  `};
`

const TimeValue = styled(TextValue)`

`

const TextTitleBigger = styled(TextTitle)`
  font-size: 14pt;
  text-align: center;
  font-weight: 700;
  display: block;
  vertical-align: middle;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 3.1vw;
  `};
`
const TextValueBigger = styled(Text)`
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12pt;
  padding: 6px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 3vw;
  `};
`
const TextValueLong = styled(TextValue)`
  font-size: 14pt !important;
  ${({ theme }) => theme.mediaWidth.upToLarge`
      font-size: 3vw !important;
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
  padding-left: 20px;
  padding-right: 20px;
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
    font-size: 11pt;
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
  const lotteryCount = useLotteryCount(lotteryFactoryContract)
  const lotterises = useLotteryPage(lotteryCurPage, lotteryPageSize, lotteryFactoryContract)
  const lastActiveLottery = useLastActiveLottery(lotteryFactoryContract)
  if (lastActiveLottery && !selectedLottery) {
    onLotterySelection(lastActiveLottery)
  }
  const lotteryContract = useLotteryContract(selectedLottery, true)
  const coinToken = useToken(coinAddress) || undefined
  const [lotteryDetail, loadingLottery] = useLotteryDetailInfo(lotteryContract, coinToken)
  const [depositedAmount, entryTime] = useUserLotteryInfo(account, lotteryContract, coinToken)
  const [approvalState, approveCallback] = useApproveCallback(lotteryDetail?.minAmount, selectedLottery)
  const [players, loadingPlayers] = useLotteryPlayerPage(playerCurPage, playerPageSize, lotteryContract)

  const locale = useActiveLocale()
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
      const msg = (err?.result?.error?.message) || (err?.data?.message)
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
      const msg = (err?.result?.error?.message) || (err?.data?.message)
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
      else if(lotteryDetail?.state === LotteryState.Finish){
        return t`Finished`
      }
      else if(lotteryDetail?.state === LotteryState.WaitLucyDraw){
        return t`Wait Luck Draw`
      }
      else if(lotteryDetail?.state === LotteryState.WaitStart){
        return t`Pending`
      }
      else if(lotteryDetail?.state === LotteryState.Pausing){
        return t`Pausing`
      }
      const day = Math.floor(remainTime / (3600 * 24));
      const hour = Math.floor(remainTime % (3600 * 24) / 3600);
      const min = Math.floor(remainTime % 3600 / 60);
      const sec = Math.floor(remainTime % 60);
      const dayDesc = day > 1 ? t`Days` : t`Day`
      const hourDesc = hour > 1 ? t`Hours` : t`Hour`
      const minDesc = min > 1 ? t`Minutes` : t`Minute`
      const secDesc = day > 1 ? t`Seconds` : t`Second`
      return day + " " + dayDesc + " " + hour + " " + hourDesc + " " + min + " " + minDesc
    }
    return ""
  }, [remainTime, lotteryDetail?.state, locale])

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
                <ThemedText.Yellow>
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
                (lotteryCount === 0 && <Trans>No Lottery Exist</Trans>)
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
              selectedLottery && selectedLottery.length > 0 && <Copy toCopy={selectedLottery} style={{ display: "inline-block", marginLeft: "22px" }}>
                <span style={{ marginLeft: '3px', display: "inline-block" }}>
                  <Trans>Copy Address</Trans>
                </span>
              </Copy>
            }
            <InlineText style={{ flex: "1" }}></InlineText>
            <ChevronDown size={24} />
          </RowBetween>

        </BodySectionCard>
      </WrapperCard>
      <WrapperCard>
        <BodySectionCard height="auto">
          <DetailInfoRow>
            <FullRow>
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
                }</TextValue>
              </DetailInfoCard>
            </FullRow>
          </DetailInfoRow>
          <DetailInfoRow>
            <FullRow>
              <DetailInfoCard flex="1" width="100%">
                <TextTitle><Trans>Start Time</Trans></TextTitle>
                <TimeValue>{loadingLottery ? <LoadingDataView /> : dateTimeDesc(lotteryDetail?.startTime)}</TimeValue>
              </DetailInfoCard>
              <DetailInfoCard flex="1" width="100%">
                <TextTitle><Trans>Remaining Time</Trans></TextTitle>
                <TimeValue>{(loadingLottery) ? <LoadingDataView /> : remainTimeStr}</TimeValue>
              </DetailInfoCard>
            </FullRow>
          </DetailInfoRow>
          <DetailInfoRow>
            <FullRow>
              <DetailInfoCard flex="1">
                <TextTitle><Trans>Min Amount</Trans></TextTitle>
                <TextValue>{loadingLottery ? <LoadingDataView /> : currencyInfo(lotteryDetail?.minAmount)}</TextValue>
              </DetailInfoCard>
              <DetailInfoCard flex="1">
                <TextTitle><Trans>Player Count</Trans></TextTitle>
                <TextValue>{loadingLottery ? <LoadingDataView /> : (lotteryDetail?.playerCount === undefined ? "" : CurrencyAmount.fromRawAmount(new Token(1, ZERO_ADDRESS, 1, "temp", "temp"), JSBI.BigInt(lotteryDetail?.playerCount?.toString()||"0")).toFixed(0, { groupSeparator: ',' }))  }</TextValue>
              </DetailInfoCard>
              <PoolAmountCard flex="1" style={{ backgroundColor: theme.darkMode ? "rgb(74,230,200)" : "rgb(74,230,200)", color: "rgb(200,84,213)", verticalAlign: "middle" }}>
                <TextTitleBigger><Trans>Pool Amount</Trans></TextTitleBigger>
                <TextValueBigger>{loadingLottery ? <LoadingDataView /> : currencyInfo(lotteryDetail?.prize)}</TextValueBigger>
              </PoolAmountCard>
            </FullRow>
          </DetailInfoRow>
          {
            entryTime > 0 && (
              <DetailInfoRow>
                <FullRow>
                  <DetailInfoCard>
                    <TextTitle><Trans>My Deposited</Trans></TextTitle>
                    <TextValue>{loadingLottery ? <LoadingDataView /> : currencyInfo(depositedAmount)}</TextValue>
                  </DetailInfoCard>
                </FullRow>
              </DetailInfoRow>
            )
          }
          {
            lotteryDetail?.state === LotteryState.Finish && <DetailInfoRow>
              <FullRow>
                <DetailInfoCard>
                  <TextTitle><Trans>Winner</Trans></TextTitle>
                  <TextValueLong>{
                    (loadingLottery && <LoadingDataView />)
                    ||
                    ((lotteryDetail?.winner && lotteryDetail.winner !== ZERO_ADDRESS) && <span style={{ color: "rgb(200,84,213)", fontWeight: 700 }}>{lotteryDetail?.winner}</span>)
                    ||
                    ((lotteryDetail?.state && lotteryDetail?.state === LotteryState.Finish) && <Trans>No Winner</Trans>)
                    ||
                    <Trans>Not yet drawn</Trans>
                  }
                  </TextValueLong>
                </DetailInfoCard>
              </FullRow>
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
                    <span>{depositedAmount?.greaterThan(0) ? "Add" : ""} Deposit</span>
                  </ThemedText.Label>
                </ButtonPrimary>
              </>
            )
          }
        </BodySectionCard>
        <BodySectionCard display="flex" flexDirection="column">
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
        </BodySectionCard>
      </WrapperCard>
      <Modal isOpen={showLotteryList} onDismiss={onLotteryListDismiss} minHeight={20}>
        <ModalCard display="flex" flexDirection="column">
          <RowBetween marginTop={2} marginBottom={3}>
            <RowFixed>
              <TextWrapper>
                <Trans>Lotteries list</Trans>:
              </TextWrapper>
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

