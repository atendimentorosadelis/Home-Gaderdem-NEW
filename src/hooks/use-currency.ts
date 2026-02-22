import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import {
  getCurrencyByLanguage,
  getCurrencySymbol,
  formatCurrency,
  formatCurrencyValue,
  convertCurrency,
  type CurrencyCode,
} from '@/utils/currencyUtils';

/**
 * Hook for dynamic currency formatting based on current language
 * Returns memoized currency utilities that update when language changes
 */
export function useCurrency() {
  const { i18n } = useTranslation();
  
  return useMemo(() => {
    // Re-compute when language changes
    const currency = getCurrencyByLanguage();
    const symbol = getCurrencySymbol();
    
    return {
      /** Current currency code (BRL or USD) */
      currency,
      /** Current currency symbol (R$ or $) */
      symbol,
      /** Format a number as full currency string */
      format: formatCurrency,
      /** Format with symbol prefix and optional suffix (e.g., "R$ 500+") */
      formatValue: formatCurrencyValue,
      /** Convert between currencies */
      convert: convertCurrency,
      /** Check if current currency is BRL */
      isBRL: currency === 'BRL',
      /** Check if current currency is USD */
      isUSD: currency === 'USD',
    };
  }, [i18n.language]);
}

export type { CurrencyCode };
