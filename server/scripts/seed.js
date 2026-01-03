import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import SalarySlip from '../models/SalarySlip.js';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll_db';

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await SalarySlip.deleteMany({});
    await Expense.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Check if admin already exists (only 1 admin allowed)
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      // Create demo admin user (only if no admin exists)
      admin = await User.create({
        name: 'Admin User',
        email: 'hire-me@anshumat.org',
        password: 'HireMe@2025!',
        role: 'admin'
      });
      console.log('✅ Created admin user:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists:', admin.email);
    }

    // Create employee user
    let employee = await User.findOne({ email: 'john.doe@example.com' });
    if (!employee) {
      employee = await User.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'employee'
      });
      console.log('✅ Created employee user:', employee.email);
    } else {
      console.log('ℹ️  Employee user already exists:', employee.email);
    }


    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nCredentials:');
    console.log('\nAdmin:');
    console.log('  Email: hire-me@anshumat.org');
    console.log('  Password: HireMe@2025!');
    console.log('\nEmployee:');
    console.log('  Email: john.doe@example.com');
    console.log('  Password: password123');
    console.log('\nNote: No sample data (salary slips or expenses) has been created.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();

