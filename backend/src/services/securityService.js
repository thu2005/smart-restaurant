const { prisma } = require('../config/database');

/**
 * Log a security event to the database
 * @param {Object} details - Event details
 * @param {string} details.endpoint - API endpoint accessed
 * @param {string} details.reason - Failure reason
 * @param {string} [details.tableId] - Table ID (for QR failures)
 * @param {string} [details.invalidToken] - The invalid token (will be truncated)
 * @param {string} [details.ipAddress] - Client IP
 * @param {string} [details.userAgent] - Browser/client info
 */
const logSecurityEvent = async (details) => {
    try {
        const { endpoint, reason, tableId, invalidToken, ipAddress, userAgent } = details;

        await prisma.securityLog.create({
            data: {
                endpoint,
                reason,
                tableId: tableId || null,
                // Truncate token to first 20 chars for security
                invalidToken: invalidToken ? invalidToken.substring(0, 20) + '...' : null,
                ipAddress: ipAddress || null,
                userAgent: userAgent ? userAgent.substring(0, 255) : null,
            }
        });

        // Also log to console for immediate visibility
        console.warn('[SECURITY]', JSON.stringify({
            timestamp: new Date().toISOString(),
            ...details,
            invalidToken: invalidToken ? '[REDACTED]' : null,
        }));
    } catch (error) {
        // Don't let logging errors break the app
        console.error('[SECURITY] Failed to log security event:', error.message);
    }
};

/**
 * Check rate limit for an IP address
 * @param {string} ipAddress - Client IP
 * @param {number} [windowMinutes=5] - Time window in minutes
 * @param {number} [maxAttempts=10] - Max attempts allowed
 * @returns {Promise<boolean>} - True if rate limited
 */
const checkRateLimit = async (ipAddress, windowMinutes = 5, maxAttempts = 10) => {
    try {
        const timeWindow = new Date(Date.now() - windowMinutes * 60 * 1000);

        const attemptCount = await prisma.securityLog.count({
            where: {
                ipAddress: ipAddress,
                createdAt: {
                    gte: timeWindow,
                },
            },
        });

        return attemptCount >= maxAttempts;
    } catch (error) {
        console.error('[SECURITY] Rate limit check failed:', error.message);
        return false; // Fail open - don't block if check fails
    }
};

module.exports = {
    logSecurityEvent,
    checkRateLimit,
};
