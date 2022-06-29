import { createReducer } from '@reduxjs/toolkit'

import { LotteryField, typeInput, selectLottery } from './actions'

export interface LotteryState {
  readonly [LotteryField.AMOUNT]: {
    readonly typedValue: string
  }
  readonly selectedLottery: string|undefined
}

const initialState: LotteryState = {
  [LotteryField.AMOUNT]: {
    typedValue: '',
  },
  selectedLottery: undefined,
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
)
