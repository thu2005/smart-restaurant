import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import userService from "../../../services/userService";
import restaurantService from "../../../services/restaurantService";
import Icon from "../../../components/AppIcon";
import CreateRestaurantModal from "../../../components/CreateRestaurantModal";

const CreateUser = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);
    const [createdAdmin, setCreatedAdmin] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
    const usersBasePath = isSuperAdmin ? "/superadmin/users" : "/admin/users";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: isSuperAdmin ? "ADMIN" : "WAITER",
        restaurantId: currentUser?.restaurantId || "",
    });

    useEffect(() => {
        // If admin, set their restaurant ID automatically
        if (!isSuperAdmin && currentUser?.restaurantId) {
            setFormData(prev => ({ ...prev, restaurantId: currentUser.restaurantId }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
            setError(t('common.error.requiredFields'));
            return;
        }

        if (formData.password.length < 6) {
            setError(t('admin.password.requirements'));
            return;
        }

        if (!isSuperAdmin && !formData.restaurantId) {
            setError(t('common.error'));
            return;
        }

        try {
            setLoading(true);
            const response = await userService.createUser(formData);

            // If super admin created an admin, show restaurant modal
            if (isSuperAdmin && formData.role === "ADMIN") {
                setCreatedAdmin(response.data);
                setShowRestaurantModal(true);
                setLoading(false);
            } else {
                // For non-admin roles, redirect immediately
                navigate(usersBasePath);
            }
        } catch (err) {
            console.error("Error creating user:", err);
            setError(err.response?.data?.message || t('common.error'));
            setLoading(false);
        }
    };

    const handleCreateRestaurant = async (restaurantData) => {
        try {
            // Create restaurant
            const restaurantResponse = await restaurantService.createRestaurant(restaurantData);
            const restaurant = restaurantResponse.data;

            // Assign restaurant to admin
            await userService.updateUser(createdAdmin.id, {
                restaurantId: restaurant.id
            });

            // Close modal and navigate
            setShowRestaurantModal(false);
            navigate(usersBasePath);
        } catch (err) {
            console.error("Error creating restaurant:", err);
            toast.error("Failed to create restaurant", {
                description: err.response?.data?.message || "Please try again.",
                duration: 4000
            });
        }
    };

    const handleSkipRestaurant = () => {
        setShowRestaurantModal(false);
        navigate(usersBasePath);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {isSuperAdmin ? t('admin.management.create.adminTitle') : t('admin.management.create.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isSuperAdmin
                                ? t('admin.management.create.adminSubtitle')
                                : t('admin.management.create.subtitle')}
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
                            {t('admin.management.create.form.fullName')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder={t('admin.management.create.form.fullNamePlaceholder')}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.create.form.email')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder={t('admin.management.create.form.emailPlaceholder')}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.create.form.password')} <span className="text-error">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder={t('admin.management.create.form.passwordPlaceholder')}
                            minLength={6}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.create.form.phone')}
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            placeholder={t('admin.management.create.form.phonePlaceholder')}
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.create.form.role')} <span className="text-error">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                            required
                            disabled={isSuperAdmin}
                        >
                            {isSuperAdmin ? (
                                <option value="ADMIN">{t('admin.roles.admin')}</option>
                            ) : (
                                <>
                                    <option value="ADMIN">{t('admin.roles.admin')}</option>
                                    <option value="WAITER">{t('admin.roles.waiter')}</option>
                                    <option value="KITCHEN">{t('admin.roles.kitchen')}</option>
                                </>
                            )}
                        </select>
                        {isSuperAdmin && (
                            <p className="text-sm text-gray-500 mt-1">
                                {t('admin.management.create.form.adminRoleHelp')}
                            </p>
                        )}
                    </div>

                    {/* Restaurant ID (hidden for super admin) */}
                    {!isSuperAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                {t('admin.management.create.form.restaurantId')} <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="restaurantId"
                                value={formData.restaurantId}
                                onChange={handleChange}
                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
                                placeholder="Restaurant ID"
                                required
                                readOnly
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {t('admin.management.create.form.restaurantIdHelp')}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Icon name="Loader2" size={20} className="animate-spin" />
                                    {t('admin.management.create.form.submitting')}
                                </>
                            ) : (
                                <>
                                    <Icon name="Plus" size={20} />
                                    {isSuperAdmin ? t('admin.management.create.form.adminSubmit') : t('admin.management.create.form.submit')}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(usersBasePath)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            {t('admin.management.create.form.cancel')}
                        </button>
                    </div>
                </form>

                {/* Restaurant Creation Modal */}
                <CreateRestaurantModal
                    isOpen={showRestaurantModal}
                    onClose={handleSkipRestaurant}
                    onSubmit={handleCreateRestaurant}
                    adminName={createdAdmin?.fullName || ""}
                />
            </div>
        </div>
    );
};

export default CreateUser;
