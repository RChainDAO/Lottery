import { createReducer } from '@reduxjs/toolkit'

import { LotteryField, typeInput, selectLottery, refreshRemainTime } from './actions'

export interface LotteryState {
  readonly [LotteryField.AMOUNT]: {
    readonly typedValue: string
  }
  readonly remainTime: number|undefined
  readonly selectedLottery: string|undefined
}

const initialState: LotteryState = {
  [LotteryField.AMOUNT]: {
    typedValue: '',
  },
  selectedLottery: undefined,
  remainTime: undefined
}

export default createReducer<LotteryState>(initialState, (builder) =>
  builder
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        [field]: {typedValue},
      }
    })
    .addCase(selectLottery, (state, { payload: { lotteryAddress } }) => {
      return {
        ...state,
        selectedLottery: lotteryAddress,
      }
    })
    .addCase(refreshRemainTime, (state, { payload: { remainTime } }) => {
      return {
        ...state,
        remainTime,
      }
    })

)
