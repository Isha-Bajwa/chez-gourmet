const express = require('express');
const { getAllUsers, updateUserRole, getSystemLogs } = require('../controllers/adminController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', authenticateUser, authorizeRoles('admin'), getAllUsers);
router.patch('/users/:id/role', authenticateUser, authorizeRoles('admin'), updateUserRole);
router.get('/logs', authenticateUser, authorizeRoles('admin', 'manager'), getSystemLogs);

module.exports = router;
