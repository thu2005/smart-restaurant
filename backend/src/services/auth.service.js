const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateToken } = require('../utils/token');

const crypto = require('crypto');
const emailService = require('./email.service');

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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                phone,
                role: role || 'CUSTOMER',
                restaurantId: restaurantId || null,
                verificationToken,
                emailVerified: false
            },
        });

        // Send verification email
        try {
            await emailService.sendVerificationEmail(user.email, verificationToken);
        } catch (error) {
            console.error('Email send failed:', error);
            // Don't fail registration, but log it
        }

        // Generate token (can login immediately? or require verification? User requirement says "Activation by email")
        // Usually we return success message "Please check email" and NO token.
        // But for backward compatibility or ease, let's see. 
        // "Account activation by email" usually means NO LOGIN until active.

        return {
            message: 'Registration successful. Please check your email to verify account.',
            userId: user.id
            // No token returned!
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

        // Check verification
        if (!user.emailVerified) {
            throw new Error('Please verify your email address.');
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

    async verifyEmail(token) {
        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) throw new Error('Invalid token');

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null // Consumer token
            }
        });

        return true;
    }

    async forgotPassword(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpire = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpire: resetExpire
            }
        });

        try {
            await emailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (error) {
            console.error('Email send failed:', error);
            throw new Error('Email could not be sent');
        }
    }

    async resetPassword(token, newPassword) {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpire: { gt: new Date() }
            }
        });

        if (!user) throw new Error('Invalid or expired token');

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null
            }
        });
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
