import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'superadmin@trendsaloon.com' });
    console.log('User found:', user?.email);
    console.log('User isAdmin:', user?.isAdmin, 'isSuperAdmin:', user?.isSuperAdmin);
    console.log('Stored password hash:', user?.password);
    
    if (user) {
      const match = await bcrypt.compare('Trend@2026!', user.password);
      console.log('Direct bcrypt compare Trend@2026!:', match);
      
      const methodMatch = await user.matchPassword('Trend@2026!');
      console.log('User.matchPassword Trend@2026!:', methodMatch);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
})();
