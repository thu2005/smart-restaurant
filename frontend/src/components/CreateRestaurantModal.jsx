import React, { useState } from "react";
import Icon from "./AppIcon";
import { useTranslation, Trans } from "react-i18next";

const CreateRestaurantModal = ({ isOpen, onClose, onSubmit, adminName }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phone: "",
        email: "",
        address: "",
        timezone: "Asia/Ho_Chi_Minh",
        currency: "VND",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('restaurant.create.title')}</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            <Trans i18nKey="restaurant.create.subtitle" values={{ adminName }}>
                                Create a restaurant for admin: <span className="font-semibold">{{ adminName }}</span>
                            </Trans>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        disabled={loading}
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Restaurant Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('restaurant.create.form.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={t('restaurant.create.form.placeholders.name')}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('restaurant.create.form.description')}
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={t('restaurant.create.form.placeholders.description')}
                        />
                    </div>

                    {/* Contact Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('restaurant.create.form.phone')}
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={t('restaurant.create.form.placeholders.phone')}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('restaurant.create.form.email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={t('restaurant.create.form.placeholders.email')}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('restaurant.create.form.address')}
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={t('restaurant.create.form.placeholders.address')}
                        />
                    </div>

                    {/* Settings Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Timezone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('restaurant.create.form.timezone')}
                            </label>
                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                                <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                                <option value="America/New_York">America/New York (EST)</option>
                                <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                            </select>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('restaurant.create.form.currency')}
                            </label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="VND">Vietnamese Dong (VND)</option>
                                <option value="USD">US Dollar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="GBP">British Pound (GBP)</option>
                                <option value="THB">Thai Baht (THB)</option>
                                <option value="SGD">Singapore Dollar (SGD)</option>
                                <option value="JPY">Japanese Yen (JPY)</option>
                            </select>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">{t('restaurant.create.info.title')}</p>
                            <p>
                                {t('restaurant.create.info.content')}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Icon name="Loader2" size={20} className="animate-spin" />
                                    {t('restaurant.create.buttons.creating')}
                                </>
                            ) : (
                                <>
                                    <Icon name="Building2" size={20} />
                                    {t('restaurant.create.buttons.create')}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            {t('restaurant.create.buttons.skip')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRestaurantModal;
