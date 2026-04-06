'use strict';

const { prisma } = require('../config/db');

/**
 * Daily cron job: check subscriptions renewing within 7 days and log alerts.
 */
async function checkUpcomingRenewals() {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 7);

    const upcoming = await prisma.subscription.findMany({
      where: {
        status: 'active',
        nextBillingDate: {
          gte: now,
          lte: future,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { nextBillingDate: 'asc' },
    });

    if (upcoming.length === 0) {
      console.log('[NOTIFY] No upcoming renewals in the next 7 days.');
      return;
    }

    for (const sub of upcoming) {
      const daysUntil = Math.ceil(
        (new Date(sub.nextBillingDate) - now) / (1000 * 60 * 60 * 24)
      );

      const urgency = daysUntil <= 3 ? '🚨 URGENT' : '📅 UPCOMING';

      console.log(
        `[NOTIFY] ${urgency} — ${sub.user.name} (${sub.user.email}): ` +
        `"${sub.name}" renews in ${daysUntil} day(s) on ` +
        `${new Date(sub.nextBillingDate).toDateString()} ` +
        `for ${sub.currency} ${sub.cost} (${sub.billingCycle})`
      );
    }

    console.log(`[NOTIFY] Checked ${upcoming.length} upcoming renewals.`);
  } catch (error) {
    console.error('[NOTIFY] Error checking renewals:', error.message);
  }
}

module.exports = { checkUpcomingRenewals };
