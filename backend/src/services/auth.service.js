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

        // If role is ADMIN and no restaurantId provided, auto-assign an existing restaurant
        let finalRestaurantId = restaurantId || null;
        if ((role === 'ADMIN' || role === 'WAITER' || role === 'KITCHEN') && !restaurantId) {
            const existingRestaurant = await prisma.restaurant.findFirst();
            if (existingRestaurant) {
                finalRestaurantId = existingRestaurant.id;
            } else {
                // Fallback: create a new restaurant if none exist
                const restaurant = await prisma.restaurant.create({
                    data: {
                        name: `${fullName}'s Restaurant`,
                        description: 'Welcome to your restaurant! Update your details in settings.',
                        isActive: true,
                    },
                });
                finalRestaurantId = restaurant.id;
            }
        }

        // Create user
        // Only require email verification for CUSTOMER role
        const isCustomer = (role || 'CUSTOMER') === 'CUSTOMER';
        const requiresVerification = isCustomer && process.env.RESEND_API_KEY;
        
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                phone,
                role: role || 'CUSTOMER',
                restaurantId: finalRestaurantId,
                verificationToken: requiresVerification ? verificationToken : null,
                emailVerified: !requiresVerification // Auto-verify non-customers, require verification for customers
            },
        });

        // Send verification email only for CUSTOMER role
        if (requiresVerification) {
            try {
                await emailService.sendVerificationEmail(user.email, verificationToken);
                console.log(`✅ Verification email sent to ${user.email}`);
            } catch (error) {
                console.error('❌ Email send failed:', error);
                // Don't fail registration, but log it
            }
        }

        // Generate token for immediate login (only if email is verified)
        const token = user.emailVerified ? generateToken(user.id, user.role) : null;

        return {
            message: requiresVerification 
                ? 'Registration successful. Please check your email to verify your account.'
                : 'Registration successful.',
            userId: user.id,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                restaurantId: user.restaurantId,
                emailVerified: user.emailVerified
            },
            token, // Return token only if verified
            requiresVerification
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

        // Check verification for CUSTOMER role only
        if (user.role === 'CUSTOMER' && !user.emailVerified) {
            throw new Error('Please verify your email address before logging in.');
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

    async resendVerificationEmail(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) throw new Error('User not found');
        if (user.emailVerified) throw new Error('Email already verified');
        if (user.role !== 'CUSTOMER') throw new Error('Not allowed');

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken }
        });

        await emailService.sendVerificationEmail(user.email, verificationToken);
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
                avatar: true,
                createdAt: true
            }
        });
        return user;
    }

    /**
     * Update user profile
     * @param {String} userId
     * @param {Object} updateData
     * @returns {Object} updated user
     */
    async updateProfile(userId, updateData) {
        // Allow updating more fields: fullName, phone, avatar, email, restaurantId, isActive, role
        const allowedFields = [
            'fullName', 'phone', 'email', 'restaurantId', 'isActive', 'role'
        ];
        const data = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                data[key] = updateData[key];
            }
        }
        // Prevent updating id, password, createdAt, updatedAt, tokens, etc.
        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                restaurantId: true,
                avatar: true,
                isActive: true,
                createdAt: true
            }
        });
        return user;
    }

    /**
     * Update user avatar
     * @param {String} userId
     * @param {String} avatarUrl
     * @returns {Object} updated user
     */
    async updateAvatar(userId, avatarUrl) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                restaurantId: true,
                avatar: true,
                createdAt: true
            }
        });

        return user;
    }

    /**
     * Change password with old password verification
     * @param {String} userId
     * @param {String} oldPassword
     * @param {String} newPassword
     */
    async updatePassword(userId, oldPassword, newPassword) {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Invalid old password');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
    }
    /**
     * Create user avatar (POST)
     * @param {String} userId
     * @param {String} avatarUrl
     * @returns {Object} updated user
     */
    async createAvatar(userId, avatarUrl) {
        // Only allow creation if avatar is not set
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true }
        });
        if (user && user.avatar) {
            throw new Error('Avatar already exists. Use update instead.');
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                restaurantId: true,
                avatar: true,
                createdAt: true
            }
        });
        return updatedUser;
    }
}

module.exports = new AuthService();
