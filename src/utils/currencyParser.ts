import { getCurrencyByLanguage } from './currencyUtils';

// Exchange rate: 1 USD = ~5.50 BRL (approximate)
const USD_TO_BRL_RATE = 5.50;
const BRL_TO_USD_RATE = 1 / USD_TO_BRL_RATE;

/**
 * Currency patterns to detect in text
 * Supports: R$ 500, R$500, 500 reais, USD 100, $100, 100 dólares
 */
/**
 * Currency pattern definitions (without the /g flag - we create fresh regex each time)
 */
const CURRENCY_PATTERNS = [
  // BRL patterns: R$ 1.234,56 or R$ 1234,56 or R$ 1234
  {
    pattern: /R\$\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/,
    currency: 'BRL' as const,
    extractValue: (match: string) => {
      // Remove R$ and spaces, convert BR format (1.234,56) to number
      const numStr = match.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(numStr);
    }
  },
  // "X reais" pattern
  {
    pattern: /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+)\s*reais/i,
    currency: 'BRL' as const,
    extractValue: (match: string) => {
      const numStr = match.replace(/\s*reais/i, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(numStr);
    }
  },
  // USD patterns: $ 1,234.56 or $1234.56 or $1234 (but not R$)
  {
    pattern: /(?<!R)\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
    currency: 'USD' as const,
    extractValue: (match: string) => {
      const numStr = match.replace(/\$\s?/, '').replace(/,/g, '');
      return parseFloat(numStr);
    }
  },
  // "X dólares" pattern
  {
    pattern: /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+)\s*d[oó]lares?/i,
    currency: 'USD' as const,
    extractValue: (match: string) => {
      const numStr = match.replace(/\s*d[oó]lares?/i, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(numStr);
    }
  }
];

/**
 * Format a number to the target currency format
 */
function formatToCurrency(value: number, targetCurrency: 'BRL' | 'USD'): string {
  if (targetCurrency === 'BRL') {
    // Format as Brazilian Real
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } else {
    // Format as US Dollar
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}

/**
 * Convert value between currencies
 */
function convertValue(value: number, from: 'BRL' | 'USD', to: 'BRL' | 'USD'): number {
  if (from === to) return value;
  if (from === 'BRL' && to === 'USD') return value * BRL_TO_USD_RATE;
  if (from === 'USD' && to === 'BRL') return value * USD_TO_BRL_RATE;
  return value;
}

/**
 * Parse text and convert all currency values to the target currency based on language
 * @param text - The text containing currency values
 * @returns Text with converted currency values
 */
export function parseCurrencyInText(text: string): string {
  const targetCurrency = getCurrencyByLanguage();
  let result = text;

  for (const patternDef of CURRENCY_PATTERNS) {
    // Create a fresh global regex for each replacement to avoid lastIndex issues
    const regex = new RegExp(patternDef.pattern.source, patternDef.pattern.flags + 'g');
    result = result.replace(regex, (match) => {
      const value = patternDef.extractValue(match);
      if (isNaN(value)) return match;

      const convertedValue = convertValue(value, patternDef.currency, targetCurrency);
      return formatToCurrency(convertedValue, targetCurrency);
    });
  }

  return result;
}

/**
 * Check if text contains any currency values
 */
export function containsCurrency(text: string): boolean {
  return CURRENCY_PATTERNS.some(patternDef => {
    const regex = new RegExp(patternDef.pattern.source, patternDef.pattern.flags);
    return regex.test(text);
  });
}

/**
 * Get all currency values found in text
 */
export function extractCurrencyValues(text: string): Array<{ original: string; value: number; currency: 'BRL' | 'USD' }> {
  const results: Array<{ original: string; value: number; currency: 'BRL' | 'USD' }> = [];

  for (const patternDef of CURRENCY_PATTERNS) {
    let match;
    const regex = new RegExp(patternDef.pattern.source, patternDef.pattern.flags + 'g');
    while ((match = regex.exec(text)) !== null) {
      const value = patternDef.extractValue(match[0]);
      if (!isNaN(value)) {
        results.push({
          original: match[0],
          value,
          currency: patternDef.currency,
        });
      }
    }
  }

  return results;
}
