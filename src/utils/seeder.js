const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Setting = require('../models/Setting');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Seed data
const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@moevit.com' });

    if (!adminExists) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        name: 'Admin User',
        email: 'admin@moevit.com',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Seed default settings
    const pricingSettings = [
      {
        category: 'pricing',
        name: 'base_fare_auto',
        value: 30,
        description: 'Base fare for auto rides in INR',
        isActive: true
      },
      {
        category: 'pricing',
        name: 'base_fare_car',
        value: 50,
        description: 'Base fare for car rides in INR',
        isActive: true
      },
      {
        category: 'pricing',
        name: 'base_fare_bike',
        value: 20,
        description: 'Base fare for bike rides in INR',
        isActive: true
      },
      {
        category: 'pricing',
        name: 'per_km_rate_auto',
        value: 15,
        description: 'Per kilometer rate for auto rides in INR',
        isActive: true
      },
      {
        category: 'pricing',
        name: 'per_km_rate_car',
        value: 20,
        description: 'Per kilometer rate for car rides in INR',
        isActive: true
      },
      {
        category: 'pricing',
        name: 'per_km_rate_bike',
        value: 10,
        description: 'Per kilometer rate for bike rides in INR',
        isActive: true
      }
    ];

    // Insert pricing settings if they don't exist
    for (const setting of pricingSettings) {
      const exists = await Setting.findOne({ category: setting.category, name: setting.name });
      if (!exists) {
        await Setting.create(setting);
        console.log(`Created setting: ${setting.category}.${setting.name}`);
      }
    }

    // Create some system settings
    const systemSettings = [
      {
        category: 'system',
        name: 'driver_search_radius',
        value: 5,
        description: 'Radius in kilometers to search for available drivers',
        isActive: true
      },
      {
        category: 'system',
        name: 'driver_assignment_timeout',
        value: 30,
        description: 'Time in seconds before driver assignment times out',
        isActive: true
      },
      {
        category: 'system',
        name: 'ride_cancellation_fee',
        value: 25,
        description: 'Fee charged for ride cancellation after driver assignment in INR',
        isActive: true
      }
    ];

    // Insert system settings if they don't exist
    for (const setting of systemSettings) {
      const exists = await Setting.findOne({ category: setting.category, name: setting.name });
      if (!exists) {
        await Setting.create(setting);
        console.log(`Created setting: ${setting.category}.${setting.name}`);
      }
    }

    console.log('Database seeding completed');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();