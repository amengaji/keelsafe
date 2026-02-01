// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// We require the routes file; ensure that file has 'module.exports = router'
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('🚢 KeelSafe Database Synced');
  app.listen(PORT, () => {
    console.log(`🛰️  Shore-side Server running in DEV mode on Port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Database Sync Failed:', err);
});
