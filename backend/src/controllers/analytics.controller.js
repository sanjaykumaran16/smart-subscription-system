'use strict';

const { prisma } = require('../config/db');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

async function getCached(key) {
  try {
    const redis = getRedis();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setCache(key, data) {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL);
  } catch {
    /* cache failures are non-fatal */
  }
}

async function invalidateUserCache(userId) {
  try {
    const redis = getRedis();
    const keys = await redis.keys(`analytics:${userId}:*`);
    if (keys.length) await redis.del(...keys);
  } catch { /* ignore */ }
}

async function getTotalSpend(req, res, next) {
  try {
    const cacheKey = `analytics:${req.user.id}:spend`;
    const cached = await getCached(cacheKey);
    if (cached) return res.json(cached);

    const subs = await prisma.subscription.findMany({
      where: { userId: req.user.id, status: 'active' },
    });

    let monthlyTotal = 0;
    for (const s of subs) {
      if (s.billingCycle === 'monthly') monthlyTotal += s.cost;
      else if (s.billingCycle === 'annually') monthlyTotal += s.cost / 12;
      else if (s.billingCycle === 'weekly') monthlyTotal += s.cost * 4.33;
    }

    const result = {
      monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
      annualTotal: parseFloat((monthlyTotal * 12).toFixed(2)),
      activeCount: subs.length,
    };

    await setCache(cacheKey, result);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getByCategory(req, res, next) {
  try {
    const cacheKey = `analytics:${req.user.id}:by-category`;
    const cached = await getCached(cacheKey);
    if (cached) return res.json(cached); // cached is always the full { categories: [...] } object

    const subs = await prisma.subscription.findMany({
      where: { userId: req.user.id, status: 'active' },
    });

    const categoryMap = {};
    for (const s of subs) {
      let monthly = Number(s.cost);
      if (s.billingCycle === 'annually') monthly = monthly / 12;
      else if (s.billingCycle === 'weekly') monthly = monthly * 4.33;
      categoryMap[s.category] = (categoryMap[s.category] || 0) + monthly;
    }

    const categories = Object.entries(categoryMap).map(([category, monthlyTotal]) => ({
      category,
      monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
      annualTotal:  parseFloat((monthlyTotal * 12).toFixed(2)),
    }));

    const response = { categories };
    await setCache(cacheKey, response); // cache the full response object
    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getTrend(req, res, next) {
  try {
    const cacheKey = `analytics:${req.user.id}:trend`;
    const cached = await getCached(cacheKey);
    if (cached) return res.json(cached); // cached is always the full { trend: [...] } object

    const subs = await prisma.subscription.findMany({
      where: { userId: req.user.id },
    });

    // Build last 6 months array
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        total: 0,
      });
    }

    for (const s of subs) {
      if (s.status === 'cancelled') continue;
      const created = new Date(s.createdAt);

      for (const m of months) {
        const monthDate = new Date(m.year, m.month, 1);
        if (created <= monthDate) {
          let monthly = Number(s.cost);
          if (s.billingCycle === 'annually') monthly = monthly / 12;
          else if (s.billingCycle === 'weekly') monthly = monthly * 4.33;
          m.total += monthly;
        }
      }
    }

    const trend = months.map((m) => ({
      label: m.label,
      total: parseFloat(m.total.toFixed(2)),
    }));

    const response = { trend };
    await setCache(cacheKey, response); // cache the full response object
    res.json(response);
  } catch (error) {
    next(error);
  }
}

module.exports = { getTotalSpend, getByCategory, getTrend };
