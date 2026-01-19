import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import restaurantService from '../services/restaurantService';
import authService from '../services/authService';

const CurrencyContext = createContext();

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

function getCurrencySymbol(currency) {
    return CURRENCY_SYMBOLS[currency] || currency;
}

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('VND');
    const [currencySymbol, setCurrencySymbol] = useState('₫');
    const [loading, setLoading] = useState(true);

    const loadCurrency = useCallback(async () => {
        try {
            // Try from localStorage first (customer)
            let restaurantId = localStorage.getItem('restaurantId');

            // If not found, try from user object (waiter/admin/kitchen)
            if (!restaurantId) {
                const user = authService.getCurrentUser();
                restaurantId = user?.restaurantId;
            }

            if (restaurantId) {
                const restaurant = await restaurantService.getRestaurant(restaurantId);
                const curr = restaurant.currency || 'VND';
                setCurrency(curr);
                setCurrencySymbol(getCurrencySymbol(curr));
            }
        } catch (error) {
            console.error('Failed to load currency:', error);
            // Fallback to VND
            setCurrency('VND');
            setCurrencySymbol('₫');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCurrency();
    }, [loadCurrency]);

    const formatCurrency = useCallback((amount) => {
        const formatted = new Intl.NumberFormat('vi-VN').format(parseFloat(amount || 0));

        // For VND, symbol goes after; for most others, before
        if (currency === 'VND') {
            return formatted + currencySymbol;
        }
        return currencySymbol + formatted;
    }, [currency, currencySymbol]);

    const value = {
        currency,
        currencySymbol,
        formatCurrency,
        loading,
        reload: loadCurrency
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider');
    }
    return context;
};
