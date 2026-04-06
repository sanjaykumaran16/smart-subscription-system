'use strict';

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/spend', analyticsController.getTotalSpend);
router.get('/by-category', analyticsController.getByCategory);
router.get('/trend', analyticsController.getTrend);

module.exports = router;
