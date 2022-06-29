import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import LibUpdater from 'lib/hooks/transactions/updater'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { useAddPopup } from '../application/hooks'
import { checkedTransaction, finalizeTransaction } from './reducer'

export default function Updater() {
  const { chainId } = useActiveWeb3React()
  const addPopup = useAddPopup()

  const dispatch = useAppDispatch()
  const onCheck = useCallback(
    ({ chainId, hash, blockNumber }) => dispatch(checkedTransaction({ chainId, hash, blockNumber })),
    [dispatch]
  )
  const onReceipt = useCallback(
    ({ chainId, hash, receipt }) => {
      dispatch(
        finalizeTransaction({
          chainId,
          hash,
          receipt: {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            contractAddress: receipt.contractAddress,
            from: receipt.from,
            status: receipt.status,
            to: receipt.to,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
          },
        })
      )
      addPopup(
        {
          txn: { hash },
        },
        hash,
        DEFAULT_TXN_DISMISS_MS
      )
    },
    [addPopup, dispatch]
  )

  const state = useAppSelector((state) => state.transactions)
  const pendingTransactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [chainId, state])

  return <LibUpdater pendingTransactions={pendingTransactions} onCheck={onCheck} onReceipt={onReceipt} />
}
