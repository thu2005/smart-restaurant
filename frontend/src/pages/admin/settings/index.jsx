import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import authService from '../../../services/authService';
import restaurantService from '../../../services/restaurantService';
import GeneralSettings from './components/GeneralSettings';
import AccountProfile from './components/AccountProfile';
import RestaurantProfile from './components/RestaurantProfile';
import ChangePasswordModal from './components/ChangePasswordModal';

const Settings = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { language } = useLanguage();

    const [currentUser, setCurrentUser] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [activeSection, setActiveSection] = useState('general');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = authService.getCurrentUser();
            setCurrentUser(user);

            // Load restaurant data if user is admin
            if (user?.role === 'ADMIN' && user?.restaurantId) {
                try {
                    const restaurantData = await restaurantService.getRestaurant(user.restaurantId);
                    setRestaurant(restaurantData.data || restaurantData);
                } catch (error) {
                    console.error('Failed to load restaurant:', error);
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (updatedUser) => {
        setCurrentUser(updatedUser);
    };

    const handleRestaurantUpdate = async (updatedRestaurant) => {
        setRestaurant(updatedRestaurant);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    const sections = [
        { id: 'general', label: t('settings.general.title'), icon: '⚙️' },
        { id: 'account', label: t('settings.account.title'), icon: '👤' },
        ...(currentUser?.role === 'ADMIN' ? [
            { id: 'restaurant', label: t('settings.restaurant.title'), icon: '🏪' }
        ] : []),
        { id: 'notifications', label: t('settings.notifications.title'), icon: '🔔' },
        { id: 'advanced', label: t('settings.advanced.title'), icon: '🔧' },
    ];

    return (
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                    {t('settings.title')}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                    {t('settings.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-lg border border-border p-2 shadow-warm sticky top-4">
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-all ${activeSection === section.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-foreground hover:bg-muted'
                                        }`}
                                >
                                    <span className="text-xl">{section.icon}</span>
                                    <span className="font-medium">{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="space-y-6">
                        {activeSection === 'general' && (
                            <GeneralSettings />
                        )}

                        {activeSection === 'account' && (
                            <AccountProfile
                                user={currentUser}
                                onUpdate={handleProfileUpdate}
                                onChangePassword={() => setShowPasswordModal(true)}
                            />
                        )}

                        {activeSection === 'restaurant' && currentUser?.role === 'ADMIN' && (
                            <RestaurantProfile
                                restaurant={restaurant}
                                onUpdate={handleRestaurantUpdate}
                            />
                        )}

                        {activeSection === 'notifications' && (
                            <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
                                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                                    {t('settings.notifications.title')}
                                </h2>
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔔</div>
                                    <p className="text-muted-foreground text-lg">
                                        {t('settings.notifications.comingSoon')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeSection === 'advanced' && (
                            <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
                                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                                    {t('settings.advanced.title')}
                                </h2>
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔧</div>
                                    <p className="text-muted-foreground text-lg">
                                        {t('settings.advanced.comingSoon')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <ChangePasswordModal
                    onClose={() => setShowPasswordModal(false)}
                />
            )}
        </div>
    );
};

export default Settings;
