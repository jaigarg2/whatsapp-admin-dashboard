// server.js
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

// Import database connection
const { connectDB } = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const rideRoutes = require('./src/routes/rideRoutes');
const settingRoutes = require('./src/routes/settingRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));
// Add this near your middleware setup
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Update your routes to use the /admin prefix
app.use('/admin/api/auth', authRoutes);
app.use('/admin/api/users', userRoutes);  
app.use('/admin/api/drivers', driverRoutes);
app.use('/admin/api/rides', rideRoutes);
app.use('/admin/api/settings', settingRoutes);
app.use('/admin/api/dashboard', dashboardRoutes);

// Update your frontend routes
app.get('/admin', (req, res) => {
  res.render('login');
});

app.get('/admin/dashboard', (req, res) => {
  res.render('dashboard');
});

// Update other frontend routes similarly

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve frontend routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/rides', (req, res) => {
  res.render('rides');
});

app.get('/drivers', (req, res) => {
  res.render('drivers');
});

app.get('/users', (req, res) => {
  res.render('users');
});

app.get('/settings', (req, res) => {
  res.render('settings');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});