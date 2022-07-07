// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import JSBI from 'jsbi'
import { useCallback, useContext, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Heading, Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { Wrapper } from '../../components/Lottery/styleds'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ThemedText, CloseIcon } from '../../theme'
import AppBody from '../AppBody'
import { useLotteryContract, useLotteryFactoryContract } from 'hooks/useContract'
import { LOTTERY_COIN_ADDRESS, LOTTERY_FACTORY_ADDRESS } from 'constants/addresses'
import { LightGreyCard } from 'components/Card'
import { RowBetween, RowFixed, FullRow } from 'components/Row'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useLotteryCount, useLotteryFactoryLocalState, useLotteryFactoryLocalActionHandlers, useLotteryPage } from 'state/lotteryFactory/hooks'
import CustomPage from 'components/Pager'
import { DateInput, TextInput } from 'components/TextInput'
import { LotteryState, useLotteryDetailInfo } from 'state/lottery/hooks'
import Modal from 'components/Modal'
import { AutoColumn } from 'components/Column'
import { LoadingView } from 'components/ModalViews'
import Toast from 'components/Toast'
import { ButtonPrimary } from 'components/Button'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { LotteryFactoryField } from 'state/lotteryFactory/actions'
import { isAddress } from 'utils'
import { useToken } from 'hooks/Tokens'
import { useActiveLocale } from 'hooks/useActiveLocale'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

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

const TextWrapper = styled(ThemedText.Main)`
  ml: 6px;
  font-size: 10pt;
  color: ${({ theme }) => theme.text1};
  margin-right: 6px !important;
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

const FormRow = styled(RowBetween)`
  margin-top: 10pt;
  margin-bottom: 10pt;
  justify-content: left;
`

const MarginerSmall = styled.div`
  margin-top: 1rem;
`


export default function LotteryFactory({ history }: RouteComponentProps) {
  const theme = useContext(ThemeContext)
  const [lotteryPageSize, setLotteryPageSize] = useState(10)
  const [curLotteryPage, setCurLotteryPage] = useState(1)
  const [errorMsg, setErrorMsg] = useState("")
  const { MIN_AMOUNT, LOTTERY_NAME, LOTTERY_MANAGER, LOTTERY_STARTTIME, LOTTERY_STOPTIME } = useLotteryFactoryLocalState()
  const { onUserInput } = useLotteryFactoryLocalActionHandlers()
  const { account, chainId } = useActiveWeb3React()
  if (account && !LOTTERY_MANAGER.typedValue) {
    onUserInput(LotteryFactoryField.LOTTERY_MANAGER, account)
  }
  const toggleWalletModal = useWalletModalToggle()
  const showConnectAWallet = Boolean(!account)
  const lotteryFactoryAddress = (account && chainId) ? LOTTERY_FACTORY_ADDRESS[chainId] : undefined;
  const lotteryFactoryContract = useLotteryFactoryContract(lotteryFactoryAddress, true)
  const lotteryCount = useLotteryCount(lotteryFactoryContract)
  const lotterise = useLotteryPage(curLotteryPage, lotteryPageSize, lotteryFactoryContract)
  const coinAddress = (account && chainId) ? LOTTERY_COIN_ADDRESS[chainId] : undefined;
  const coinToken = useToken(coinAddress) || undefined
  const [showLotteryDetail, setShowLotteryDetail] = useState(false)
  const [showLotteryAddress, setShowLotteryAddress] = useState("")
  const contract = useLotteryContract(showLotteryAddress)
  const [detail] = useLotteryDetailInfo(contract, coinToken)
  const [isLoadingLottery] = useState(!!detail?.name)
  const locale = useActiveLocale()

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(MIN_AMOUNT.typedValue, coinToken),
    [coinToken, MIN_AMOUNT.typedValue]
  )

  const handleChangePage = (page: number) => {
    if (curLotteryPage !== page) {
      setCurLotteryPage(page)
    }
  }

  const handleChangeLotteryPageSize = useCallback((pageSize: number) => {
    if (pageSize !== lotteryPageSize) {
      setLotteryPageSize(pageSize)
    }
  }, [lotteryPageSize])

  const pacificDateTimeString2Timestamp = (pacificDateTimeStr: string): number => {
    const localDateTime = new Date(pacificDateTimeStr)
    const localTimestamp = localDateTime.getTime()
    const possibleOffset = [-7 * 60 * 60 * 1000, -8 * 60 * 60 * 1000]
    for (const idx in possibleOffset) {
      const pacificOffset = localDateTime.getTimezoneOffset() * 60 * 1000 + possibleOffset[idx]
      const localDateTime2 = new Date(localTimestamp - pacificOffset)
      const pacificDateTimeString = localDateTime2.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles", hourCycle: "h24"
      })
      const arrDateTime = pacificDateTimeString.split(/ |,|:/)
      if (+arrDateTime[2] === localDateTime.getHours()) {
        return localDateTime2.getTime()
      }
    }
    return 0
  }

  const dateTimeDesc = (time: number | undefined) => {
    if (!time || time === 0) {
      return ""
    }
    else {
      const dateFormat: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: "h24"
      }
      return new Date(time * 1000).toLocaleString(locale, dateFormat)
    }
  }

  const handleCreateLottery = useCallback(async () => {
    const quotient = parsedAmount?.quotient;
    if (!LOTTERY_NAME.typedValue || LOTTERY_NAME.typedValue.length === 0) {
      Toast(t`please enter the lottery name`)
      return
    }
    if (!LOTTERY_MANAGER.typedValue || LOTTERY_MANAGER.typedValue.length === 0) {
      Toast(t`please enter the manager address`)
      return
    }
    if (!quotient || JSBI.EQ(quotient, 0)) {
      Toast(t`please enter the min amount`)
      return
    }
    if (!LOTTERY_STARTTIME.typedValue || LOTTERY_STARTTIME.typedValue.length === 0) {
      Toast(t`please enter the start time`)
      return
    }
    if (!LOTTERY_STOPTIME.typedValue || LOTTERY_STOPTIME.typedValue.length === 0) {
      Toast(t`please enter the stop time`)
      return
    }
    if (!coinToken?.address || coinToken?.address.length === 0 || !isAddress(coinToken.address)) {
      Toast(t`token address error`)
      return
    }
    const amount = quotient ? quotient.toString() : "0"
    const startTimestamp = new Date(LOTTERY_STARTTIME.typedValue).getTime() / 1000
    const stopTimeStamp = new Date(LOTTERY_STOPTIME.typedValue).getTime() / 1000
    if (stopTimeStamp <= startTimestamp) {
      Toast(t`stop time should greater than start time`)
      return
    }
    if (stopTimeStamp <= new Date().getTime() / 1000) {
      Toast(t`stop time should greater than current time`)
      return
    }
    let ok = true
    await lotteryFactoryContract?.createLottery(LOTTERY_NAME.typedValue, LOTTERY_MANAGER.typedValue, coinToken?.address ?? "", amount, startTimestamp, stopTimeStamp).catch((err) => {
      if (err && err.data) {
        setErrorMsg(err.data.message)
      }
      ok = false
    }).finally(() => {
      if (ok) {
        Toast(t`create lottery success, please wait the block confirm.`)
        onUserInput(LotteryFactoryField.LOTTERY_NAME, "")
      }
    })
  }, [LOTTERY_NAME.typedValue, LOTTERY_MANAGER.typedValue, LOTTERY_STARTTIME.typedValue, LOTTERY_STOPTIME.typedValue, coinToken, parsedAmount?.quotient, onUserInput, lotteryFactoryContract])

  const handleShowLottery = useCallback(
    (address: string) => {
      setShowLotteryAddress(address)
      setShowLotteryDetail(true)
    }, []
  )

  const wrappedOndismiss = () => {
    setShowLotteryDetail(false)
  }

  const onErrorDismiss = () => {
    setErrorMsg("")
  }

  const handleTypeName = useCallback(
    (value: string) => {
      onUserInput(LotteryFactoryField.LOTTERY_NAME, value)
    },
    [onUserInput]
  )

  const handleTypeManager = useCallback(
    (value: string) => {
      onUserInput(LotteryFactoryField.LOTTERY_MANAGER, value)
    },
    [onUserInput]
  )

  const handleTypeMinAmount = useCallback(
    (value: string) => {
      onUserInput(LotteryFactoryField.MIN_AMOUNT, value)
    },
    [onUserInput]
  )

  const handleTypeStartTime = useCallback(
    (value: string) => {
      onUserInput(LotteryFactoryField.LOTTERY_STARTTIME, value)
    },
    [onUserInput]
  )

  const handleTypeStopTime = useCallback(
    (value: string) => {
      onUserInput(LotteryFactoryField.LOTTERY_STOPTIME, value)
    },
    [onUserInput]
  )
  return (
    <>
      <WrapperCard>
        <BodySectionCard height="auto">
          <Heading margin={3}><Trans>Create Lottery</Trans></Heading>
          <FormRow>
            <RowFixed>
              <TextWrapper>
                <Trans>Name</Trans>:
              </TextWrapper>
            </RowFixed>
            <RowFixed>
              <TextWrapper>
                <TextInput value={LOTTERY_NAME.typedValue} onUserInput={handleTypeName} placeholder={t`Lottery Name`} fontSize="0.9rem" ></TextInput>
              </TextWrapper>
            </RowFixed>
          </FormRow>
          <FormRow>
            <RowFixed>
              <TextWrapper>
                <Trans>Manager</Trans>:
              </TextWrapper>
            </RowFixed>
            <RowFixed>
              <TextWrapper>
                <TextInput value={LOTTERY_MANAGER.typedValue} onUserInput={handleTypeManager} placeholder={t`Lottery Manager`} fontSize="0.9rem" ></TextInput>
              </TextWrapper>
            </RowFixed>
          </FormRow>
          <FormRow>
            <RowFixed>
              <TextWrapper>
                <Trans>Min Amount</Trans>:
              </TextWrapper>
            </RowFixed>
            <RowFixed>
              <TextWrapper>
                <AppBody>
                  <Wrapper id="lotteryfactory-page"
                    style={{ width: "300px" }}>
                    <AutoColumn gap={'sm'}>
                      <div style={{ display: 'relative' }}>
                        <CurrencyInputPanel
                          hideInput={false}
                          value={MIN_AMOUNT.typedValue}
                          showMaxButton={true}
                          logoURIs={[`https://raw.githubusercontent.com/rchaindao/publicity/main/assets/RDAO_Circle_64.png`]}
                          currency={coinToken}
                          onUserInput={handleTypeMinAmount}
                          fiatValue={undefined}
                          onCurrencySelect={undefined}
                          hideBalance={true}
                          otherCurrency={coinToken}
                          showCommonBases={true}
                          id="lottery-currency-input"
                        />
                      </div>
                    </AutoColumn>
                  </Wrapper>
                </AppBody>
              </TextWrapper>
            </RowFixed>
          </FormRow>
          <FormRow>
            <RowFixed>
              <TextWrapper>
                <Trans>Start Time</Trans>:
              </TextWrapper>
            </RowFixed>
            <RowFixed>
              <TextWrapper>
                <DateInput value={LOTTERY_STARTTIME.typedValue} onUserInput={handleTypeStartTime} placeholder={t`Start Time`} fontSize="0.9rem" ></DateInput>
              </TextWrapper>
            </RowFixed>
          </FormRow>
          <FormRow>
            <RowFixed>
              <TextWrapper>
                <Trans>Stop Time</Trans>:
              </TextWrapper>
            </RowFixed>
            <RowFixed>
              <TextWrapper>
                <DateInput value={LOTTERY_STOPTIME.typedValue} onUserInput={handleTypeStopTime} placeholder={t`Stop Time`} fontSize="0.9rem" ></DateInput>
              </TextWrapper>
            </RowFixed>
          </FormRow>

          {!showConnectAWallet && (
            <>
              <ButtonPrimary marginBottom={3} marginTop={5} onClick={handleCreateLottery}>
                <ThemedText.Label mb="4px">
                  <Trans>Create</Trans>
                </ThemedText.Label>
              </ButtonPrimary>
            </>
          )
          }
        </BodySectionCard>
        <BodySectionCard display="flex" flexDirection="column">
          <RowBetween marginTop={2} marginBottom={3}>
            <RowFixed>
              <TextWrapper>
                <Trans>Lotteries list</Trans>:
              </TextWrapper>
            </RowFixed>
          </RowBetween>
          <RowBetween flex="1" display="flex" flexDirection="column">
            {
              lotterise.map((a, i) => {
                return (
                  <RowBetween key={i} marginTop={2} flex="1" marginBottom={2} height="20px">
                    <FullRow>
                      <ThemedText.Main flex="2" ml="6px" fontSize="12px" color={theme.text1} style={{ overflow: "hidden", cursor: "pointer", display: "inline-block", whiteSpace: "nowrap", textOverflow: "ellipsis", msTextOverflow: "ellipsis" }}>
                        <span onClick={() => { handleShowLottery(a.lotteryAddress ?? "") }}>
                          {!(a.createTime && a.createTime > 0) ? "" : a.lotteryAddress}
                        </span>
                      </ThemedText.Main>
                      <ThemedText.Main ml="6px" fontSize="12px" color={theme.text1}>
                        <Trans>{dateTimeDesc(a.createTime)}</Trans>
                      </ThemedText.Main>
                    </FullRow>
                  </RowBetween>
                )
              })}
          </RowBetween>
          <CustomPage marginTop={2} mutipleRow={false} onChangePage={handleChangePage} onChangePageSize={handleChangeLotteryPageSize} page={curLotteryPage} size={lotteryPageSize} total={lotteryCount} showJump={true} showEnds={true} showTotal={true} ></CustomPage>
        </BodySectionCard>
      </WrapperCard>

      {showConnectAWallet && (
        <ButtonPrimary style={{ marginTop: '2em', padding: '8px 16px' }} onClick={toggleWalletModal}>
          <Trans>Connect a wallet</Trans>
        </ButtonPrimary>
      )}
      <Modal isOpen={showLotteryDetail} onDismiss={wrappedOndismiss} maxHeight={90}>
        {(
          <ContentWrapper gap="lg">
            <RowBetween>
              <ThemedText.MediumHeader>
                <Trans>Lottery Detail</Trans>
              </ThemedText.MediumHeader>
              <CloseIcon onClick={wrappedOndismiss} />
            </RowBetween>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Address</Trans>: <Trans>{showLotteryAddress}</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Name</Trans>: <Trans>{detail?.name}</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Min Amount</Trans>: <Trans>{detail?.minAmount?.toExact()}</Trans> <Trans>{coinToken?.symbol}</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Player Count</Trans>: <Trans>{detail?.playerCount}</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Pool Amount</Trans>: <Trans>{detail?.prize?.toExact()}</Trans> <Trans>{coinToken?.symbol}</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Manager</Trans>:<Text style={{ height: "auto", overflow: "hidden", maxWidth: "620px", display: "inline-block", whiteSpace: "nowrap", textOverflow: "ellipsis", msTextOverflow: "ellipsis" }}>
                  {detail?.manager}
                </Text>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>State</Trans>: {detail?.state === LotteryState.Running ? t`Running` : (detail?.state === LotteryState.Pausing ? t`Pausing` : t`Finished`)}
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Start Time</Trans>: <Trans>{dateTimeDesc(detail?.startTime)}</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Trans>Stop Time</Trans>: <Trans>{dateTimeDesc(detail?.stopTime)}</Trans>
              </ThemedText.Body>
            </AutoColumn>
            <AutoColumn justify="center" gap="md">
              <ThemedText.Body>
                <Text><Trans>Winner</Trans>:</Text><Text style={{ height: "auto", overflow: "hidden", maxWidth: "620px", display: "inline-block", whiteSpace: "nowrap", textOverflow: "ellipsis", msTextOverflow: "ellipsis" }}>
                  {detail?.winner}
                </Text>
              </ThemedText.Body>
            </AutoColumn>
          </ContentWrapper>
        )}
        {isLoadingLottery && (
          <LoadingView onDismiss={wrappedOndismiss}>
            <AutoColumn gap="12px" justify={'center'}>
              <ThemedText.Body fontSize={20}>
                <Trans>Loading Lottery Info...</Trans>
              </ThemedText.Body>
            </AutoColumn>
          </LoadingView>
        )}
      </Modal>
      <Modal isOpen={errorMsg.length > 0} onDismiss={onErrorDismiss} minHeight={20}>
        <ContentWrapper gap="lg">
          <RowBetween>
            <FullRow>
              <ThemedText.MediumHeader flex={1}>
                <Trans>Data Error</Trans>
              </ThemedText.MediumHeader>
              <CloseIcon onClick={onErrorDismiss} />
            </FullRow>
          </RowBetween>
          <RowBetween>
            <FullRow>
              <ThemedText.Body>
                {errorMsg}
              </ThemedText.Body>
            </FullRow>
          </RowBetween>
        </ContentWrapper>
      </Modal>
      <MarginerSmall />
      <SwitchLocaleLink />
    </>
  )
}
