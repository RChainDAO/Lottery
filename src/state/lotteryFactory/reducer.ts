import { createReducer } from '@reduxjs/toolkit'
import { LotteryFactoryField, typeInput } from './actions'

export interface LotteryFactoryState {
  readonly [LotteryFactoryField.MIN_AMOUNT]: {
    readonly typedValue: string
  }
  readonly [LotteryFactoryField.LOTTERY_NAME]: {
    readonly typedValue: string
  }
  readonly [LotteryFactoryField.LOTTERY_MANAGER]: {
    readonly typedValue: string
  }
  readonly [LotteryFactoryField.LOTTERY_STARTTIME]: {
    readonly typedValue: string
  }
  readonly [LotteryFactoryField.LOTTERY_STOPTIME]: {
    readonly typedValue: string
  }
}

const initialState: LotteryFactoryState = {
  [LotteryFactoryField.MIN_AMOUNT]: {
    typedValue: '',
  },
  [LotteryFactoryField.LOTTERY_NAME]: {
    typedValue: '',
  },
  [LotteryFactoryField.LOTTERY_MANAGER]: {
    typedValue: '',
  },
  [LotteryFactoryField.LOTTERY_STARTTIME]: {
    typedValue: '',
  },
  [LotteryFactoryField.LOTTERY_STOPTIME]: {
    typedValue: '',
  },
}

export default createReducer<LotteryFactoryState>(initialState, (builder) =>
  builder
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        [field]: {typedValue},
      }
    })
)
