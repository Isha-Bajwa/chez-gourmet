const { db } = require('../config/firebase');
const { calculateEstimatedPrepTime, calculateEstimatedReadyTime } = require('../services/queueService');
const { generateTokenNumber, generateOrderQRCode } = require('../services/tokenService');
const { sendOrderNotification } = require('../services/notificationService');
const { clearMenuCache } = require('./menuController');

let globalTokenCounter = 35; // Starts from C-036

/**
 * Place a new pre-order
 */
const createOrder = async (req, res) => {
  try {
    const customerId = req.user ? (req.user.uid || req.user.id) : (req.body.customer_id || 'usr_guest');
    const customerName = req.user ? req.user.name : (req.body.customer_name || 'Guest Customer');
    const { items, pickup_time, payment_method = 'Online' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    // 1. Check pickup slot limits if pickup_time is specified
    if (pickup_time) {
      try {
        const snapshot = await db.collection('orders').get();
        const existingOrders = snapshot.docs.map(d => d.data()).filter(o => o.pickup_time === pickup_time && o.order_status !== 'Cancelled');
        const slotLimit = 20;
        if (existingOrders.length >= slotLimit) {
          return res.status(400).json({
            success: false,
            message: `The selected pickup slot (${pickup_time}) is full (Max ${slotLimit} orders). Please choose a different slot.`
          });
        }
      } catch (err) {
        console.warn('Slot limit check warning:', err.message);
      }
    }

    // 2. Validate stock and calculate total amount
    let totalAmount = 0;
    const validatedItems = [];
    const itemPrepDetails = [];

    for (const item of items) {
      const targetId = item.item_id || item.id;
      let itemDoc = await db.collection('menu_items').doc(targetId).get();
      let itemRef = itemDoc.ref;
      let itemData;

      if (itemDoc.exists) {
        itemData = itemDoc.data();
      } else {
        const querySnap = await db.collection('menu_items').where('item_id', '==', targetId).get();
        if (!querySnap.empty) {
          itemDoc = querySnap.docs[0];
          itemRef = itemDoc.ref;
          itemData = itemDoc.data();
        } else {
          const fallbackSnap = await db.collection('menu_items').where('id', '==', targetId).get();
          if (!fallbackSnap.empty) {
            itemDoc = fallbackSnap.docs[0];
            itemRef = fallbackSnap.ref;
            itemData = fallbackSnap.data();
          } else {
            return res.status(404).json({ success: false, message: `Menu item '${targetId}' not found.` });
          }
        }
      }

      if (itemData.status === 'Sold Out' || itemData.status === 'Temporarily Unavailable') {
        return res.status(400).json({
          success: false,
          message: `Item '${itemData.item_name}' is currently unavailable.`
        });
      }

      const qty = Number(item.quantity || 1);
      const availQty = Number(itemData.available_quantity !== undefined ? itemData.available_quantity : 20);

      if (availQty < qty && availQty > 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${itemData.item_name}'. Available: ${availQty}`
        });
      }

      const itemTotal = Number(itemData.price || 0) * qty;
      totalAmount += itemTotal;

      validatedItems.push({
        order_item_id: `oitem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        item_id: itemData.item_id || itemData.id,
        item_name: itemData.item_name,
        category: itemData.category || 'General',
        quantity: qty,
        price: Number(itemData.price || 0),
        special_instruction: item.special_instruction || item.instructions || ''
      });

      itemPrepDetails.push({
        preparation_time: itemData.preparation_time || 8,
        quantity: qty
      });

      // Deduct stock in DB
      const newQty = Math.max(availQty - qty, 0);
      const newStatus = newQty <= 0 ? 'Sold Out' : newQty <= 5 ? 'Limited' : itemData.status;
      if (itemRef && typeof itemRef.update === 'function') {
        await itemRef.update({
          available_quantity: newQty,
          status: newStatus
        });
      }
    }

    // Clear menu response cache so stock updates instantly
    clearMenuCache();

    // 3. Count active kitchen workload safely without Firestore 'in' query issues
    const allOrdersSnap = await db.collection('orders').get();
    const activeOrdersCount = allOrdersSnap.docs
      .map(d => d.data())
      .filter(o => ['Placed', 'Accepted', 'Preparing'].includes(o.order_status)).length;

    // 4. Calculate estimated prep time & ready time
    const prepTimeMinutes = calculateEstimatedPrepTime(itemPrepDetails, activeOrdersCount);
    const orderTime = new Date().toISOString();
    const estimatedReadyTime = calculateEstimatedReadyTime(orderTime, prepTimeMinutes, pickup_time);

    // 5. Generate digital token number (e.g. C-036)
    globalTokenCounter++;
    const tokenNumber = generateTokenNumber(globalTokenCounter);

    // 6. Generate order ID & signed QR code payload
    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const qrResult = await generateOrderQRCode(orderId, tokenNumber, customerId);

    const orderData = {
      order_id: orderId,
      id: orderId,
      customer_id: customerId,
      customer_name: customerName,
      token_number: tokenNumber,
      items: validatedItems,
      total_amount: Number(totalAmount.toFixed(2)),
      order_time: orderTime,
      pickup_time: pickup_time || null,
      estimated_prep_time: prepTimeMinutes,
      estimated_ready_time: estimatedReadyTime,
      order_status: 'Placed',
      payment_status: 'Paid',
      payment_method,
      qr_code_image: qrResult.qr_code_image,
      qr_raw_data: qrResult.qr_raw_data,
      is_delayed: false,
      created_at: orderTime
    };

    await db.collection('orders').doc(orderId).set(orderData);

    sendOrderNotification(orderData, `Order placed successfully! Token: ${tokenNumber}. Estimated prep time: ${prepTimeMinutes} mins.`);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: orderData
    });
  } catch (error) {
    console.error('🔥 Error in createOrder:', error);
    return res.status(500).json({ success: false, message: 'Failed to place order.', error: error.message });
  }
};

/**
 * Get orders (Filter by customer_id or status)
 */
const getOrders = async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    const user = req.user;

    const snapshot = await db.collection('orders').get();
    let orders = snapshot.docs.map(doc => doc.data());

    const isCustomer = user && user.role && user.role.toLowerCase().includes('customer');
    if (isCustomer) {
      orders = orders.filter(o => o.customer_id === user.uid || o.customer_id === user.id);
    } else if (customer_id) {
      orders = orders.filter(o => o.customer_id === customer_id);
    }

    if (status) {
      orders = orders.filter(o => o.order_status.toLowerCase() === status.toLowerCase());
    }

    orders.sort((a, b) => new Date(b.order_time) - new Date(a.order_time));

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.', error: error.message });
  }
};

/**
 * Get order by ID or Token Number
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let doc = await db.collection('orders').doc(id).get();
    if (doc.exists) {
      return res.status(200).json({ success: true, data: doc.data() });
    }

    const tokenQuery = await db.collection('orders').where('token_number', '==', id.toUpperCase()).get();
    if (!tokenQuery.empty) {
      return res.status(200).json({ success: true, data: tokenQuery.docs[0].data() });
    }

    return res.status(404).json({ success: false, message: 'Order not found.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving order.', error: error.message });
  }
};

/**
 * Update Order Status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, delay_reason } = req.body;

    const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Ready', 'Collected', 'Completed', 'Cancelled', 'Rejected', 'Delayed', 'Not Collected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    let docRef = db.collection('orders').doc(id);
    let doc = await docRef.get();

    if (!doc.exists) {
      const querySnap = await db.collection('orders').where('order_id', '==', id).get();
      if (!querySnap.empty) {
        docRef = querySnap.docs[0].ref;
        doc = querySnap.docs[0];
      } else {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
    }

    const orderData = doc.data();

    const updateFields = {
      order_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'Delayed') {
      updateFields.is_delayed = true;
      if (delay_reason) updateFields.delay_reason = delay_reason;
    }

    if (status === 'Ready') {
      updateFields.ready_at = new Date().toISOString();
    } else if (status === 'Collected' || status === 'Completed') {
      updateFields.collected_at = new Date().toISOString();
      updateFields.order_status = 'Completed';
    }

    await docRef.update(updateFields);

    const updatedOrder = { ...orderData, ...updateFields };

    sendOrderNotification(
      updatedOrder,
      status === 'Ready'
        ? `Order ${orderData.token_number} is READY for collection!`
        : `Order ${orderData.token_number} status updated to ${status}.`
    );

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      data: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update order status.', error: error.message });
  }
};

/**
 * Cancel Order
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const docRef = db.collection('orders').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const orderData = doc.data();

    if (orderData.order_status !== 'Placed' && orderData.order_status !== 'Accepted') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because preparation has already started (${orderData.order_status}).`
      });
    }

    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        const itemDoc = await db.collection('menu_items').doc(item.item_id).get();
        if (itemDoc.exists) {
          const itemData = itemDoc.data();
          const restoredQty = (itemData.available_quantity || 0) + item.quantity;
          await db.collection('menu_items').doc(item.item_id).update({
            available_quantity: restoredQty,
            status: restoredQty > 0 ? 'Available' : 'Sold Out'
          });
        }
      }
    }

    clearMenuCache();

    const updateFields = {
      order_status: 'Cancelled',
      cancel_reason: reason || 'Cancelled by customer',
      cancelled_at: new Date().toISOString()
    };

    await docRef.update(updateFields);

    sendOrderNotification({ ...orderData, ...updateFields }, `Order ${orderData.token_number} has been cancelled.`);

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock restored.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel order.', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
