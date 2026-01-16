import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext';

const GeneralSettings = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme, isDark } = useTheme();
    const { language, changeLanguage, isVietnamese } = useLanguage();

    return (
        <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                {t('settings.general.title')}
            </h2>

            <div className="space-y-6">
                {/* Theme Setting */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.general.theme.label')}
                    </label>
                    <p className="text-sm text-muted-foreground mb-3">
                        {t('settings.general.theme.description')}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => !isDark && toggleTheme()}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${!isDark
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-foreground hover:border-primary/50'
                                }`}
                        >
                            <span className="text-2xl">☀️</span>
                            <span className="font-medium">{t('settings.general.theme.light')}</span>
                        </button>
                        <button
                            onClick={() => isDark && toggleTheme()}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${isDark
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-foreground hover:border-primary/50'
                                }`}
                        >
                            <span className="text-2xl">🌙</span>
                            <span className="font-medium">{t('settings.general.theme.dark')}</span>
                        </button>
                    </div>
                </div>

                {/* Language Setting */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.general.language.label')}
                    </label>
                    <p className="text-sm text-muted-foreground mb-3">
                        {t('settings.general.language.description')}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${language === 'en'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-foreground hover:border-primary/50'
                                }`}
                        >
                            <span className="text-2xl">🇬🇧</span>
                            <span className="font-medium">{t('settings.general.language.english')}</span>
                        </button>
                        <button
                            onClick={() => changeLanguage('vi')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${language === 'vi'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-foreground hover:border-primary/50'
                                }`}
                        >
                            <span className="text-2xl">🇻🇳</span>
                            <span className="font-medium">{t('settings.general.language.vietnamese')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
