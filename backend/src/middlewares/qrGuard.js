const { verifyTableToken } = require('../utils/token');
const { prisma } = require('../config/database');
const { logSecurityEvent } = require('../services/securityService');

/**
 * Middleware to validate QR token from query params
 * Validates token signature, checks table exists, and verifies token is current
 */
const checkQRToken = async (req, res, next) => {
    try {
        const token = req.query.token;

        if (!token) {
            await logSecurityEvent({
                endpoint: req.originalUrl,
                reason: 'Missing QR token',
                ipAddress: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('User-Agent'),
            });
            return res.status(401).json({
                success: false,
                message: 'Missing QR token'
            });
        }

        // Verify token signature
        const decoded = verifyTableToken(token);
        if (!decoded) {
            await logSecurityEvent({
                endpoint: req.originalUrl,
                reason: 'Invalid token signature',
                invalidToken: token,
                ipAddress: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('User-Agent'),
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid QR code. Please scan a valid code.'
            });
        }

        // Find the table
        const table = await prisma.table.findUnique({
            where: { id: decoded.tableId }
        });

        if (!table) {
            await logSecurityEvent({
                endpoint: req.originalUrl,
                reason: 'Table not found for token',
                tableId: decoded.tableId,
                invalidToken: token,
                ipAddress: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('User-Agent'),
            });
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        // Check if token matches current QR token (invalidation check)
        if (table.qrCode !== token) {
            await logSecurityEvent({
                endpoint: req.originalUrl,
                reason: 'QR token expired or regenerated',
                tableId: table.id,
                invalidToken: token,
                ipAddress: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('User-Agent'),
            });
            return res.status(403).json({
                success: false,
                message: 'This QR code is no longer valid. Please scan the latest code at your table or ask staff for assistance.'
            });
        }

        // Check if table is active
        if (table.status !== 'AVAILABLE' && table.status !== 'OCCUPIED') {
            return res.status(403).json({
                success: false,
                message: 'This table is currently not available for ordering.'
            });
        }

        // Attach table to request for use in route handlers
        req.currentTable = table;
        req.restaurantId = table.restaurantId;
        next();

    } catch (error) {
        console.error('QR Guard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error validating QR code'
        });
    }
};

module.exports = {
    checkQRToken,
};
