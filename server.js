// server.js - final version
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

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
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

app.get('/login', (req, res) => {
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

// Test login endpoint kept for troubleshooting
app.get('/test-login', (req, res) => {
  res.render('test-login');
});

app.post('/test-login-api', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Test Login API:', { email, password });
    
    // Get the user from database
    const { User } = require('./src/models');
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('No user found with this email');
      return res.json({ success: false, message: 'User not found' });
    }
    
    console.log('Found user:', { id: user.id, email: user.email });
    console.log('Stored password hash:', user.password);
    
    // Try direct comparison
    const bcrypt = require('bcryptjs');
    
    // Create a new hash with the input password for comparison
    const salt = await bcrypt.genSalt(10);
    const freshHash = await bcrypt.hash(password, salt);
    console.log('Fresh hash for entered password:', freshHash);
    
    // Try the normal compare
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt compare result:', isMatch);
    
    // For testing, create a valid token regardless
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
    
    return res.json({
      success: isMatch,
      message: isMatch ? 'Login successful' : 'Password does not match',
      token: token,
      passwordDetails: {
        enteredPassword: password,
        storedHash: user.password,
        freshHash: freshHash,
        matches: isMatch
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.json({ success: false, message: error.message, stack: error.stack });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

// Create fresh admin user
// Add this to your server.js temporarily
setTimeout(async () => {
  try {
    const { User } = require('./src/models');
    
    // Delete all existing admin users
    await User.destroy({ where: { email: 'admin@moevit.com' } });
    console.log('Deleted all existing admin users');
    
    // Create a new admin user with a known hash
    // This hash is for 'admin123'
    const knownHash = '$2a$10$JvRlMRPYRXtXp82fY8Bbp.zS/Ecs4e7nVP7dn7aGQFiGDUK4a/Tti';
    
    const newAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@moevit.com',
      password: knownHash,
      role: 'admin'
    }, {
      hooks: false // Skip the password hashing hooks
    });
    
    console.log('Created admin user with known hash');
    
    // Test with bcrypt directly
    const bcrypt = require('bcryptjs');
    const directTest = await bcrypt.compare('admin123', knownHash);
    console.log('Direct test with known hash:', directTest);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}, 3000);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});