const QRCode = require('qrcode');

exports.generateQRCode = async (url) => {
    try {
        // Generate QR code as data URL (base64 image)
        const qrCodeDataURL = await QRCode.toDataURL(url, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });
        return qrCodeDataURL;
    } catch (error) {
        throw new Error('Failed to generate QR code: ' + error.message);
    }
};

exports.generateQRBuffer = async (url) => {
    return await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'H',
        width: 300,
        type: 'png',
    });
};
