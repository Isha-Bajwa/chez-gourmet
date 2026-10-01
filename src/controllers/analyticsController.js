const { db } = require('../config/firebase');
const {
  predictPeakHours,
  predictFoodDemand,
  predictOrderDelays,
  generateAISalesInsights
} = require('../services/aiAnalyticsService');

/**
 * Get Canteen Executive Dashboard Metrics
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const ordersSnap = await db.collection('orders').get();
    const orders = ordersSnap.docs.map(d => d.data());

    const menuSnap = await db.collection('menu_items').get();
    const menuItems = menuSnap.docs.map(d => d.data());

    const totalOrdersToday = orders.length;
    const activeOrders = orders.filter(o => ['Placed', 'Accepted', 'Preparing'].includes(o.order_status)).length;
    const ordersPreparing = orders.filter(o => o.order_status === 'Preparing').length;
    const ordersReady = orders.filter(o => o.order_status === 'Ready').length;
    const completedOrders = orders.filter(o => o.order_status === 'Completed' || o.order_status === 'Collected').length;
    const cancelledOrders = orders.filter(o => o.order_status === 'Cancelled' || o.order_status === 'Rejected').length;

    const totalSales = orders.reduce((acc, o) => acc + (o.order_status !== 'Cancelled' ? Number(o.total_amount || 0) : 0), 0);

    // Calculate avg preparation time
    const prepTimes = orders.map(o => Number(o.estimated_prep_time || 8));
    const avgPrepTime = prepTimes.length > 0 ? Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length) : 8;

    // Determine Most & Least Ordered Items
    const itemSalesMap = {};
    orders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(i => {
          const name = i.item_name || 'Item';
          itemSalesMap[name] = (itemSalesMap[name] || 0) + i.quantity;
        });
      }
    });

    const sortedItems = Object.entries(itemSalesMap).sort((a, b) => b[1] - a[1]);
    const mostOrderedItem = sortedItems.length > 0 ? `${sortedItems[0][0]} (${sortedItems[0][1]} sold)` : 'N/A';
    const leastOrderedItem = sortedItems.length > 0 ? `${sortedItems[sortedItems.length - 1][0]} (${sortedItems[sortedItems.length - 1][1]} sold)` : 'N/A';

    const peakHoursData = predictPeakHours(orders);

    return res.status(200).json({
      success: true,
      data: {
        total_orders_today: totalOrdersToday,
        current_active_orders: activeOrders,
        orders_preparing: ordersPreparing,
        orders_ready: ordersReady,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        total_sales_amount: Number(totalSales.toFixed(2)),
        average_prep_time_minutes: avgPrepTime,
        most_ordered_food: mostOrderedItem,
        least_ordered_food: leastOrderedItem,
        peak_ordering_time: peakHoursData.predicted_peak_window,
        hourly_distribution: peakHoursData.hourly_distribution
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate dashboard metrics.', error: error.message });
  }
};

/**
 * Get AI Predictions & Insights
 */
const getAIPredictions = async (req, res) => {
  try {
    const ordersSnap = await db.collection('orders').get();
    const orders = ordersSnap.docs.map(d => d.data());

    const menuSnap = await db.collection('menu_items').get();
    const menuItems = menuSnap.docs.map(d => d.data());

    const activeOrders = orders.filter(o => ['Placed', 'Accepted', 'Preparing'].includes(o.order_status));

    const peakPrediction = predictPeakHours(orders);
    const demandForecast = predictFoodDemand(orders, menuItems);
    const delayPredictions = predictOrderDelays(activeOrders, 2);
    const aiInsights = generateAISalesInsights(orders);

    return res.status(200).json({
      success: true,
      data: {
        peak_time_prediction: peakPrediction,
        food_demand_forecast: demandForecast,
        order_delay_predictions: delayPredictions,
        ai_management_insights: aiInsights
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AI predictions.', error: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getAIPredictions
};
