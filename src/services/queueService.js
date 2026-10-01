/**
 * Smart Queue & Order Prioritization Engine
 * Handles dynamic kitchen queue management, preparation time estimation,
 * scheduled pickup slot handling, and delay predictions.
 */

/**
 * Calculate estimated preparation time in minutes for an array of items
 * @param {Array} items - List of items with preparation_time and quantity
 * @param {Number} activeOrdersCount - Number of currently active/preparing orders in kitchen
 */
function calculateEstimatedPrepTime(items = [], activeOrdersCount = 0) {
  if (!items || items.length === 0) return 5; // Default 5 mins

  let maxBasePrepTime = 0;
  let totalQuantityCount = 0;

  items.forEach(item => {
    const prepTime = Number(item.preparation_time || item.prep_time || 5);
    const qty = Number(item.quantity || 1);

    if (prepTime > maxBasePrepTime) {
      maxBasePrepTime = prepTime;
    }
    totalQuantityCount += qty;
  });

  const itemComplexityTime = maxBasePrepTime + ((totalQuantityCount - 1) * 1.5);
  const workloadDelay = activeOrdersCount * 2.0;

  const totalEstimatedMinutes = Math.round(itemComplexityTime + workloadDelay);

  return Math.max(totalEstimatedMinutes, 3);
}

/**
 * Calculate expected ready timestamp based on prep time or scheduled pickup
 * @param {Date|String} orderTime 
 * @param {Number} prepTimeMinutes 
 * @param {String|null} pickupTime 
 */
function calculateEstimatedReadyTime(orderTime, prepTimeMinutes, pickupTime = null) {
  const orderDate = new Date(orderTime || Date.now());

  if (pickupTime && typeof pickupTime === 'string') {
    try {
      // Parse slot strings like "12:30 - 12:45 PM" or "01:15 - 01:30 PM"
      let timeStr = pickupTime.split('-')[0].trim(); // Get "12:30" or "01:15"
      const isPM = pickupTime.toUpperCase().includes('PM');
      const isAM = pickupTime.toUpperCase().includes('AM');

      if (timeStr.includes(':')) {
        let [hours, minutes] = timeStr.split(':').map(str => parseInt(str, 10));
        
        if (!isNaN(hours) && !isNaN(minutes)) {
          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;

          const targetPickupDate = new Date(orderDate);
          targetPickupDate.setHours(hours, minutes, 0, 0);

          if (!isNaN(targetPickupDate.getTime())) {
            return targetPickupDate.toISOString();
          }
        }
      }
    } catch (err) {
      console.warn('Pickup time parse fallback:', err.message);
    }
  }

  // Standard ready time = order_time + prep_time_minutes
  const estimatedReady = new Date(orderDate.getTime() + prepTimeMinutes * 60000);
  return estimatedReady.toISOString();
}

/**
 * Prioritize Orders for Kitchen Display System (KDS)
 */
function prioritizeKitchenQueue(orders = []) {
  const now = Date.now();

  const scoredOrders = orders.map(order => {
    let score = 0;
    const orderTime = new Date(order.order_time || order.createdAt || now).getTime();
    const waitingMinutes = Math.floor((now - orderTime) / 60000);
    
    score += Math.max(waitingMinutes, 0) * 1.5;

    if (order.order_status === 'Preparing') {
      score += 100;
    }

    if (order.is_delayed || (order.estimated_ready_time && new Date(order.estimated_ready_time).getTime() < now && order.order_status !== 'Ready')) {
      score += 50;
    }

    if (order.pickup_time) {
      score += 20;
    }

    if (order.estimated_prep_time && order.estimated_prep_time <= 5) {
      score += 10;
    }

    return {
      ...order,
      queue_priority_score: Math.round(score),
      waiting_minutes: Math.max(waitingMinutes, 0)
    };
  });

  scoredOrders.sort((a, b) => b.queue_priority_score - a.queue_priority_score);

  return scoredOrders;
}

module.exports = {
  calculateEstimatedPrepTime,
  calculateEstimatedReadyTime,
  prioritizeKitchenQueue
};
