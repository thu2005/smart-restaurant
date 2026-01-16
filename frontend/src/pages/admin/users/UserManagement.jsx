import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import userService from "../../../services/userService";
import Icon from "../../../components/AppIcon";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import StatusToggleModal from "../../../components/StatusToggleModal";

const UserManagement = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userEmail: "" });
    const [deleting, setDeleting] = useState(false);
    const [statusModal, setStatusModal] = useState({ isOpen: false, userId: null, userName: "", currentStatus: false });
    const [toggling, setToggling] = useState(false);

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
            setError(err.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus, userName) => {
        setStatusModal({ isOpen: true, userId, userName, currentStatus });
    };

    const confirmToggleStatus = async () => {
        try {
            setToggling(true);
            await userService.toggleUserStatus(statusModal.userId, !statusModal.currentStatus);
            setStatusModal({ isOpen: false, userId: null, userName: "", currentStatus: false });
            fetchUsers();
        } catch (err) {
            console.error("Error toggling user status:", err);
            setError(err.response?.data?.message || t('admin.toast.updateStatusError'));
        } finally {
            setToggling(false);
        }
    };

    const closeStatusModal = () => {
        if (!toggling) {
            setStatusModal({ isOpen: false, userId: null, userName: "", currentStatus: false });
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
            setError(err.response?.data?.message || t('admin.toast.deleteError'));
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
                    <p>{t('common.loading')}</p>
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
                        {isSuperAdmin ? t('admin.management.adminTitle') : t('admin.management.title')}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isSuperAdmin ? t('admin.management.adminSubtitle') : t('admin.management.subtitle')}
                    </p>
                </div>
                <Link
                    to={`${usersBasePath}/create`}
                    className="flex items-center gap-2 bg-primary text-sm text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
                >
                    <Icon name="Plus" size={20} />
                    {isSuperAdmin ? t('admin.management.addAdmin') : t('admin.management.addStaff')}
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-lg shadow mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.filters.role')}
                        </label>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">{t('admin.management.filters.allRoles')}</option>
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
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-foreground mb-1">
                            {t('admin.management.filters.status')}
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">{t('admin.management.filters.allStatus')}</option>
                            <option value="active">{t('common.status.active')}</option>
                            <option value="inactive">{t('common.status.inactive')}</option>
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
            <div className="bg-card rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('admin.management.table.user')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('admin.management.table.role')}
                                </th>
                                {!isSuperAdmin && (
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {t('admin.management.table.restaurant')}
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('admin.management.table.status')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('admin.management.table.created')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t('admin.management.table.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? "5" : "6"} className="px-6 py-12 text-center text-gray-500">
                                        <Icon name="Users" className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                        <p>{t('admin.management.table.noUsers')}</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
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
                                                    <div className="text-sm font-medium text-foreground">
                                                        {user.fullName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {t(`admin.roles.${user.role.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        {!isSuperAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {user.restaurant?.name || "N/A"}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {user.isActive ? t('common.status.active') : t('common.status.inactive')}
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
                                                    title={t('common.actions.edit')}
                                                >
                                                    <Icon name="Edit" size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.isActive, user.fullName)}
                                                    className={`${user.isActive
                                                        ? "text-orange-600 hover:text-orange-900"
                                                        : "text-green-600 hover:text-green-900"
                                                        }`}
                                                    title={user.isActive ? t('common.actions.deactivate') : t('common.actions.activate')}
                                                >
                                                    <Icon
                                                        name={user.isActive ? "UserX" : "UserCheck"}
                                                        size={18}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title={t('common.actions.delete')}
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
                    {t('common.pagination.showing', { count: users.length, total: users.length })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={t('common.actions.delete')}
                message={t('common.messages.deleteConfirm', { item: deleteModal.userEmail })}
                loading={deleting}
            />

            {/* Status Toggle Modal */}
            <StatusToggleModal
                isOpen={statusModal.isOpen}
                onClose={closeStatusModal}
                onConfirm={confirmToggleStatus}
                userName={statusModal.userName}
                currentStatus={statusModal.currentStatus}
                loading={toggling}
            />
        </div>
    );
};

export default UserManagement;
