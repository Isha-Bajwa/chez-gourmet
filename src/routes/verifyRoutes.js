const express = require('express');
const { verifyToken, confirmCollection } = require('../controllers/verifyController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/token', authenticateUser, authorizeRoles('staff', 'manager', 'admin'), verifyToken);
router.post('/collect', authenticateUser, authorizeRoles('staff', 'manager', 'admin'), confirmCollection);

module.exports = router;
