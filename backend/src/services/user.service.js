const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
    /**
     * Create a new user (Admin, Waiter, or Kitchen Staff)
     * @param {Object} data - User data
     * @param {String} creatorRole - Role of the user creating this account
     * @returns {Object} Created user without password
     */
    async createUser(data, creatorRole) {
        const { email, password, fullName, phone, role, restaurantId } = data;

        // Validate role-based permissions
        if (creatorRole === 'SUPER_ADMIN') {
            // SUPER_ADMIN can only create ADMIN accounts
            if (role !== 'ADMIN') {
                throw new Error('Super Admin can only create Admin accounts');
            }
        } else if (creatorRole === 'ADMIN') {
            // ADMIN can create WAITER and KITCHEN accounts
            if (!['WAITER', 'KITCHEN', 'ADMIN'].includes(role)) {
                throw new Error('Admin can only create Waiter, Kitchen Staff, or Admin accounts');
            }
            // ADMIN must specify restaurantId for staff accounts
            if (!restaurantId) {
                throw new Error('Restaurant ID is required for creating staff accounts');
            }
        } else {
            throw new Error('Unauthorized to create user accounts');
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                phone: phone || null,
                role,
                restaurantId: role === 'ADMIN' && creatorRole === 'SUPER_ADMIN' ? null : restaurantId,
                isActive: true,
                emailVerified: true, // Auto-verify staff accounts
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                restaurantId: true,
                isActive: true,
                emailVerified: true,
                createdAt: true,
            }
        });

        return user;
    }

    /**
     * Get all users (filtered by role and restaurant)
     * @param {String} requesterRole - Role of the user making the request
     * @param {String} restaurantId - Restaurant ID (for ADMIN)
     * @param {Object} filters - Optional filters (role, isActive)
     * @returns {Array} List of users
     */
    async getAllUsers(requesterRole, restaurantId = null, filters = {}) {
        const whereClause = {};

        if (requesterRole === 'SUPER_ADMIN') {
            // SUPER_ADMIN can view all ADMIN accounts
            whereClause.role = 'ADMIN';
        } else if (requesterRole === 'ADMIN') {
            // ADMIN can view users in their restaurant (WAITER, KITCHEN, ADMIN)
            whereClause.restaurantId = restaurantId;
            whereClause.role = { in: ['ADMIN', 'WAITER', 'KITCHEN'] };
        } else {
            throw new Error('Unauthorized to view users');
        }

        // Apply additional filters
        if (filters.role) {
            whereClause.role = filters.role;
        }
        if (filters.isActive !== undefined) {
            whereClause.isActive = filters.isActive;
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                role: true,
                restaurantId: true,
                isActive: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return users;
    }

    /**
     * Get user by ID
     * @param {String} userId - User ID
     * @param {String} requesterRole - Role of the user making the request
     * @param {String} restaurantId - Restaurant ID (for ADMIN)
     * @returns {Object} User details
     */
    async getUserById(userId, requesterRole, restaurantId = null) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                role: true,
                restaurantId: true,
                isActive: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify access permissions
        if (requesterRole === 'SUPER_ADMIN' && user.role !== 'ADMIN') {
            throw new Error('Super Admin can only view Admin accounts');
        } else if (requesterRole === 'ADMIN' && user.restaurantId !== restaurantId) {
            throw new Error('Unauthorized to view this user');
        }

        return user;
    }

    /**
     * Update user
     * @param {String} userId - User ID
     * @param {Object} updateData - Data to update
     * @param {String} requesterRole - Role of the user making the request
     * @param {String} restaurantId - Restaurant ID (for ADMIN)
     * @returns {Object} Updated user
     */
    async updateUser(userId, updateData, requesterRole, restaurantId = null) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify access permissions
        if (requesterRole === 'SUPER_ADMIN' && user.role !== 'ADMIN') {
            throw new Error('Super Admin can only update Admin accounts');
        } else if (requesterRole === 'ADMIN' && user.restaurantId !== restaurantId) {
            throw new Error('Unauthorized to update this user');
        }

        // Prepare update data
        const dataToUpdate = {};

        if (updateData.fullName) dataToUpdate.fullName = updateData.fullName;
        if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
        if (updateData.avatar !== undefined) dataToUpdate.avatar = updateData.avatar;
        
        // Allow SUPER_ADMIN to update restaurantId for Admin accounts
        if (updateData.restaurantId !== undefined && requesterRole === 'SUPER_ADMIN' && user.role === 'ADMIN') {
            dataToUpdate.restaurantId = updateData.restaurantId;
        }
        
        if (updateData.email && updateData.email !== user.email) {
            // Check if new email is already taken
            const existingUser = await prisma.user.findUnique({
                where: { email: updateData.email }
            });
            if (existingUser) {
                throw new Error('Email already registered');
            }
            dataToUpdate.email = updateData.email;
        }

        // Update password if provided
        if (updateData.password) {
            dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                role: true,
                restaurantId: true,
                isActive: true,
                emailVerified: true,
                updatedAt: true,
            }
        });

        return updatedUser;
    }

    /**
     * Deactivate/Activate user
     * @param {String} userId - User ID
     * @param {Boolean} isActive - Active status
     * @param {String} requesterRole - Role of the user making the request
     * @param {String} restaurantId - Restaurant ID (for ADMIN)
     * @returns {Object} Updated user
     */
    async toggleUserStatus(userId, isActive, requesterRole, restaurantId = null) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify access permissions
        if (requesterRole === 'SUPER_ADMIN' && user.role !== 'ADMIN') {
            throw new Error('Super Admin can only manage Admin accounts');
        } else if (requesterRole === 'ADMIN' && user.restaurantId !== restaurantId) {
            throw new Error('Unauthorized to manage this user');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
            }
        });

        return updatedUser;
    }

    /**
     * Delete user (permanent removal)
     * @param {String} userId - User ID
     * @param {String} requesterRole - Role of the user making the request
     * @param {String} restaurantId - Restaurant ID (for ADMIN)
     * @returns {Object} Deleted user info
     */
    async deleteUser(userId, requesterRole, restaurantId = null) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify access permissions
        if (requesterRole === 'SUPER_ADMIN' && user.role !== 'ADMIN') {
            throw new Error('Super Admin can only delete Admin accounts');
        } else if (requesterRole === 'ADMIN' && user.restaurantId !== restaurantId) {
            throw new Error('Unauthorized to delete this user');
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        return { id: userId, email: user.email, message: 'User deleted successfully' };
    }

    /**
     * Update own profile (any authenticated user)
     * @param {String} userId - User ID
     * @param {Object} updateData - Profile data
     * @returns {Object} Updated user
     */
    async updateOwnProfile(userId, updateData) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const dataToUpdate = {};

        if (updateData.fullName) dataToUpdate.fullName = updateData.fullName;
        if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
        if (updateData.avatar !== undefined) dataToUpdate.avatar = updateData.avatar;

        // Update password if provided
        if (updateData.password) {
            dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                role: true,
                restaurantId: true,
                isActive: true,
                updatedAt: true,
            }
        });

        return updatedUser;
    }
}

module.exports = new UserService();
