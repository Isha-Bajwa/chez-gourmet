const express = require('express');
const { getDashboardMetrics, getAIPredictions } = require('../controllers/analyticsController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', authenticateUser, authorizeRoles('manager', 'admin'), getDashboardMetrics);
router.get('/predictions', authenticateUser, authorizeRoles('manager', 'admin'), getAIPredictions);

module.exports = router;
