import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import authService from '../../../../services/authService';

const ChangePasswordModal = ({ onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError(t('password.mismatch'));
            return;
        }

        // Validate password length
        if (formData.newPassword.length < 8) {
            setError(t('password.requirements'));
            return;
        }

        try {
            setLoading(true);
            await authService.changePassword(formData.oldPassword, formData.newPassword);
            setSuccess(true);

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Failed to change password:', error);
            setError(error.message || t('password.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card rounded-lg border border-border shadow-warm-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-heading font-semibold text-foreground">
                        {t('password.change')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-success font-medium">{t('password.success')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-4 rounded-lg bg-error/10 text-error border border-error/20">
                                {error}
                            </div>
                        )}

                        {/* Current Password */}
                        <div>
                            <label htmlFor="oldPassword" className="block text-sm font-medium text-foreground mb-2">
                                {t('password.current')}
                            </label>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                                {t('password.new')}
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                                disabled={loading}
                                minLength={8}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('password.requirements')}
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                {t('password.confirm')}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                required
                                disabled={loading}
                                minLength={8}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                                disabled={loading}
                            >
                                {t('settings.actions.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? 'Changing...' : t('settings.actions.update')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChangePasswordModal;
