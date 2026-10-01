const QRCode = require('qrcode');
const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_smart_canteen_jwt_key_2026';

/**
 * Generate sequential token string like C-021
 */
function generateTokenNumber(counter = 1) {
  const paddedCounter = String(counter).padStart(3, '0');
  return `C-${paddedCounter}`;
}

/**
 * Generate QR Code data URL & payload
 */
async function generateOrderQRCode(orderId, tokenNumber, customerId) {
  const payload = {
    order_id: orderId,
    token_number: tokenNumber,
    customer_id: customerId,
    issued_at: new Date().toISOString()
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payloadString).digest('hex');

  const fullData = {
    ...payload,
    signature
  };

  const qrDataString = JSON.stringify(fullData);
  const qrCodeImage = await QRCode.toDataURL(qrDataString);

  return {
    qr_code_image: qrCodeImage,
    qr_raw_data: fullData
  };
}

/**
 * Verify QR Code or Token Signature
 */
function verifyQRPayload(qrData) {
  try {
    const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    const { signature, ...payload } = data;
    
    if (!signature || !payload.order_id) {
      return { valid: false, message: 'Malformed QR token format.' };
    }

    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payloadString).digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, message: 'Invalid or tampered QR code signature.' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, message: 'Failed to parse QR token payload.' };
  }
}

module.exports = {
  generateTokenNumber,
  generateOrderQRCode,
  verifyQRPayload
};
