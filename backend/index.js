// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// Models - Import all models here to ensure they are registered with Sequelize before sync
const Permit = require('./models/Permit');
const ChecklistStep = require('./models/ChecklistStep');
// Note: Vessel and other models should also be imported here if they exist

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/**
 * API Routes
 * Ensure that ./routes/api.js exports a Router object via 'module.exports = router'
 */
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;

/**
 * Database Synchronization
 * { alter: true } matches the models to the database tables without dropping them.
 * This is where the new 'ChecklistSteps' table will be physically created in PostgreSQL.
 */
sequelize.sync({ alter: true })
  .then(() => {
    console.log('🚢 KeelSafe Database Synced Successfully');
    
    // Listen on 0.0.0.0 to allow connections from the mobile app on the local network
    app.listen(PORT, '0.0.0.0', () => {
      console.log('---');
      console.log(`🛰️  Shore-side Server running in DEV mode on Port ${PORT}`);
      console.log(`🌍 Network Access: http://0.0.0.0:${PORT}`);
      console.log(`🔗 API Endpoint: http://localhost:${PORT}/api`);
      console.log('⚓ KeelSafe Backend active and listening for vessel heartbeats...');
      console.log('---');
    });
  })
  .catch(err => {
    console.error('❌ Database Sync Failed. Ensure PostgreSQL is running.');
    console.error('Error Details:', err);
    process.exit(1); // Exit process on critical database failure
  });