'use strict';

const { prisma } = require('../config/db');

/**
 * Calculate next billing date based on current date and cycle.
 */
function getNextBillingDate(currentDate, billingCycle) {
  const d = new Date(currentDate);
  if (billingCycle === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (billingCycle === 'annually') d.setFullYear(d.getFullYear() + 1);
  else if (billingCycle === 'weekly') d.setDate(d.getDate() + 7);
  return d;
}

async function getAllByUser(userId, filters = {}) {
  const where = { userId };

  if (filters.category) where.category = filters.category;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }

  return prisma.subscription.findMany({
    where,
    orderBy: { nextBillingDate: 'asc' },
  });
}

async function create(userId, data) {
  const {
    name,
    category = 'other',
    cost,
    currency = 'USD',
    billingCycle = 'monthly',
    nextBillingDate,
    status = 'active',
    logo,
    notes,
  } = data;

  if (!name || cost === undefined || cost === null) {
    const err = new Error('Name and cost are required.');
    err.statusCode = 400;
    throw err;
  }

  const parsedCost = parseFloat(cost);
  if (isNaN(parsedCost) || parsedCost < 0) {
    const err = new Error('Cost must be a positive number.');
    err.statusCode = 400;
    throw err;
  }

  const billingDate = nextBillingDate
    ? new Date(nextBillingDate)
    : getNextBillingDate(new Date(), billingCycle);

  return prisma.subscription.create({
    data: {
      userId,
      name,
      category,
      cost: parsedCost,
      currency,
      billingCycle,
      nextBillingDate: billingDate,
      status,
      logo: logo || null,
      notes: notes || null,
    },
  });
}

async function update(id, userId, data) {
  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    const err = new Error('Subscription not found or access denied.');
    err.statusCode = 404;
    throw err;
  }

  const updateData = {};
  const allowedFields = [
    'name', 'category', 'cost', 'currency', 'billingCycle',
    'nextBillingDate', 'status', 'logo', 'notes',
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = field === 'cost' ? parseFloat(data[field]) : data[field];
    }
  }

  if (data.nextBillingDate) {
    updateData.nextBillingDate = new Date(data.nextBillingDate);
  }

  return prisma.subscription.update({
    where: { id },
    data: updateData,
  });
}

async function remove(id, userId) {
  const existing = await prisma.subscription.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    const err = new Error('Subscription not found or access denied.');
    err.statusCode = 404;
    throw err;
  }

  return prisma.subscription.delete({ where: { id } });
}

async function getUpcoming(userId, days = 7) {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return prisma.subscription.findMany({
    where: {
      userId,
      status: 'active',
      nextBillingDate: {
        gte: now,
        lte: future,
      },
    },
    orderBy: { nextBillingDate: 'asc' },
  });
}

module.exports = { getAllByUser, create, update, remove, getUpcoming };
