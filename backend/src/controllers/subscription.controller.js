'use strict';

const subscriptionService = require('../services/subscription.service');
const { activeSubscriptionsGauge } = require('../utils/metrics');

async function getAll(req, res, next) {
  try {
    const { category, status, search } = req.query;
    const subscriptions = await subscriptionService.getAllByUser(req.user.id, {
      category,
      status,
      search,
    });

    // Update Prometheus gauge
    const activeCount = subscriptions.filter((s) => s.status === 'active').length;
    activeSubscriptionsGauge.set({ userId: req.user.id }, activeCount);

    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const subscription = await subscriptionService.create(req.user.id, req.body);
    res.status(201).json({ subscription });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const subscription = await subscriptionService.update(req.params.id, req.user.id, req.body);
    res.json({ subscription });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await subscriptionService.remove(req.params.id, req.user.id);
    res.json({ message: 'Subscription deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function getUpcoming(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 7;
    const subscriptions = await subscriptionService.getUpcoming(req.user.id, days);
    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove, getUpcoming };
