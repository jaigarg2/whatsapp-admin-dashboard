Moevit Admin Dashboard
Admin dashboard for Moevit ride-booking service. This dashboard allows operators to manage rides, drivers, users, and system settings.
Features

Authentication and user management
Ride management and tracking
Driver management and verification
Real-time statistics and analytics
System configuration and settings

Installation

Clone the repository:
Copygit clone https://github.com/jaigarg2/whatsapp-admin-dashboard.git
cd whatsapp-admin-dashboard

Install dependencies:
Copynpm install

Create a .env file in the root directory with the following variables:
CopyPORT=3000
MONGODB_URI=mongodb://localhost:27017/moevit
JWT_SECRET=moevit_dashboard_2025_secure_key_123!@#
NODE_ENV=development

Seed the database with initial data:
Copynpm run seed

Start the development server:
Copynpm run dev

Access the dashboard at http://localhost:3000

Default Admin Credentials

Email: admin@moevit.com
Password: admin123

Project Structure
Copywhatsapp-admin-dashboard/
├── src/
│   ├── config/          # Database and other configurations
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions and seeder script
├── public/              # Static files
│   ├── css/             # CSS stylesheets
│   ├── js/              # JavaScript files
│   └── images/          # Image assets
├── views/               # EJS template files
│   ├── layout.ejs       # Main layout template
│   ├── login.ejs        # Login page
│   ├── dashboard.ejs    # Dashboard home page
│   ├── rides.ejs        # Rides management page
│   ├── drivers.ejs      # Drivers management page
│   ├── users.ejs        # Users management page
│   ├── settings.ejs     # System settings page
│   └── profile.ejs      # User profile page
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
├── server.js            # Main application entry point
└── README.md            # Project documentation
API Endpoints
Authentication

POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
POST /api/auth/logout - Logout user
GET /api/auth/me - Get current user

Users

GET /api/users - Get all users
GET /api/users/:id - Get single user
POST /api/users - Create user
PUT /api/users/:id - Update user
DELETE /api/users/:id - Delete user

Drivers

GET /api/drivers - Get all drivers
GET /api/drivers/:id - Get single driver
POST /api/drivers - Create driver
PUT /api/drivers/:id - Update driver
DELETE /api/drivers/:id - Delete driver
GET /api/drivers/nearby - Get nearby drivers
PUT /api/drivers/:id/location - Update driver location
PUT /api/drivers/:id/status - Update driver status

Rides

GET /api/rides - Get all rides
GET /api/rides/:id - Get single ride
POST /api/rides - Create ride
PUT /api/rides/:id - Update ride
DELETE /api/rides/:id - Delete ride
PUT /api/rides/:id/assign - Assign driver to ride
PUT /api/rides/:id/status - Update ride status
POST /api/rides/:id/chat - Add message to ride chat history

Settings

GET /api/settings - Get all settings
GET /api/settings/:id - Get single setting
GET /api/settings/byName - Get setting by category and name
POST /api/settings - Create setting
PUT /api/settings/:id - Update setting
DELETE /api/settings/:id - Delete setting

Dashboard

GET /api/dashboard - Get dashboard statistics
GET /api/dashboard/earnings - Get earnings by period

Technologies Used

Backend:

Node.js and Express - Server framework
MongoDB with Mongoose - Database and ORM
JWT - Authentication
Bcrypt.js - Password hashing


Frontend:

EJS - Templating engine
Bootstrap 5 - CSS framework
Chart.js - Data visualization
jQuery - DOM manipulation
Font Awesome - Icons



Deployment to AWS
Prerequisites

AWS Account
EC2 Instance (t2.micro or better recommended)
Domain name (optional)

EC2 Setup

Launch an EC2 instance running Amazon Linux 2 or Ubuntu
Configure security groups to allow HTTP (80), HTTPS (443), and SSH (22)
Connect to your instance via SSH

Install Dependencies
bashCopy# Update package index
sudo apt update  # For Ubuntu
# OR
sudo yum update  # For Amazon Linux

# Install Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs  # For Ubuntu
# OR
sudo yum install -y nodejs  # For Amazon Linux

# Install MongoDB
# For Ubuntu 20.04:
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# For Amazon Linux:
# Create MongoDB repo file
echo "[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc" | sudo tee /etc/yum.repos.d/mongodb-org-5.0.repo

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
Deploy Application
bashCopy# Clone repository
git clone https://github.com/jaigarg2/whatsapp-admin-dashboard.git
cd whatsapp-admin-dashboard

# Install dependencies
npm install

# Create environment file
cat > .env << EOL
PORT=3000
MONGODB_URI=mongodb://localhost:27017/moevit
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=production
EOL

# Seed the database
npm run seed

# Start application with PM2
pm2 start server.js --name "moevit-admin"
pm2 startup
pm2 save
Configure Nginx (Optional)
bashCopy# Install Nginx
sudo apt install -y nginx  # For Ubuntu
# OR
sudo yum install -y nginx  # For Amazon Linux

# Configure Nginx
sudo nano /etc/nginx/sites-available/moevit  # For Ubuntu
# OR
sudo nano /etc/nginx/conf.d/moevit.conf  # For Amazon Linux
Add the following configuration:
Copyserver {
    listen 80;
    server_name your-domain.com;  # Or your EC2 public IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
Enable and restart Nginx:
bashCopy# For Ubuntu:
sudo ln -s /etc/nginx/sites-available/moevit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# For Amazon Linux:
sudo nginx -t
sudo systemctl restart nginx
SSL Setup with Certbot (Optional)
bashCopy# For Ubuntu:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# For Amazon Linux:
sudo yum install -y certbot python-certbot-nginx
sudo certbot --nginx -d your-domain.com
Maintenance and Monitoring
Backup MongoDB Database
bashCopy# Create a backup directory
mkdir -p ~/mongodb-backups

# Create a backup
mongodump --out ~/mongodb-backups/$(date +"%Y-%m-%d")

# Compress the backup
tar -zcvf ~/mongodb-backups/moevit-backup-$(date +"%Y-%m-%d").tar.gz ~/mongodb-backups/$(date +"%Y-%m-%d")
Logs and Monitoring
bashCopy# View application logs
pm2 logs moevit-admin

# Monitor application
pm2 monit

# View system resource usage
htop
Application Updates
bashCopy# Pull latest changes
cd ~/whatsapp-admin-dashboard
git pull

# Install dependencies if needed
npm install

# Restart application
pm2 restart moevit-admin
Security Considerations

Change Default Credentials: Immediately change the default admin credentials after first login
Regular Updates: Keep all dependencies and system packages updated
Firewall Configuration: Configure AWS security groups to limit access
HTTPS: Use SSL/TLS for production
Environment Variables: Keep sensitive information in environment variables
Access Control: Implement proper role-based access control
Regular Backups: Schedule automatic database backups

Troubleshooting
Application Won't Start

Check MongoDB is running: sudo systemctl status mongod
Verify environment variables are set correctly
Check for syntax errors in recent code changes
Examine logs: pm2 logs moevit-admin

Database Connection Issues

Verify MongoDB service is running
Check connection string in .env
Ensure MongoDB port is not blocked by firewall

Authentication Problems

Clear browser cookies and try logging in again
Reset user password if needed
Check JWT secret is consistent

License
MIT
Contributing

Fork the repository
Create a feature branch: git checkout -b feature-name
Commit changes: git commit -m 'Add feature'
Push to the branch: git push origin feature-name
Submit a pull request

Contact
