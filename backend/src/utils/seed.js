'use strict';

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_USER = {
  name: 'Alex Johnson',
  email: 'demo@smartsub.io',
  password: 'demo1234',
  currency: 'USD',
};

const SAMPLE_SUBSCRIPTIONS = [
  {
    name: 'Netflix',
    category: 'streaming',
    cost: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    status: 'active',
    logo: '🎬',
    notes: 'Family plan — 4K streaming',
  },
  {
    name: 'Spotify',
    category: 'streaming',
    cost: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    status: 'active',
    logo: '🎵',
    notes: 'Premium individual plan',
  },
  {
    name: 'GitHub Copilot',
    category: 'software',
    cost: 10.0,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: 'active',
    logo: '🤖',
    notes: 'AI pair programmer',
  },
  {
    name: 'Adobe Creative Cloud',
    category: 'software',
    cost: 599.88,
    currency: 'USD',
    billingCycle: 'annually',
    nextBillingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    status: 'active',
    logo: '🎨',
    notes: 'All apps plan',
  },
  {
    name: 'Gym Membership',
    category: 'fitness',
    cost: 45.0,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days!
    status: 'active',
    logo: '🏋️',
    notes: 'Downtown fitness center',
  },
  {
    name: 'HelloFresh',
    category: 'food',
    cost: 59.94,
    currency: 'USD',
    billingCycle: 'weekly',
    nextBillingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days — urgent!
    status: 'active',
    logo: '🥗',
    notes: '3 meals for 2 people per week',
  },
  {
    name: 'Xbox Game Pass Ultimate',
    category: 'gaming',
    cost: 14.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: 'active',
    logo: '🎮',
    notes: 'Console + PC + Cloud',
  },
  {
    name: 'Notion Pro',
    category: 'software',
    cost: 96.0,
    currency: 'USD',
    billingCycle: 'annually',
    nextBillingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    status: 'paused',
    logo: '📋',
    notes: 'Team workspace — paused during trial of Obsidian',
  },
];

async function seed() {
  console.log('🌱 Starting seed...');

  // Upsert demo user
  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password: hashedPassword,
      currency: DEMO_USER.currency,
    },
  });

  console.log(`✅ Demo user: ${user.email} (id: ${user.id})`);

  // Remove old subscriptions for this user
  await prisma.subscription.deleteMany({ where: { userId: user.id } });

  // Create fresh subscriptions
  for (const sub of SAMPLE_SUBSCRIPTIONS) {
    const created = await prisma.subscription.create({
      data: { ...sub, userId: user.id },
    });
    console.log(`   📦 Created subscription: ${created.name} (${created.status})`);
  }

  console.log(`\n🎉 Seed complete! ${SAMPLE_SUBSCRIPTIONS.length} subscriptions created.`);
  console.log(`   Login with: ${DEMO_USER.email} / ${DEMO_USER.password}`);
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
