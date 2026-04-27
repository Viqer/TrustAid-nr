/* eslint-disable no-console */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const Ngo = require('../models/Ngo');
const Campaign = require('../models/Campaign');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error('Missing MONGO_URI (or MONGODB_URI) in environment variables.');
}

const STATIC_WALLETS = {
  // Pre-generated values equivalent to ethers.Wallet.createRandom().address outputs.
  donor: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  admin: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  ngo: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
};

async function seed() {
  await mongoose.connect(MONGO_URI);

  try {
    await Promise.all([
      User.deleteMany({}),
      Ngo.deleteMany({}),
      Campaign.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash('password123', 10);

    const [donorUser, adminUser, ngoUser] = await User.insertMany([
      {
        firstName: 'Test',
        lastName: 'Donor',
        email: 'donor@test.com',
        password: hashedPassword,
        role: 'DONOR',
        isVerified: true,
        walletAddress: STATIC_WALLETS.donor,
      },
      {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        walletAddress: STATIC_WALLETS.admin,
      },
      {
        firstName: 'Hope',
        lastName: 'Foundation',
        email: 'ngo@test.com',
        password: hashedPassword,
        role: 'NGO',
        isVerified: true,
        walletAddress: STATIC_WALLETS.ngo,
      },
    ]);

    const ngo = await Ngo.create({
      userId: ngoUser._id,
      organizationName: 'Hope Foundation',
      registrationNumber: 'HF-REG-2026-001',
      description: 'Providing emergency aid, education support, and community healthcare programs.',
      website: 'https://hopefoundation.example.org',
      phone: '+91-9000000000',
      walletAddress: STATIC_WALLETS.ngo,
      address: {
        street: '21 Hope Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
      },
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Auto-verified in seed data.',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
      isActive: true,
    });

    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const oneTwentyDaysFromNow = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

    await Campaign.insertMany([
      {
        ngoId: ngo._id,
        title: 'Clean Water Access for Rural Families',
        description: 'Help install sustainable water filtration units in villages lacking safe drinking water.',
        longDescription: 'This campaign funds filtration units, storage tanks, and local maintenance training for underserved communities.',
        goalAmount: 500000,
        raisedAmount: 0,
        currency: 'INR',
        category: 'POVERTY',
        status: 'ACTIVE',
        isActive: true,
        startDate: now,
        deadline: ninetyDaysFromNow,
        tags: ['water', 'rural', 'health'],
      },
      {
        ngoId: ngo._id,
        title: 'School Kits for 1,000 Children',
        description: 'Provide school supplies, uniforms, and learning materials to children in need.',
        longDescription: 'This initiative covers complete academic starter kits and local distribution support before the next school term.',
        goalAmount: 350000,
        raisedAmount: 0,
        currency: 'INR',
        category: 'EDUCATION',
        status: 'ACTIVE',
        isActive: true,
        startDate: now,
        deadline: oneTwentyDaysFromNow,
        tags: ['education', 'children', 'supplies'],
      },
    ]);

    // Keep references to avoid accidental lint removals in editors and to document seeded principals.
    void donorUser;

    console.log('Seeded successfully');
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
});
