#!/usr/bin/env node

/**
 * 🔐 Admin Account Setup Script
 * 
 * This script creates or updates an admin account in MongoDB with:
 * - Email from ADMIN_EMAIL environment variable
 * - Password from ADMIN_PASSWORD environment variable
 * - Hashed password using bcryptjs
 * - isAdmin flag set to true
 * 
 * Usage:
 * node setup-admin.js
 * 
 * Example output:
 * ✅ Admin account created successfully!
 * 📧 Email: ndiayeabdoumamesaye1234@gmail.com
 * 👑 Is Admin: true
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env');
console.log(`📁 Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ .env file not found:', result.error.message);
  process.exit(1);
}

async function setupAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPhone = process.env.ADMIN_PHONE || '76 204 81 19';

    // Validation
    if (!adminEmail || !adminPassword) {
      console.error('❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD missing in .env');
      process.exit(1);
    }

    console.log('\n🔐 Admin Account Setup');
    console.log('═══════════════════════════════════════\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    console.log(`🔍 Checking if admin exists: ${adminEmail}`);
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log('📋 Admin account found. Updating...');
      
      // Update existing admin
      admin.isAdmin = true;
      admin.phone = adminPhone;
      admin.fullName = admin.fullName || 'Abdoul Khadre Ndiaye';
      admin.password = adminPassword; // Will be hashed by pre-save middleware
      
      await admin.save();
      console.log('✅ Admin account updated successfully!\n');
    } else {
      console.log('🆕 Creating new admin account...');
      
      // Create new admin
      admin = new User({
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save middleware
        fullName: 'Abdoul Khadre Ndiaye',
        phone: adminPhone,
        isAdmin: true
      });
      
      await admin.save();
      console.log('✅ Admin account created successfully!\n');
    }

    // Display account details
    console.log('📊 Admin Account Details:');
    console.log('═══════════════════════════════════════');
    console.log(`📧 Email:        ${admin.email}`);
    console.log(`👤 Full Name:    ${admin.fullName}`);
    console.log(`📱 Phone:        ${admin.phone}`);
    console.log(`👑 Is Admin:     ${admin.isAdmin}`);
    console.log(`🆔 MongoDB ID:   ${admin._id}`);
    console.log(`📅 Created At:   ${admin.createdAt}`);
    console.log('═══════════════════════════════════════\n');

    // Instructions
    console.log('✨ Next Steps:');
    console.log('─────────────────────────────────────────');
    console.log('1️⃣  Start the backend server: npm run dev');
    console.log('2️⃣  Start the frontend: npm run dev (in root)');
    console.log('3️⃣  Go to: http://localhost:8080/auth');
    console.log('4️⃣  Click 🔐 Admin button');
    console.log(`5️⃣  Login with email: ${adminEmail}`);
    console.log(`6️⃣  Enter password: ${adminPassword}`);
    console.log('7️⃣  Access admin dashboard: http://localhost:8080/admin');
    console.log('─────────────────────────────────────────\n');

    console.log('🎉 Admin setup complete!\n');

  } catch (error) {
    console.error('\n❌ Setup Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}


// Run the setup
setupAdmin();
