import { Currency, Token } from '@uniswap/sdk-core'
import { useCurrencyFromMap, useTokenFromNetwork } from 'lib/hooks/useCurrency'

import { useUserAddedTokens } from '../state/user/hooks'

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency) {
    return false
  }

  return !!userAddedTokens.find((token) => currency.equals(token))
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(tokenAddress?: string | null): Token | null | undefined {
  return useTokenFromNetwork(tokenAddress)
}

export function useCurrency(currencyId?: string | null): Currency | null | undefined {
  return useCurrencyFromMap(currencyId)
}
