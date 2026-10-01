/**
 * Notification Service
 * Sends real-time updates and logs order notification events
 */

const notificationLogs = [];

/**
 * Trigger notification event for an order status change
 */
function sendOrderNotification(order, statusMessage, type = 'STATUS_UPDATE') {
  const notification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    order_id: order.order_id || order.id,
    token_number: order.token_number,
    customer_id: order.customer_id,
    type,
    message: statusMessage || `Order ${order.token_number} status updated to ${order.order_status}`,
    timestamp: new Date().toISOString(),
    read: false
  };

  notificationLogs.unshift(notification);
  
  // Keep last 100 notifications
  if (notificationLogs.length > 100) {
    notificationLogs.pop();
  }

  console.log(`🔔 [NOTIFICATION SENT] Customer: ${order.customer_id} | Token: ${order.token_number} | Message: ${notification.message}`);
  return notification;
}

/**
 * Get notifications for a specific user
 */
function getUserNotifications(customerId) {
  return notificationLogs.filter(n => n.customer_id === customerId);
}

module.exports = {
  sendOrderNotification,
  getUserNotifications,
  notificationLogs
};
