const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { authenticateUser, optionalAuthenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Allow placing pre-orders with optional user authentication (guests or logged-in users)
router.post(
  '/',
  optionalAuthenticateUser,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one menu item is required.'),
    validate
  ],
  createOrder
);

router.get('/', optionalAuthenticateUser, getOrders);
router.get('/:id', optionalAuthenticateUser, getOrderById);

router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRoles('staff', 'manager', 'admin'),
  updateOrderStatus
);

router.post(
  '/:id/cancel',
  optionalAuthenticateUser,
  cancelOrder
);

module.exports = router;
