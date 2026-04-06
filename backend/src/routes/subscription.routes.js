'use strict';

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/upcoming', subscriptionController.getUpcoming);
router.get('/', subscriptionController.getAll);
router.post('/', subscriptionController.create);
router.put('/:id', subscriptionController.update);
router.delete('/:id', subscriptionController.remove);

module.exports = router;
