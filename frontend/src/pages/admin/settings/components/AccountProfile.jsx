import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import authService from '../../../../services/authService';

const AccountProfile = ({ user, onUpdate, onChangePassword }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [avatar, setAvatar] = useState(user?.avatar || null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e) => {
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
            formData.append('avatar', file);

            const updatedUser = await authService.uploadAvatar(formData);
            setAvatar(updatedUser.avatar);
            onUpdate(updatedUser);
            setMessage({ type: 'success', text: t('settings.messages.uploadSuccess') });
        } catch (error) {
            console.error('Failed to upload avatar:', error);
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

            const updatedUser = await authService.updateProfile(formData);
            onUpdate(updatedUser);
            setMessage({ type: 'success', text: t('settings.messages.updateSuccess') });
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage({ type: 'error', text: error.message || t('settings.messages.updateError') });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-card rounded-lg border border-border p-6 shadow-warm">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
                {t('settings.account.title')}
            </h2>

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
                {/* Avatar Upload */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                        {t('settings.account.avatar')}
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl text-muted-foreground">👤</span>
                                )}
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="avatar-upload"
                                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                                {t('settings.account.uploadAvatar')}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={uploading}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                JPG, PNG or GIF (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Name */}
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.account.fullName')}
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.account.email')}
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        {t('settings.account.phone')}
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

                {/* Change Password Button */}
                <div>
                    <button
                        type="button"
                        onClick={onChangePassword}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                    >
                        {t('settings.account.changePassword')}
                    </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : t('settings.account.updateProfile')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountProfile;
