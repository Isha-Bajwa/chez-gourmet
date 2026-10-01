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

// Manager / Admin protected routes
router.post('/', authenticateUser, authorizeRoles('manager', 'admin'), createMenuItem);
router.put('/:id', authenticateUser, authorizeRoles('manager', 'admin'), updateMenuItem);
router.patch('/:id/status', authenticateUser, authorizeRoles('manager', 'admin', 'staff'), updateMenuItemStatus);
router.delete('/:id', authenticateUser, authorizeRoles('manager', 'admin'), deleteMenuItem);

module.exports = router;
