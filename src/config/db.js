// src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_admin',
  process.env.DB_USER || 'whatsapp_user',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models with database
    // Note: Use {force: true} only during development
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };