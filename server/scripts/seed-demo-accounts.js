require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/modules/user/user.model');
const Company = require('../src/modules/company/company.model');

const PASSWORD = 'Tradafy@123';

const demoCompanies = [
  {
    name: 'Northbridge Commodities',
    country: 'Netherlands',
    city: 'Rotterdam',
    industry: 'Food & Agriculture',
    companyType: 'Supplier',
    yearEstablished: 2012,
    numberOfEmployees: '51-200',
    website: 'https://northbridge-commodities.example',
    mainProducts: ['Bulk grains', 'Edible oils', 'Food ingredients'],
    exportMarkets: ['Europe', 'Middle East', 'Africa'],
    verificationStatus: 'verified',
    subscriptionPlan: 'business',
    subscriptionStatus: 'active',
  },
  {
    name: 'Apex Bulk Traders',
    country: 'India',
    city: 'Mumbai',
    industry: 'Industrial Commodities',
    companyType: 'Supplier',
    yearEstablished: 2015,
    numberOfEmployees: '11-50',
    website: 'https://apex-bulk-traders.example',
    mainProducts: ['Construction materials', 'Metals', 'Industrial inputs'],
    exportMarkets: ['Asia', 'Africa', 'GCC'],
    verificationStatus: 'verified',
    subscriptionPlan: 'business',
    subscriptionStatus: 'active',
  },
  {
    name: 'Orion Export House',
    country: 'Turkey',
    city: 'Istanbul',
    industry: 'General Trade',
    companyType: 'Supplier',
    yearEstablished: 2010,
    numberOfEmployees: '201-500',
    website: 'https://orion-export-house.example',
    mainProducts: ['Consumer goods', 'Packaging', 'Homeware'],
    exportMarkets: ['Europe', 'North America', 'Middle East'],
    verificationStatus: 'verified',
    subscriptionPlan: 'premium',
    subscriptionStatus: 'active',
  },
];

const demoUsers = [
  {
    firstName: 'Sana',
    lastName: 'Khan',
    email: 'supplier1@tradafy.test',
    phone: '+15550100001',
    roles: ['supplier'],
    companyName: 'Northbridge Commodities',
  },
  {
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'supplier2@tradafy.test',
    phone: '+15550100002',
    roles: ['supplier'],
    companyName: 'Apex Bulk Traders',
  },
  {
    firstName: 'Elif',
    lastName: 'Demir',
    email: 'supplier3@tradafy.test',
    phone: '+15550100003',
    roles: ['supplier'],
    companyName: 'Orion Export House',
  },
  {
    firstName: 'Ava',
    lastName: 'Brown',
    email: 'buyer1@tradafy.test',
    phone: '+15550100011',
    roles: ['buyer'],
  },
  {
    firstName: 'Daniel',
    lastName: 'Lopez',
    email: 'buyer2@tradafy.test',
    phone: '+15550100012',
    roles: ['buyer'],
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'buyer3@tradafy.test',
    phone: '+15550100013',
    roles: ['buyer'],
  },
  {
    firstName: 'Noah',
    lastName: 'Wilson',
    email: 'agent1@tradafy.test',
    phone: '+15550100021',
    roles: ['shipping_agent'],
  },
  {
    firstName: 'Mia',
    lastName: 'Taylor',
    email: 'agent2@tradafy.test',
    phone: '+15550100022',
    roles: ['shipping_agent'],
  },
  {
    firstName: 'Omar',
    lastName: 'Hassan',
    email: 'agent3@tradafy.test',
    phone: '+15550100023',
    roles: ['shipping_agent'],
  },
];

async function upsertCompany(company) {
  return Company.findOneAndUpdate(
    { name: company.name },
    { $set: company },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function upsertUser(userDef, companyDoc) {
  const existing = await User.findOne({ email: userDef.email }).select('+password');

  const payload = {
    firstName: userDef.firstName,
    lastName: userDef.lastName,
    email: userDef.email,
    phone: userDef.phone,
    roles: userDef.roles,
    isActive: true,
    isPhoneVerified: true,
    isEmailVerified: true,
    plan: userDef.roles.includes('supplier') ? 'business' : 'free',
    companyId: companyDoc?._id,
    password: PASSWORD,
  };

  if (!existing) {
    await User.create(payload);
    return;
  }

  existing.firstName = payload.firstName;
  existing.lastName = payload.lastName;
  existing.phone = payload.phone;
  existing.roles = payload.roles;
  existing.isActive = payload.isActive;
  existing.isPhoneVerified = payload.isPhoneVerified;
  existing.isEmailVerified = payload.isEmailVerified;
  existing.plan = payload.plan;
  existing.companyId = payload.companyId;
  existing.password = payload.password;
  await existing.save();
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const companyMap = new Map();
  for (const company of demoCompanies) {
    const savedCompany = await upsertCompany(company);
    companyMap.set(company.name, savedCompany);
  }

  for (const userDef of demoUsers) {
    const companyDoc = userDef.companyName ? companyMap.get(userDef.companyName) : null;
    await upsertUser(userDef, companyDoc);
  }

  console.log('Seeded demo accounts successfully.');
  console.log(`Shared password: ${PASSWORD}`);
}

main()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
