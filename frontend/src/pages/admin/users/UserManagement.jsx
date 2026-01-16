import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userService from "../../../services/userService";
import Icon from "../../../components/AppIcon";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userEmail: "" });
    const [deleting, setDeleting] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
    const usersBasePath = isSuperAdmin ? "/superadmin/users" : "/admin/users";

    useEffect(() => {
        fetchUsers();
    }, [filterRole, filterStatus]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (filterRole) filters.role = filterRole;
            if (filterStatus !== "") filters.isActive = filterStatus === "active";

            const response = await userService.getAllUsers(filters);
            setUsers(response.data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user?`)) {
            return;
        }

        try {
            await userService.toggleUserStatus(userId, !currentStatus);
            fetchUsers();
        } catch (err) {
            console.error("Error toggling user status:", err);
            alert(err.response?.data?.message || "Failed to update user status");
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        setDeleteModal({ isOpen: true, userId, userEmail });
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            await userService.deleteUser(deleteModal.userId);
            setDeleteModal({ isOpen: false, userId: null, userEmail: "" });
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.response?.data?.message || "Failed to delete user");
        } finally {
            setDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        if (!deleting) {
            setDeleteModal({ isOpen: false, userId: null, userEmail: "" });
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "SUPER_ADMIN":
                return "bg-purple-100 text-purple-800";
            case "ADMIN":
                return "bg-blue-100 text-blue-800";
            case "WAITER":
                return "bg-green-100 text-green-800";
            case "KITCHEN":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Icon name="Loader2" className="animate-spin h-8 w-8 mx-auto mb-2" />
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        {isSuperAdmin ? "Admin Management" : "Staff Management"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isSuperAdmin ? "Manage Admin accounts" : "Manage restaurant staff accounts"}
                    </p>
                </div>
                <Link
                    to={`${usersBasePath}/create`}
                    className="flex items-center gap-2 bg-primary text-sm text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
                >
                    <Icon name="Plus" size={20} />
                    {isSuperAdmin ? "Add Admin" : "Add Staff"}
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Role
                        </label>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Roles</option>
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
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                {!isSuperAdmin && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Restaurant
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? "5" : "6"} className="px-6 py-12 text-center text-gray-500">
                                        <Icon name="Users" className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                        <p>No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.fullName}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <Icon name="User" size={20} className="text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role.replace("_", " ")}
                                            </span>
                                        </td>
                                        {!isSuperAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.restaurant?.name || "N/A"}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`${usersBasePath}/${user.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Icon name="Edit" size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                    className={`${
                                                        user.isActive
                                                            ? "text-orange-600 hover:text-orange-900"
                                                            : "text-green-600 hover:text-green-900"
                                                    }`}
                                                    title={user.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    <Icon
                                                        name={user.isActive ? "UserX" : "UserCheck"}
                                                        size={18}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Icon name="Trash2" size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            {users.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Showing {users.length} user{users.length !== 1 ? "s" : ""}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title="Delete User"
                message={`Are you sure you want to permanently delete ${deleteModal.userEmail}? This action cannot be undone.`}
                loading={deleting}
            />
        </div>
    );
};

export default UserManagement;
