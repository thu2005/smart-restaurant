/**
 * Currency utility functions
 * Maps currency codes to symbols and formatting
 */

const CURRENCY_SYMBOLS = {
    VND: '₫',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    KRW: '₩',
    THB: '฿'
};

/**
 * Get currency symbol from currency code
 * @param {string} currency - Currency code (e.g., 'VND', 'USD')
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(currency) {
    return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'VND') {
    const symbol = getCurrencySymbol(currency);
    const formatted = new Intl.NumberFormat('vi-VN').format(parseFloat(amount || 0));

    // For VND, symbol goes after; for most others, before
    if (currency === 'VND') {
        return formatted + symbol;
    }
    return symbol + formatted;
}

module.exports = {
    getCurrencySymbol,
    formatCurrency,
    CURRENCY_SYMBOLS
};
