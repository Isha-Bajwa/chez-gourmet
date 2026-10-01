const { db } = require('../config/firebase');
const { verifyQRPayload } = require('../services/tokenService');
const { sendOrderNotification } = require('../services/notificationService');

/**
 * Verify Digital Token or QR Code Payload
 */
const verifyToken = async (req, res) => {
  try {
    const { token_number, qr_data } = req.body;

    let targetOrderId = null;
    let targetToken = null;

    if (qr_data) {
      const verification = verifyQRPayload(qr_data);
      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }
      targetOrderId = verification.payload.order_id;
      targetToken = verification.payload.token_number;
    } else if (token_number) {
      targetToken = token_number.toUpperCase().trim();
    } else {
      return res.status(400).json({ success: false, message: 'Provide either token_number or qr_data for verification.' });
    }

    let orderDoc;
    if (targetOrderId) {
      orderDoc = await db.collection('orders').doc(targetOrderId).get();
    } else {
      const tokenQuery = await db.collection('orders').where('token_number', '==', targetToken).get();
      if (!tokenQuery.empty) {
        orderDoc = tokenQuery.docs[0];
      }
    }

    if (!orderDoc || !orderDoc.exists) {
      return res.status(404).json({ success: false, message: `No active order found for token '${targetToken || targetOrderId}'.` });
    }

    const orderData = orderDoc.data();

    // Check if order was ALREADY collected
    if (orderData.order_status === 'Collected' || orderData.order_status === 'Completed') {
      return res.status(400).json({
        success: false,
        already_collected: true,
        message: `⚠️ ALREADY COLLECTED! Order ${orderData.token_number} was already collected at ${orderData.collected_at || 'earlier time'}.`,
        data: orderData
      });
    }

    // Check status readiness
    if (orderData.order_status !== 'Ready') {
      return res.status(400).json({
        success: false,
        can_collect: false,
        message: `Order ${orderData.token_number} is NOT ready for collection yet. Current status: '${orderData.order_status}'.`,
        data: orderData
      });
    }

    return res.status(200).json({
      success: true,
      can_collect: true,
      message: `✅ Token verified! Order ${orderData.token_number} is READY for handover.`,
      data: orderData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification failed.', error: error.message });
  }
};

/**
 * Staff Confirms Handover / Collection
 */
const confirmCollection = async (req, res) => {
  try {
    const { order_id, token_number } = req.body;

    let docRef;
    if (order_id) {
      docRef = db.collection('orders').doc(order_id);
    } else if (token_number) {
      const tokenQuery = await db.collection('orders').where('token_number', '==', token_number.toUpperCase()).get();
      if (!tokenQuery.empty) {
        docRef = tokenQuery.docs[0].ref;
      }
    }

    if (!docRef) {
      return res.status(404).json({ success: false, message: 'Order reference not found.' });
    }

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Order document does not exist.' });
    }

    const orderData = doc.data();

    // Prevent double collection!
    if (orderData.order_status === 'Collected' || orderData.order_status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Security Alert: Order has ALREADY been collected!'
      });
    }

    const updateFields = {
      order_status: 'Completed', // Final state
      collected_at: new Date().toISOString(),
      staff_verified_by: req.user ? req.user.uid : 'staff_counter'
    };

    await docRef.update(updateFields);

    sendOrderNotification({ ...orderData, ...updateFields }, `Order ${orderData.token_number} collected successfully.`);

    return res.status(200).json({
      success: true,
      message: `Order ${orderData.token_number} confirmed and marked as Completed.`,
      data: { ...orderData, ...updateFields }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to confirm collection.', error: error.message });
  }
};

module.exports = {
  verifyToken,
  confirmCollection
};
