// src/utils/seeder.js
const bcrypt = require('bcryptjs');
const { User, Setting } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Running database seeder...');
    
    // Check if an admin user already exists
    const adminExists = await User.findOne({ where: { email: 'admin@moevit.com' } });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      
      // Create default admin user with pre-hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Admin User',
        email: 'admin@moevit.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Default admin user created.');
    } else {
      console.log('Admin user already exists.');
    }
    
    // Default settings
    const defaultSettings = [
      {
        key: 'pricing_base',
        value: { auto: 25, car: 50, bike: 15 },
        category: 'pricing',
        description: 'Base fare for different vehicle types',
        isPublic: true
      },
      {
        key: 'pricing_per_km',
        value: { auto: 12, car: 20, bike: 8 },
        category: 'pricing',
        description: 'Per kilometer pricing for different vehicle types',
        isPublic: true
      },
      {
        key: 'pricing_per_minute',
        value: { auto: 2, car: 3, bike: 1 },
        category: 'pricing',
        description: 'Per minute waiting pricing for different vehicle types',
        isPublic: true
      },
      {
        key: 'whatsapp_settings',
        value: { 
          welcome_message: 'Welcome to Moevit! How can we help you today?',
          timeout_minutes: 30
        },
        category: 'bot',
        description: 'WhatsApp bot settings',
        isPublic: false
      },
      {
        key: 'service_areas',
        value: ['Mumbai', 'Thane', 'Navi Mumbai'],
        category: 'service',
        description: 'Areas where service is available',
        isPublic: true
      }
    ];
    
    // Upsert all default settings
    for (const setting of defaultSettings) {
      const [settingRecord, created] = await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
      
      if (!created) {
        await settingRecord.update(setting);
      }
    }
    
    console.log('Default settings created/updated.');
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Export for use elsewhere
module.exports = seedDatabase;