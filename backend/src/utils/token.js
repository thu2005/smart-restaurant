const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Generates a long-lived token for Table QR Codes
const generateTableToken = (tableId, tableNumber, restaurantId) => {
    const payload = {
        tableId,
        tableNumber,
        timestamp: Date.now(),
        restaurantId,
    };
    // Token valid for 1 year
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' });
};

const verifyTableToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    generateTableToken,
    verifyTableToken
};
