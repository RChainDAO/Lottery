import { useAppDispatch, useAppSelector } from '../hooks'
import { useSingleContractMultipleData, useSingleCallResult } from 'lib/hooks/multicall'
import { LotteryFactory } from 'abis/types'
import { AppState } from 'state'
import { LotteryFactoryField, typeInput } from './actions'
import { useCallback, useMemo } from 'react'
import { ZERO_ADDRESS } from 'constants/misc'

const DEFAULT_PAGE_SIZE = 10

interface LotteryInfo {
    lotteryAddress: string | undefined
    name: string | undefined
    createTime: number | undefined
    managerAddress: string | undefined
    startTime: number | undefined
    stopTime: number | undefined
}

export function useLotteryFactoryLocalState(): AppState['lotteryFactory'] {
    return useAppSelector((state) => state.lotteryFactory)
}

export function useLotteryFactoryLocalActionHandlers(): {
    onUserInput: (field: LotteryFactoryField, typedValue: string) => void
} {
    const dispatch = useAppDispatch()

    const onUserInput = useCallback(
        (field: LotteryFactoryField, typedValue: string) => {
            dispatch(typeInput({ field, typedValue }))
        },
        [dispatch]
    )

    return {
        onUserInput,
    }
}

export function useLotteryCount(
    contract?: LotteryFactory | null
): number | undefined {
    const result = useSingleCallResult(contract, 'getAllLotteriesLength', [])
    return useMemo(
        () => {
            const value = result.result
            if (!value) {
                return undefined
            }
            return Number.parseInt(value.toString())
        },
        [result]
    )
}

export function useLotteryRangeInfo(from?: number | undefined, to?: number | undefined, contract?: LotteryFactory | null): LotteryInfo[] {
    const idxArgs = useMemo(() => {
        if (from !== undefined && to !== undefined) {
            const tokenRequests = []
            for (let i = from; i < to; i++) {
                tokenRequests.push([i])
            }
            return tokenRequests
        }
        return []
    }, [from, to])
    const playerResults = useSingleContractMultipleData(contract, "lotteries", idxArgs, undefined)
    const playerInfos = useMemo(() => {
        if (from !== undefined && to !== undefined) {
            const ret = playerResults
                .map(({ result }) => result)
                //.filter((result): result is CallStateResult => !!result)
                .map((result) => {
                    if (!result) {
                        return {
                            lotteryAddress: undefined,
                            name: undefined,
                            createTime: undefined,
                            managerAddress: undefined,
                            startTime: undefined,
                            stopTime: undefined
                        }
                    }
                    const player: LotteryInfo = {
                        lotteryAddress: result[0],
                        name: result[1],
                        createTime: Number.parseInt(result[2].toString()),
                        managerAddress: result[3],
                        startTime: Number.parseInt(result[4].toString()),
                        stopTime: Number.parseInt(result[5].toString())
                    }
                    return player
                })
            return ret
        }
        return []
    }, [from, to, playerResults])
    return playerInfos
}


export function useLotteryPage(page?: number | undefined, pageSize?: number | undefined, contract?: LotteryFactory | null): LotteryInfo[] {
    const idxArgs = useMemo(() => {
        const searchPage = page || 1
        const searchPageSize = pageSize || DEFAULT_PAGE_SIZE
        const from = (searchPage - 1) * searchPageSize
        const to = searchPage * searchPageSize
        if (from !== undefined && to !== undefined) {
            const tokenRequests = []
            for (let i = from; i < to; i++) {
                tokenRequests.push([i])
            }
            return tokenRequests
        }
        return []
    }, [page, pageSize])
    const lotteryResults = useSingleContractMultipleData(contract, "lotteries", idxArgs, undefined)
    const lotteryInfos = useMemo(() => {
        const ret = lotteryResults
            .map(({ result }) => result)
            //.filter((result): result is CallStateResult => !!result)
            .map((result) => {
                if (!result) {
                    return {
                        lotteryAddress: undefined,
                        name: undefined,
                        createTime: undefined,
                        managerAddress: undefined,
                        startTime: undefined,
                        stopTime: undefined
                    }
                }
                const player: LotteryInfo = {
                    lotteryAddress: result[0],
                    name: result[1],
                    createTime: Number.parseInt(result[2].toString()),
                    managerAddress: result[3],
                    startTime: Number.parseInt(result[4].toString()),
                    stopTime: Number.parseInt(result[5].toString())
                }
                return player
            })
        return ret
    }, [lotteryResults])
    return lotteryInfos
}


export function useLastActiveLottery(
    contract?: LotteryFactory | null
): string | undefined {
    const result = useSingleCallResult(contract, 'getLastActiveLottery', [])
    return useMemo(
        () => {
            const value = result.result
            if (result.loading || !value) {
                return undefined
            }
            const strValue = value.toString()
            if (strValue === ZERO_ADDRESS) {
                return ""
            }
            else {
                return value.toString()
            }
        },
        [result]
    )
}