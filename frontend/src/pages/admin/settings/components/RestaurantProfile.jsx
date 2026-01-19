import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import restaurantService from '../../../../services/restaurantService';

const RestaurantProfile = ({ restaurant, onUpdate }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: restaurant?.name || '',
        description: restaurant?.description || '',
        phone: restaurant?.phone || '',
        email: restaurant?.email || '',
        address: restaurant?.address || '',
        timezone: restaurant?.timezone || 'Asia/Ho_Chi_Minh',
        currency: restaurant?.currency || 'VND',
    });
    const [logo, setLogo] = useState(restaurant?.logo || null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
            return;
        }

        try {
            setUploading(true);
            setMessage(null);

            const formData = new FormData();
            formData.append('logo', file);

            const updatedRestaurant = await restaurantService.uploadLogo(
                restaurant.id,
                formData
            );
            setLogo(updatedRestaurant.data?.logo || updatedRestaurant.logo);
            onUpdate(updatedRestaurant.data || updatedRestaurant);
            setMessage({ type: 'success', text: t('settings.messages.uploadSuccess') });
        } catch (error) {
            console.error('Failed to upload logo:', error);
            setMessage({ type: 'error', text: error.message || t('settings.messages.uploadError') });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage(null);

            const updatedRestaurant = await restaurantService.updateRestaurant(
                restaurant.id,
                formData
            );
            onUpdate(updatedRestaurant.data || updatedRestaurant);
            setMessage({ type: 'success', text: t('settings.messages.updateSuccess') });
        } catch (error) {
            console.error('Failed to update restaurant:', error);
            setMessage({ type: 'error', text: error.message || t('settings.messages.updateError') });
        } finally {
            setSaving(false);
        }
    };

    if (!restaurant) {
        return (
            <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                    {t('settings.restaurant.title')}
                </h2>
                <p className="text-muted-foreground">No restaurant data available</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                    {t('settings.restaurant.title')}
                </h2>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {t('settings.restaurant.adminOnly')}
                </span>
            </div>

            {message && (
                <div
                    className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-error/10 text-error border border-error/20'
                        }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                        {t('settings.restaurant.logo')}
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                {logo ? (
                                    <img
                                        src={logo}
                                        alt="Restaurant Logo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl">🏪</span>
                                )}
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="logo-upload"
                                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                                {t('settings.restaurant.uploadLogo')}
                            </label>
                            <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                                disabled={uploading}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                JPG, PNG or GIF (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Restaurant Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.restaurant.name')}
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.restaurant.description')}
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                            {t('settings.restaurant.phone')}
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                            {t('settings.restaurant.email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.restaurant.address')}
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Timezone and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-foreground mb-2">
                            {t('settings.restaurant.timezone')}
                        </label>
                        <select
                            id="timezone"
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                            <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                            <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                            <option value="UTC">UTC (GMT+0)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-2">
                            {t('settings.restaurant.currency')}
                        </label>
                        <select
                            id="currency"
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="VND">VND (₫)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : t('settings.restaurant.updateRestaurant')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RestaurantProfile;
