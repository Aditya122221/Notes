import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Note from '../models/Note.js';

export { Tenant, User, Note };

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) {
    console.log('Database already initialized, skipping...');
    return;
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Create indexes for better performance (ignore errors if they already exist)
    try {
      await Tenant.createIndexes();
      await User.createIndexes();
      await Note.createIndexes();
    } catch (error) {
      if (error.code !== 86) { // Ignore index conflict errors
        throw error;
      }
      console.log('Some indexes already exist, continuing...');
    }

    // Seed database with default data
    await seedDatabase();

    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    // Check if data already exists
    const existingTenants = await Tenant.countDocuments();
    if (existingTenants > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Create tenants
    const acmeTenant = new Tenant({
      slug: 'acme',
      name: 'Acme Corporation',
      plan: 'free',
      noteLimit: 3
    });
    await acmeTenant.save();

    const globexTenant = new Tenant({
      slug: 'globex',
      name: 'Globex Corporation',
      plan: 'free',
      noteLimit: 3
    });
    await globexTenant.save();

    // Hash password for all users
    const passwordHash = await bcrypt.hash('password', 10);

    // Create users
    const users = [
      {
        tenant: acmeTenant._id,
        email: 'admin@acme.test',
        passwordHash: passwordHash,
        role: 'admin'
      },
      {
        tenant: acmeTenant._id,
        email: 'user@acme.test',
        passwordHash: passwordHash,
        role: 'member'
      },
      {
        tenant: globexTenant._id,
        email: 'admin@globex.test',
        passwordHash: passwordHash,
        role: 'admin'
      },
      {
        tenant: globexTenant._id,
        email: 'user@globex.test',
        passwordHash: passwordHash,
        role: 'member'
      }
    ];

    await User.insertMany(users);

    console.log('Default tenants and users created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}