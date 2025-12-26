const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateToken } = require('../utils/token');

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData
     * @returns {Object} user and token
     */
    async register(userData) {
        const { email, password, fullName, phone, role, restaurantId } = userData;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                phone,
                role: role || 'CUSTOMER', // Default to CUSTOMER if not specified
                restaurantId: restaurantId || null,
            },
        });

        // Generate token
        const token = generateToken(user.id, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
            token,
        };
    }

    /**
     * Login user
     * @param {String} email
     * @param {String} password
     * @returns {Object} user and token
     */
    async login(email, password) {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                restaurantId: user.restaurantId
            },
            token,
        };
    }

    async getMe(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                restaurantId: true,
                createdAt: true
            }
        });
        return user;
    }
}

module.exports = new AuthService();
