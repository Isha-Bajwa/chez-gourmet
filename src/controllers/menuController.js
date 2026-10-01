const { db } = require('../config/firebase');

let menuCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache

function clearMenuCache() {
  menuCache = null;
  lastCacheTime = 0;
}

/**
 * Get all menu items with optional category search, status filter
 */
const getMenuItems = async (req, res) => {
  try {
    const { category, search, available_only } = req.query;

    const now = Date.now();
    let items;

    if (menuCache && (now - lastCacheTime < CACHE_TTL_MS)) {
      items = menuCache;
    } else {
      const snapshot = await db.collection('menu_items').get();
      items = snapshot.docs.map(doc => doc.data());
      menuCache = items;
      lastCacheTime = now;
    }

    let filteredItems = [...items];

    if (category) {
      filteredItems = filteredItems.filter(item => (item.category || '').toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.item_name || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }

    if (available_only === 'true') {
      filteredItems = filteredItems.filter(item => item.status === 'Available' || item.status === 'Limited');
    }

    return res.status(200).json({
      success: true,
      count: filteredItems.length,
      data: filteredItems
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch menu items.', error: error.message });
  }
};

/**
 * Get single menu item by ID
 */
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('menu_items').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    return res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch menu item.', error: error.message });
  }
};

/**
 * Create new menu item (Manager / Admin)
 */
const createMenuItem = async (req, res) => {
  try {
    const { item_name, category, price, available_quantity, preparation_time, image, description } = req.body;

    if (!item_name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Item name and price are required.' });
    }

    const itemId = `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const qty = Number(available_quantity || 0);

    const newItem = {
      item_id: itemId,
      id: itemId,
      item_name,
      category: category || 'General',
      price: Number(price),
      available_quantity: qty,
      preparation_time: Number(preparation_time || 8),
      status: qty > 5 ? 'Available' : qty > 0 ? 'Limited' : 'Sold Out',
      image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
      description: description || '',
      created_at: new Date().toISOString()
    };

    await db.collection('menu_items').doc(itemId).set(newItem);
    clearMenuCache();

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      data: newItem
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create menu item.', error: error.message });
  }
};

/**
 * Update menu item details or stock (Manager / Admin)
 */
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const docRef = db.collection('menu_items').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    if (updateData.available_quantity !== undefined) {
      const qty = Number(updateData.available_quantity);
      if (qty <= 0) {
        updateData.status = 'Sold Out';
      } else if (qty <= 5 && updateData.status !== 'Temporarily Unavailable') {
        updateData.status = 'Limited';
      } else if (updateData.status !== 'Temporarily Unavailable') {
        updateData.status = 'Available';
      }
    }

    updateData.updated_at = new Date().toISOString();

    await docRef.update(updateData);
    clearMenuCache();
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully.',
      data: updatedDoc.data()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update menu item.', error: error.message });
  }
};

/**
 * Quick toggle status
 */
const updateMenuItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Available', 'Limited', 'Sold Out', 'Temporarily Unavailable'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const docRef = db.collection('menu_items').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    await docRef.update({ status, updated_at: new Date().toISOString() });
    clearMenuCache();

    return res.status(200).json({
      success: true,
      message: `Menu item status changed to ${status}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update status.', error: error.message });
  }
};

/**
 * Delete menu item (Manager / Admin)
 */
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('menu_items').doc(id).delete();
    clearMenuCache();

    return res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete menu item.', error: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  updateMenuItemStatus,
  deleteMenuItem,
  clearMenuCache
};
