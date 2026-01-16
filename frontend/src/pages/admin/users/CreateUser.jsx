import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../../services/userService";
import restaurantService from "../../../services/restaurantService";
import Icon from "../../../components/AppIcon";
import CreateRestaurantModal from "../../../components/CreateRestaurantModal";

const CreateUser = () => {
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
            setError("Please fill in all required fields");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!isSuperAdmin && !formData.restaurantId) {
            setError("Restaurant ID is required");
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
            setError(err.response?.data?.message || "Failed to create user");
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
            alert(err.response?.data?.message || "Failed to create restaurant");
        }
    };

    const handleSkipRestaurant = () => {
        setShowRestaurantModal(false);
        navigate(usersBasePath);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(usersBasePath)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <Icon name="ArrowLeft" size={20} />
                    Back to Users
                </button>
                <h1 className="text-3xl font-bold">Create User</h1>
                <p className="text-gray-600 mt-1">
                    {isSuperAdmin
                        ? "Create a new Admin account"
                        : "Create a new Waiter or Kitchen Staff account"}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                    <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Min. 6 characters"
                        minLength={6}
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

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isSuperAdmin}
                    >
                        {isSuperAdmin ? (
                            <option value="ADMIN">Admin</option>
                        ) : (
                            <>
                                <option value="ADMIN">Admin</option>
                                <option value="WAITER">Waiter</option>
                                <option value="KITCHEN">Kitchen Staff</option>
                            </>
                        )}
                    </select>
                    {isSuperAdmin && (
                        <p className="text-sm text-gray-500 mt-1">
                            Super Admins can only create Admin accounts
                        </p>
                    )}
                </div>

                {/* Restaurant ID (hidden for super admin) */}
                {!isSuperAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Restaurant ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="restaurantId"
                            value={formData.restaurantId}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            placeholder="Restaurant ID"
                            required
                            readOnly
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Automatically set to your restaurant
                        </p>
                    </div>
                )}

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
                                Creating...
                            </>
                        ) : (
                            <>
                                <Icon name="Plus" size={20} />
                                Create User
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(usersBasePath)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
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
    );
};

export default CreateUser;
