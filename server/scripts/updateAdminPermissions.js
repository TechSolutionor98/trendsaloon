import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    const targetEmail = 'secureadmin@trendsaloon.com';
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`User ${targetEmail} not found!`);
      return;
    }

    console.log('Existing User Found:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);

    // Set minimal permissions for secureadmin (only Dashboard, Services, Products, Orders, Banners)
    user.isAdmin = true;
    user.isSuperAdmin = false;
    user.adminPermissions = {
      fullAccess: false,
      dashboard: true,
      services: true,
      products: true,
      orders: true,
      banners: true,
      categories: false,
      subcategories: false,
      brands: false,
      quotations: false,
      users: false,
      reviews: false,
      blogs: false,
      homeSections: false,
      offerPages: false,
      gamingZone: false,
      coupons: false,
      deliveryCharges: false,
      settings: false,
      emailTemplates: false,
      newsletter: false,
      requestCallbacks: false,
      bulkPurchase: false,
      buyerProtection: false,
      stockAdjustment: false,
      seoSettings: false,
      cache: false,
      volumes: false,
      warranty: false,
      colors: false,
      units: false,
      tax: false,
      sizes: false,
      adminManagement: false,
      activityLogs: false,
      appDiscounts: false,
      loyalty: false,
      referrals: false,
      pushNotifications: false,
      whatsapp: false,
    };

    await user.save();
    console.log('--- UPDATED SUCCESSFULLY ---');
    console.log('isAdmin:', user.isAdmin);
    console.log('isSuperAdmin:', user.isSuperAdmin);
    console.log('Admin Permissions:', user.adminPermissions);

  } catch (err) {
    console.error('Error updating permissions:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
})();
