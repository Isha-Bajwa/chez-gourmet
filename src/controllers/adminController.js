const { db } = require('../config/firebase');
const { notificationLogs } = require('../services/notificationService');

/**
 * Get list of all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => doc.data());
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
  }
};

/**
 * Update user role (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'kitchen staff', 'canteen manager', 'administrator', 'staff', 'manager', 'admin'];
    if (!validRoles.includes((role || '').toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: customer, kitchen staff, canteen manager, administrator.`
      });
    }

    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await userRef.update({ role: role.toLowerCase(), updated_at: new Date().toISOString() });

    return res.status(200).json({ success: true, message: `User role updated to ${role}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user role.', error: error.message });
  }
};

/**
 * Update user account status (Admin only)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'suspended'

    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await userRef.update({ account_status: status, updated_at: new Date().toISOString() });
    return res.status(200).json({ success: true, message: `Account status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update account status.', error: error.message });
  }
};

/**
 * Delete a user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await userRef.delete();
    return res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.', error: error.message });
  }
};

/**
 * Get System Activity & Notification Logs
 */
const getSystemLogs = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      logs_count: notificationLogs.length,
      logs: notificationLogs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch system logs.', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getSystemLogs
};
