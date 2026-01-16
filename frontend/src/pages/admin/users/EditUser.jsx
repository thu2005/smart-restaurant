import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import userService from "../../../services/userService";
import Icon from "../../../components/AppIcon";

const EditUser = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
    const usersBasePath = isSuperAdmin ? "/superadmin/users" : "/admin/users";

    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        phone: "",
        password: "",
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await userService.getUserById(id);
            const userData = response.data;
            setUser(userData);
            setFormData({
                email: userData.email,
                fullName: userData.fullName,
                phone: userData.phone || "",
                password: "",
            });
            setError(null);
            setError(null);
        } catch (err) {
            console.error("Error fetching user:", err);
            setError(err.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.fullName) {
            setError(t('common.error.requiredFields'));
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setError(t('admin.password.requirements'));
            return;
        }

        try {
            setSaving(true);
            const updateData = {
                fullName: formData.fullName,
                phone: formData.phone,
            };

            // Only include password if it's provided
            if (formData.password) {
                updateData.password = formData.password;
            }

            // Only update email if it changed
            if (formData.email !== user.email) {
                updateData.email = formData.email;
            }

            await userService.updateUser(id, updateData);
            navigate(usersBasePath);
        } catch (err) {
            console.error("Error updating user:", err);
            setError(err.response?.data?.message || t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    <div className="text-center">
                        <Icon name="Loader2" className="animate-spin h-8 w-8 mx-auto mb-2" />
                        <p>{t('common.loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-2xl p-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {t('admin.management.edit.notFound')}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {isSuperAdmin ? t('admin.management.edit.adminTitle') : t('admin.management.edit.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isSuperAdmin ? t('admin.management.edit.adminSubtitle') : t('admin.management.edit.subtitle')}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(usersBasePath)}
                        className="p-2 hover:bg-muted rounded-lg transition"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Staff Info Banner */}
                    <div className="bg-muted border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Icon name="User" size={24} className="text-primary" />
                                </div>
                            )}
                            <div>
                                <div className="font-semibold">{user.fullName}</div>
                                <div className="text-sm text-muted-foreground">
                                    {t(`admin.roles.${user.role.toLowerCase()}`)} • {user.isActive ? t('common.status.active') : t('common.status.inactive')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                            <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.edit.form.fullName')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.edit.form.email')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.edit.form.phone')}
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder="+84 123 456 789"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.edit.form.password')}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder={t('admin.management.edit.form.passwordPlaceholder')}
                            minLength={6}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('admin.management.edit.form.passwordHelp')}
                        </p>
                    </div>

                    {/* Role (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.edit.form.role')}
                        </label>
                        <input
                            type="text"
                            value={t(`admin.roles.${user.role.toLowerCase()}`)}
                            className="w-full border border-border rounded-lg px-3 py-2 bg-muted"
                            readOnly
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('admin.management.edit.form.roleHelp')}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Icon name="Loader2" size={20} className="animate-spin" />
                                    {t('admin.management.edit.form.submitting')}
                                </>
                            ) : (
                                <>
                                    <Icon name="Save" size={20} />
                                    {t('admin.management.edit.form.submit')}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(usersBasePath)}
                            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
                        >
                            {t('admin.management.edit.form.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
