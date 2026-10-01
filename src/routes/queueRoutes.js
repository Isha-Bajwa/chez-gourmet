const express = require('express');
const { getKitchenQueue, getPickupSlots } = require('../controllers/queueController');

const router = express.Router();

// Allow viewing live kitchen queue for both guests and authenticated users
router.get('/', getKitchenQueue);
router.get('/slots', getPickupSlots);

module.exports = router;
