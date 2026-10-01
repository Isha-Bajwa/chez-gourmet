/**
 * AI & Predictive Analytics Engine for Smart Canteen Management
 */

/**
 * Predict Peak Ordering Hours based on historical order distribution
 */
function predictPeakHours(orders = []) {
  const hourlyCount = Array(24).fill(0);

  orders.forEach(order => {
    if (order.order_time) {
      const hour = new Date(order.order_time).getHours();
      hourlyCount[hour]++;
    }
  });

  const peakHourIndex = hourlyCount.indexOf(Math.max(...hourlyCount));
  const formatTime = (h) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;

  const peakWindow = `${formatTime(peakHourIndex)} - ${formatTime((peakHourIndex + 1) % 24)}`;
  
  return {
    predicted_peak_window: peakWindow,
    peak_hour_24h: peakHourIndex,
    hourly_distribution: hourlyCount.map((count, hr) => ({ hour: formatTime(hr), order_count: count }))
  };
}

/**
 * Predict Demand for Food Items
 */
function predictFoodDemand(orders = [], menuItems = []) {
  const itemMap = new Map();

  orders.forEach(order => {
    if (Array.isArray(order.items)) {
      order.items.forEach(item => {
        const id = item.item_id || item.id;
        const name = item.item_name || item.name || 'Unknown Item';
        const qty = item.quantity || 1;

        if (!itemMap.has(id)) {
          itemMap.set(id, { item_id: id, item_name: name, total_ordered: 0, category: item.category || 'General' });
        }
        itemMap.get(id).total_ordered += qty;
      });
    }
  });

  const predictions = Array.from(itemMap.values()).map(item => {
    // Basic AI demand estimation multiplier for upcoming rush
    const forecastNextShift = Math.ceil(item.total_ordered * 1.25);
    const demandLevel = item.total_ordered > 20 ? 'HIGH' : item.total_ordered > 10 ? 'MEDIUM' : 'LOW';

    return {
      ...item,
      predicted_demand_qty: forecastNextShift,
      demand_level: demandLevel,
      recommended_pre_cook_portions: Math.ceil(forecastNextShift * 0.4) // Recommend 40% pre-cooked before rush
    };
  });

  predictions.sort((a, b) => b.total_ordered - a.total_ordered);

  return predictions;
}

/**
 * Order Delay Prediction
 * Predicts which active orders are at risk of delay based on current kitchen load
 */
function predictOrderDelays(activeOrders = [], kitchenStaffCount = 2) {
  const now = Date.now();
  const maxCapacityPerStaff = 4; // Max concurrent orders per kitchen staff
  const currentCapacity = kitchenStaffCount * maxCapacityPerStaff;
  const isOverloaded = activeOrders.length > currentCapacity;

  return activeOrders.map(order => {
    const elapsedMinutes = Math.floor((now - new Date(order.order_time).getTime()) / 60000);
    const prepTime = order.estimated_prep_time || 10;
    
    let delayProbability = 0.1; // Base 10%

    if (isOverloaded) delayProbability += 0.4;
    if (elapsedMinutes > prepTime * 0.7 && order.order_status === 'Placed') delayProbability += 0.35;
    if (elapsedMinutes > prepTime) delayProbability = 0.95;

    const riskLevel = delayProbability >= 0.7 ? 'HIGH' : delayProbability >= 0.4 ? 'MEDIUM' : 'LOW';

    return {
      order_id: order.order_id || order.id,
      token_number: order.token_number,
      customer_id: order.customer_id,
      current_status: order.order_status,
      elapsed_minutes: elapsedMinutes,
      estimated_prep_time: prepTime,
      delay_probability: Math.min(Math.round(delayProbability * 100), 99) + '%',
      risk_level: riskLevel,
      recommendation: riskLevel === 'HIGH' ? 'Prioritize in kitchen immediately or reassign staff' : 'On schedule'
    };
  });
}

/**
 * Generate AI Executive Insights
 */
function generateAISalesInsights(orders = []) {
  if (!orders || orders.length === 0) {
    return [
      "No order data available yet. Start accepting orders to generate AI insights."
    ];
  }

  const insights = [];
  const peak = predictPeakHours(orders);
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const completedOrders = orders.filter(o => o.order_status === 'Completed' || o.order_status === 'Collected').length;
  const cancelledOrders = orders.filter(o => o.order_status === 'Cancelled' || o.order_status === 'Rejected').length;

  insights.push(`Peak order volume is predicted between ${peak.predicted_peak_window}. Ensure extra kitchen staff is scheduled during this interval.`);

  if (orders.length > 0) {
    const cancellationRate = Math.round((cancelledOrders / orders.length) * 100);
    if (cancellationRate > 10) {
      insights.push(`Order cancellation rate is currently ${cancellationRate}%. Consider reviewing preparation speed to reduce drop-offs.`);
    } else {
      insights.push(`Fulfillment rate is optimal at ${100 - cancellationRate}%, showing high customer satisfaction.`);
    }
  }

  insights.push(`Total revenue generated today is $${totalRevenue.toFixed(2)} across ${orders.length} total orders.`);
  insights.push(`Top recommended action: Pre-prepare high demand sides (e.g. Fries, Drinks) 15 minutes before the lunch surge to cut average prep time by 30%.`);

  return insights;
}

module.exports = {
  predictPeakHours,
  predictFoodDemand,
  predictOrderDelays,
  generateAISalesInsights
};
