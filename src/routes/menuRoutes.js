const express = require('express');
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  updateMenuItemStatus,
  deleteMenuItem
} = require('../controllers/menuController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Manager protected routes (Admin does NOT modify menu per access policy)
router.post('/', authenticateUser, authorizeRoles('manager'), createMenuItem);
router.put('/:id', authenticateUser, authorizeRoles('manager'), updateMenuItem);
router.patch('/:id/status', authenticateUser, authorizeRoles('manager', 'staff'), updateMenuItemStatus);
router.delete('/:id', authenticateUser, authorizeRoles('manager'), deleteMenuItem);

module.exports = router;
