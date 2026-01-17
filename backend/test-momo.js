// Test MoMo Payment Integration
const crypto = require('crypto');
const https = require('https');

// MoMo Sandbox Credentials (Public)
const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const partnerCode = 'MOMO';

// Payment parameters
const orderInfo = 'Test MoMo Payment from Smart Restaurant';
const redirectUrl = 'http://localhost:5173/customer/payment/result';
const ipnUrl = 'http://localhost:5000/api/payments/momo/callback';
const requestType = 'payWithMethod';
const amount = '50000'; 
const orderId = partnerCode + new Date().getTime();
const requestId = orderId;
const extraData = Buffer.from(JSON.stringify({ 
    test: true, 
    orderId: orderId 
})).toString('base64');

// Create signature
const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

console.log('Raw Signature:');
console.log(rawSignature);
console.log('');

const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

console.log('Generated Signature:');
console.log(signature);
console.log('');

// Request body
const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: 'Smart Restaurant Test',
    storeId: 'SmartRestaurantTest',
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: 'vi',
    extraData: extraData,
    requestType: requestType,
    signature: signature
});

console.log('Request Body:');
console.log(JSON.stringify(JSON.parse(requestBody), null, 2));
console.log('');

// Make request to MoMo
const options = {
    hostname: 'test-payment.momo.vn',
    port: 443,
    path: '/v2/gateway/api/create',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
    }
};

console.log('Sending request to MoMo...');
console.log('');

const req = https.request(options, res => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    console.log('');
    
    res.setEncoding('utf8');
    
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(body);
            console.log('Response Body:');
            console.log(JSON.stringify(response, null, 2));
            console.log('');
            
            if (response.resultCode === 0) {
                console.log('SUCCESS! Payment URL created:');
                console.log(response.payUrl);
                console.log('');
                console.log('Open this URL in your browser to complete the payment');
                if (response.qrCodeUrl) {
                    console.log('QR Code URL:', response.qrCodeUrl);
                }
                if (response.deeplink) {
                    console.log('Deeplink:', response.deeplink);
                }
            } else {
                console.log('FAILED!');
                console.log('Error Code:', response.resultCode);
                console.log('Message:', response.message);
            }
        } catch (error) {
            console.error('Failed to parse response:', error);
            console.log('Raw body:', body);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(requestBody);
req.end();
