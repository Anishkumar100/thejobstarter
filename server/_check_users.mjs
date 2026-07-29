import mongoose from 'mongoose';
import User from './models/User.js';
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import dotenv from 'dotenv';
dotenv.config();

const cf = new Cashfree(CFEnvironment.SANDBOX, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);
cf.XApiVersion = '2022-09-01';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa');
  
  const users = await User.find({ username: { $regex: /profit|avian/i } }).lean();
  console.log('Found users:', users.length);
  for (const u of users) {
    console.log('---');
    console.log('username:', u.username);
    console.log('displayName:', u.displayName);
    console.log('subscription:', JSON.stringify(u.subscription, null, 2));
    
    if (u.subscription?.cashfreeSubscriptionId) {
      try {
        const sub = await cf.SubsFetchSubscription(u.subscription.cashfreeSubscriptionId);
        console.log('Cashfree status:', sub?.data?.subscription_status, '| payment_status:', sub?.data?.payment_status);
      } catch(e) {
        console.error('Cashfree fetch error:', e.response?.data?.message || e.message);
      }
    }
  }
  
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
