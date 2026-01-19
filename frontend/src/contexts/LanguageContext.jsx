import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/config';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get language from localStorage or default to 'en'
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'en';
    });

    useEffect(() => {
        // Change i18n language
        i18n.changeLanguage(language);

        // Save to localStorage
        localStorage.setItem('language', language);

        // Update HTML lang attribute
        document.documentElement.lang = language;
    }, [language]);

    const changeLanguage = (newLanguage) => {
        if (newLanguage === 'en' || newLanguage === 'vi') {
            setLanguage(newLanguage);
        }
    };

    const value = {
        language,
        changeLanguage,
        isVietnamese: language === 'vi',
        isEnglish: language === 'en',
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
