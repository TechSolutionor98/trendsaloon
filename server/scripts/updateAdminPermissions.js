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
    console.log('isAdmin:', user.isAdmin);
    console.log('isSuperAdmin:', user.isSuperAdmin);
    console.log('Current Permissions:', user.adminPermissions);

    // Update permissions to only services, products, orders, and dashboard
    user.isAdmin = true;
    user.isSuperAdmin = false;
    user.adminPermissions = {
      fullAccess: false,
      dashboard: true,
      services: true,
      products: true,
      orders: true,
      quotations: false,
    };

    await user.save();
    console.log('--- UPDATED SUCCESSFULLY ---');
    console.log('New isSuperAdmin:', user.isSuperAdmin);
    console.log('New Permissions:', user.adminPermissions);

  } catch (err) {
    console.error('Error updating permissions:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
})();

