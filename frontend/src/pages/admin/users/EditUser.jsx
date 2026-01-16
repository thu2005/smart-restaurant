import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userService from "../../../services/userService";
import Icon from "../../../components/AppIcon";

const EditUser = () => {
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
        } catch (err) {
            console.error("Error fetching user:", err);
            setError(err.response?.data?.message || "Failed to fetch user");
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
            setError("Full name is required");
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setError("Password must be at least 6 characters");
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
            setError(err.response?.data?.message || "Failed to update user");
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
                        <p>Loading user...</p>
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
                        User not found
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isSuperAdmin ? "Edit Admin" : "Edit Staff"}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isSuperAdmin ? "Update admin information" : "Update staff information"}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(usersBasePath)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Staff Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                                    <Icon name="User" size={24} className="text-blue-600" />
                                </div>
                            )}
                            <div>
                                <div className="font-semibold">{user.fullName}</div>
                                <div className="text-sm text-gray-600">
                                    {user.role.replace("_", " ")} • {user.isActive ? "Active" : "Inactive"}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john@example.com"
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+84 123 456 789"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Leave blank to keep current password"
                        minLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Only fill this if you want to change the password
                    </p>
                </div>

                {/* Role (Read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <input
                        type="text"
                        value={user.role.replace("_", " ")}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                        readOnly
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Role cannot be changed
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <Icon name="Save" size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(usersBasePath)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default EditUser;
