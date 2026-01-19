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

    // For VND, use 'd' instead of ₫ for better PDF compatibility
    // PDFKit has issues rendering Vietnamese dong symbol even with Unicode escape
    if (currency === 'VND') {
        return formatted + ' d';  // Use 'd' instead of ₫ for PDF compatibility
    }
    return symbol + formatted;
}

module.exports = {
    getCurrencySymbol,
    formatCurrency,
    CURRENCY_SYMBOLS
};
