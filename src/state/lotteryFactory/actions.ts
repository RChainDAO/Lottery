import { createAction } from '@reduxjs/toolkit'

export enum LotteryFactoryField {
  MIN_AMOUNT = 'MIN_AMOUNT',
  LOTTERY_NAME = 'LOTTERY_NAME',
  LOTTERY_MANAGER = 'LOTTERY_MANAGER',
  LOTTERY_STARTTIME = 'LOTTERY_STARTTIME',
  LOTTERY_STOPTIME = 'LOTTERY_STOPTIME',
}

export const typeInput = createAction<{ field: LotteryFactoryField; typedValue: string }>('lotteryFactory/typeInput')
