const { db } = require('../config/firebase');
const { prioritizeKitchenQueue } = require('../services/queueService');

/**
 * Get prioritized live kitchen queue for display (KDS)
 */
const getKitchenQueue = async (req, res) => {
  try {
    const snapshot = await db.collection('orders').get();
    const allOrders = snapshot.docs.map(doc => doc.data());

    // Filter active orders that need preparation
    const activeOrders = allOrders.filter(o => 
      ['Placed', 'Accepted', 'Preparing'].includes(o.order_status)
    );

    // Apply smart AI prioritization engine
    const prioritizedQueue = prioritizeKitchenQueue(activeOrders);

    return res.status(200).json({
      success: true,
      active_queue_count: prioritizedQueue.length,
      data: prioritizedQueue
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch kitchen queue.', error: error.message });
  }
};

/**
 * Generate dynamic 15-minute pickup slots relative to current local time
 */
function generateDynamicTimeSlots() {
  const slots = [];
  const currentTime = new Date();
  
  // Earliest allowable pre-order pickup is 15 minutes from now
  const earliestStart = new Date(currentTime.getTime() + 15 * 60000);
  
  // Round up to next 15-minute interval
  const remainder = earliestStart.getMinutes() % 15;
  if (remainder > 0) {
    earliestStart.setMinutes(earliestStart.getMinutes() + (15 - remainder), 0, 0);
  } else {
    earliestStart.setSeconds(0, 0);
  }

  const formatSlotTime = (dateObj) => {
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' becomes '12'
    const strHours = String(hours).padStart(2, '0');
    const strMinutes = String(minutes).padStart(2, '0');
    return `${strHours}:${strMinutes} ${ampm}`;
  };

  for (let i = 0; i < 12; i++) { // Generate next 12 slots (3 hours ahead into future)
    const slotStart = new Date(earliestStart.getTime() + (i * 15 * 60000));
    const slotEnd = new Date(slotStart.getTime() + (15 * 60000));
    
    const slotName = `${formatSlotTime(slotStart)} - ${formatSlotTime(slotEnd)}`;
    slots.push(slotName);
  }

  return slots;
}

/**
 * Get scheduled pickup slots and current booking levels
 */
const getPickupSlots = async (req, res) => {
  try {
    const dynamicSlots = generateDynamicTimeSlots();

    const snapshot = await db.collection('orders').get();
    const allOrders = snapshot.docs.map(doc => doc.data());

    const maxSlotLimit = 20;

    const slotsData = dynamicSlots.map(slotName => {
      const ordersInSlot = allOrders.filter(o => o.pickup_time === slotName && o.order_status !== 'Cancelled');
      const count = ordersInSlot.length;
      
      return {
        slot_name: slotName,
        max_limit: maxSlotLimit,
        current_orders: count,
        available_slots: Math.max(maxSlotLimit - count, 0),
        status: count >= maxSlotLimit ? 'Full' : count >= (maxSlotLimit * 0.75) ? 'Filling Fast' : 'Available'
      };
    });

    return res.status(200).json({
      success: true,
      data: slotsData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pickup slots.', error: error.message });
  }
};

module.exports = {
  getKitchenQueue,
  getPickupSlots,
  generateDynamicTimeSlots
};
